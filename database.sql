-- database.sql
-- ============================================================
-- OCC Connect - Full Database Schema
-- Safe to re-run: uses drop-if-exists and create-or-replace
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar int default 1,
  course text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar, course)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    (new.raw_user_meta_data->>'avatar')::int,
    new.raw_user_meta_data->>'course'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 2. MATCH QUEUE
-- ============================================================
create table if not exists public.match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null unique,
  username text not null,
  avatar int default 1,
  course text,
  joined_at timestamptz default now()
);

create index if not exists match_queue_course_idx on public.match_queue (course);
create index if not exists match_queue_joined_at_idx on public.match_queue (joined_at);

alter table public.match_queue enable row level security;

-- Anyone authenticated can read the queue (for online count + matching)
drop policy if exists "Anyone can read match_queue" on public.match_queue;
create policy "Anyone can read match_queue"
  on public.match_queue for select
  to authenticated
  using (true);

-- Users can only insert their own row
drop policy if exists "Users can insert own match_queue row" on public.match_queue;
create policy "Users can insert own match_queue row"
  on public.match_queue for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can only delete their own row
drop policy if exists "Users can delete own match_queue row" on public.match_queue;
create policy "Users can delete own match_queue row"
  on public.match_queue for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- 3. CONVERSATIONS
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references auth.users on delete cascade not null,
  user_b uuid references auth.users on delete cascade not null,
  course text,
  created_at timestamptz default now(),
  ended_at timestamptz
);

create index if not exists conversations_user_a_idx on public.conversations (user_a);
create index if not exists conversations_user_b_idx on public.conversations (user_b);

alter table public.conversations enable row level security;

-- Only participants can read their conversations
drop policy if exists "Participants can read conversations" on public.conversations;
create policy "Participants can read conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- Participants can update (to set ended_at)
drop policy if exists "Participants can update conversations" on public.conversations;
create policy "Participants can update conversations"
  on public.conversations for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

-- The find_match RPC inserts rows; allow authenticated inserts
drop policy if exists "Authenticated can create conversations" on public.conversations;
create policy "Authenticated can create conversations"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = user_a or auth.uid() = user_b);


-- ============================================================
-- 4. MESSAGES
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations on delete cascade not null,
  sender_id uuid references auth.users on delete cascade not null,
  text text not null,
  status text default 'sent', -- sent | delivered | seen
  created_at timestamptz default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

-- Only participants of the conversation can read messages
drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Only participants can send messages, and sender_id must be themselves
drop policy if exists "Participants can insert messages" on public.messages;
create policy "Participants can insert messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Sender can update status (for delivered/seen tracking)
drop policy if exists "Participants can update messages" on public.messages;
create policy "Participants can update messages"
  on public.messages for update
  to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );


-- ============================================================
-- 5. find_match() RPC
-- Matches the current user with the oldest waiting user
-- in the same course. Returns conversation_id + partner info.
-- ============================================================
create or replace function public.find_match()
returns table (
  conversation_id uuid,
  partner_id uuid,
  partner_username text,
  partner_avatar int,
  partner_course text
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_my_course text;
  v_partner record;
  v_conversation_id uuid;
begin
  if v_user_id is null then
    return;
  end if;

  -- Make sure I'm in the queue
  select course into v_my_course
  from public.match_queue
  where user_id = v_user_id;

  if v_my_course is null then
    return;
  end if;

  -- Find the oldest waiting partner in the same course
  -- (must not be me, must not already be in a conversation I'm in)
  select mq.*
  into v_partner
  from public.match_queue mq
  where mq.user_id <> v_user_id
    and (v_my_course = 'not-disclose' or mq.course = v_my_course or mq.course = 'not-disclose')
  order by mq.joined_at asc
  limit 1
  for update skip locked;

  if v_partner is null then
    return;
  end if;

  -- Create the conversation
  insert into public.conversations (user_a, user_b, course)
  values (v_user_id, v_partner.user_id, v_my_course)
  returning id into v_conversation_id;

  -- Remove both users from the queue
  delete from public.match_queue
  where user_id in (v_user_id, v_partner.user_id);

  return query
    select
      v_conversation_id,
      v_partner.user_id,
      v_partner.username,
      v_partner.avatar,
      v_partner.course;
end;
$$;

grant execute on function public.find_match() to authenticated;


-- ============================================================
-- 6. REALTIME
-- Enable realtime for messages and match_queue
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_queue'
  ) then
    alter publication supabase_realtime add table public.match_queue;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end $$;