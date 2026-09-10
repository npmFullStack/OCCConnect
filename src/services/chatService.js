// src/services/chatService.js
import { supabase } from './supabaseClient'

export async function joinMatchQueue({ course, avatar, username }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  await leaveMatchQueue()

  const { data, error } = await supabase
    .from('match_queue')
    .insert({
      user_id: user.id,
      username,
      avatar,
      course,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function leaveMatchQueue() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('match_queue').delete().eq('user_id', user.id)
}

export async function tryFindMatch() {
  const { data, error } = await supabase.rpc('find_match')
  if (error) throw error
  return data?.[0] ?? null
}

// ✅ Realtime match detection: fires the instant a conversation row is
// created with me as a participant (as user_a OR user_b), instead of
// waiting for the next polling tick. Callers should still call
// tryFindMatch() when this fires, since it returns the full partner
// info (username/avatar/course) that a raw table row doesn't have.
export function subscribeToMyMatches(userId, onMatch) {
  const channelA = supabase
    .channel(`match-a:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'conversations', filter: `user_a=eq.${userId}` },
      (payload) => onMatch(payload.new)
    )
    .subscribe()

  const channelB = supabase
    .channel(`match-b:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'conversations', filter: `user_b=eq.${userId}` },
      (payload) => onMatch(payload.new)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channelA)
    supabase.removeChannel(channelB)
  }
}

export async function endConversation(conversationId) {
  const { error } = await supabase
    .from('conversations')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', conversationId)
  if (error) throw error
}

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function sendMessage({ conversationId, text }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      text: text.trim(),
      status: 'sent',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMessageStatus(messageId, status) {
  const { error } = await supabase
    .from('messages')
    .update({ status })
    .eq('id', messageId)
  if (error) throw error
}

// ✅ Fixed subscription: listen for INSERT and UPDATE, no event wildcard filter
export function subscribeToMessages(conversationId, onMessage) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onMessage(payload)
    )
    .subscribe((status) => {
      console.log('[messages] subscription status:', status)
    })

  return () => supabase.removeChannel(channel)
}