-- database.sql
-- ============================================================
-- OCC Connect - Full Database Schema
-- Safe to re-run: uses drop-if-exists and create-or-replace
--
-- FIX (this version): posts.user_id and post_comments.user_id now
-- reference public.profiles instead of auth.users. Without this,
-- Supabase cannot resolve the "profiles:user_id(username, avatar)"
-- embedded select used by postService.js, and every post insert/read
-- fails outright (which is why "New Post" appeared to do nothing).
-- This script drops and recreates public.posts, public.post_comments,
-- public.post_likes and public.post_reports, so just re-run it in
-- full against your Supabase project's SQL editor to apply the fix.
-- ============================================================

-- ============================================================
-- 0. CLEANUP (safe re-run)
-- ============================================================
drop function if exists public.find_match() cascade;
drop function if exists public.is_conversation_participant(uuid, uuid) cascade;
drop function if exists public.handle_new_user() cascade;
drop trigger if exists on_auth_user_created on auth.users;

-- Drop post-related objects (order matters due to FKs)
drop table if exists public.post_reports cascade;
drop table if exists public.post_comments cascade;
drop table if exists public.post_likes cascade;
drop table if exists public.posts cascade;

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
    coalesce((new.raw_user_meta_data->>'avatar')::int, 1),
    new.raw_user_meta_data->>'course'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

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

drop policy if exists "Anyone can read match_queue" on public.match_queue;
create policy "Anyone can read match_queue"
  on public.match_queue for select
  to authenticated
  using (true);

drop policy if exists "Users can insert own match_queue row" on public.match_queue;
create policy "Users can insert own match_queue row"
  on public.match_queue for insert
  to authenticated
  with check (auth.uid() = user_id);

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

drop policy if exists "Participants can read conversations" on public.conversations;
create policy "Participants can read conversations"
  on public.conversations for select
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Participants can update conversations" on public.conversations;
create policy "Participants can update conversations"
  on public.conversations for update
  to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

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

create or replace function public.is_conversation_participant(conv_id uuid, uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = conv_id
      and (c.user_a = uid or c.user_b = uid)
  );
$$;

drop policy if exists "Participants can read messages" on public.messages;
create policy "Participants can read messages"
  on public.messages for select
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "Participants can insert messages" on public.messages;
create policy "Participants can insert messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id, auth.uid())
  );

drop policy if exists "Participants can update messages" on public.messages;
create policy "Participants can update messages"
  on public.messages for update
  to authenticated
  using (public.is_conversation_participant(conversation_id, auth.uid()));


-- ============================================================
-- 5. POSTS (Connect Wall)
-- ============================================================
-- NOTE: user_id references public.profiles (not auth.users) so that
-- PostgREST/Supabase can resolve the "profiles:user_id(...)" embedded
-- select used in postService.js. profiles.id itself references
-- auth.users on delete cascade, so deleting a user still cascades
-- all the way down to posts.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  color text default '#4F46E5',
  created_at timestamptz default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select
  to authenticated
  using (true);

drop policy if exists "Users can create own posts" on public.posts;
create policy "Users can create own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- 6. POST LIKES
-- ============================================================
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create index if not exists post_likes_post_id_idx on public.post_likes (post_id);

alter table public.post_likes enable row level security;

drop policy if exists "Post likes are viewable by everyone" on public.post_likes;
create policy "Post likes are viewable by everyone"
  on public.post_likes for select
  to authenticated
  using (true);

drop policy if exists "Users can like posts" on public.post_likes;
create policy "Users can like posts"
  on public.post_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can unlike posts" on public.post_likes;
create policy "Users can unlike posts"
  on public.post_likes for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- 7. POST COMMENTS
-- ============================================================
-- NOTE: user_id references public.profiles for the same reason as
-- posts.user_id above (postService.js embeds "profiles:user_id(...)").
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists post_comments_post_id_idx on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

drop policy if exists "Post comments are viewable by everyone" on public.post_comments;
create policy "Post comments are viewable by everyone"
  on public.post_comments for select
  to authenticated
  using (true);

drop policy if exists "Users can add comments" on public.post_comments;
create policy "Users can add comments"
  on public.post_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.post_comments;
create policy "Users can delete own comments"
  on public.post_comments for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- 8. POST REPORTS
-- ============================================================
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts on delete cascade not null,
  reporter_id uuid references auth.users on delete cascade not null,
  reason text default 'No reason provided',
  created_at timestamptz default now(),
  unique (post_id, reporter_id)
);

create index if not exists post_reports_post_id_idx on public.post_reports (post_id);

alter table public.post_reports enable row level security;

drop policy if exists "Users can insert reports" on public.post_reports;
create policy "Users can insert reports"
  on public.post_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can view own reports" on public.post_reports;
create policy "Users can view own reports"
  on public.post_reports for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Allow anyone to count reports (needed for client-side auto-removal check)
drop policy if exists "Anyone can count reports" on public.post_reports;
create policy "Anyone can count reports"
  on public.post_reports for select
  to authenticated
  using (true);


-- ============================================================
-- 9. TRIGGER: Auto-delete posts with 5+ reports
-- ============================================================
create or replace function public.handle_post_report()
returns trigger
language plpgsql
security definer
as $$
declare
  v_report_count int;
begin
  select count(*) into v_report_count
  from public.post_reports
  where post_id = new.post_id;

  if v_report_count >= 5 then
    delete from public.posts where id = new.post_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_post_report_created on public.post_reports;
create trigger on_post_report_created
  after insert on public.post_reports
  for each row execute function public.handle_post_report();


-- ============================================================
-- 10. find_match() RPC
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
  v_existing record;
begin
  if v_user_id is null then
    return;
  end if;

  select
    c.id            as conversation_id,
    case when c.user_a = v_user_id then c.user_b else c.user_a end as partner_id,
    c.created_at
  into v_existing
  from public.conversations c
  where (c.user_a = v_user_id or c.user_b = v_user_id)
    and c.ended_at is null
    and c.created_at > now() - interval '30 seconds'
  order by c.created_at desc
  limit 1;

  if v_existing.conversation_id is not null then
    delete from public.match_queue where user_id = v_user_id;

    return query
      select
        v_existing.conversation_id,
        p.id,
        p.username,
        p.avatar,
        p.course
      from public.profiles p
      where p.id = v_existing.partner_id;
    return;
  end if;

  select course into v_my_course
  from public.match_queue
  where user_id = v_user_id;

  if v_my_course is null then
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('occ_find_match'));

  select mq.*
  into v_partner
  from public.match_queue mq
  where mq.user_id <> v_user_id
  order by mq.joined_at asc
  limit 1
  for update skip locked;

  if v_partner is null then
    return;
  end if;

  insert into public.conversations (user_a, user_b, course)
  values (v_user_id, v_partner.user_id, v_my_course)
  returning id into v_conversation_id;

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
-- 11. REALTIME
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  -- messages
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  -- conversations
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  -- match_queue
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_queue'
  ) then
    alter publication supabase_realtime add table public.match_queue;
  end if;

  -- posts
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;

  -- post_likes
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'post_likes'
  ) then
    alter publication supabase_realtime add table public.post_likes;
  end if;

  -- post_comments
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'post_comments'
  ) then
    alter publication supabase_realtime add table public.post_comments;
  end if;
end $$;

-- Replica identity for realtime DELETE events
alter table public.messages replica identity full;
alter table public.conversations replica identity full;
alter table public.match_queue replica identity full;
alter table public.posts replica identity full;
alter table public.post_likes replica identity full;
alter table public.post_comments replica identity full;
alter table public.post_reports replica identity full;