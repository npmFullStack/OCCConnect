// src/services/presenceService.js
import { supabase } from './supabaseClient'

export function createPresenceChannel(conversationId, { userId, username }, handlers = {}) {
  const channel = supabase.channel(`presence:${conversationId}`, {
    config: { presence: { key: userId } },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      handlers.onSync?.(channel.presenceState())
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      handlers.onJoin?.(key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      handlers.onLeave?.(key, leftPresences)
    })
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      handlers.onTyping?.(payload)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          username,
          typing: false,
          online_at: new Date().toISOString(),
        })
      }
    })

  return channel
}

export function broadcastTyping(channel, userId, username, isTyping) {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, username, isTyping },
  })
}