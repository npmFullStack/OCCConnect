// src/services/postService.js
import { supabase } from './supabaseClient'

// ============================================================
// POSTS
// ============================================================

export async function getPosts() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      content,
      color,
      created_at,
      profiles:user_id (
        username,
        avatar
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get like counts and comment counts for all posts
  const postIds = data.map((p) => p.id)

  const [likesRes, commentsRes, myLikesRes] = await Promise.all([
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
    supabase.from('post_comments').select('id, post_id').in('post_id', postIds),
    user
      ? supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ])

  const likeCounts = {}
  const commentCounts = {}
  const myLikes = new Set()

  ;(likesRes.data || []).forEach((l) => {
    likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1
  })
  ;(commentsRes.data || []).forEach((c) => {
    commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1
  })
  ;(myLikesRes.data || []).forEach((l) => myLikes.add(l.post_id))

  return data.map((post) => ({
    id: post.id,
    user_id: post.user_id,
    user: post.profiles?.username || 'Anonymous',
    avatar: post.profiles?.avatar || 1,
    content: post.content,
    color: post.color || '#4F46E5',
    time: formatRelativeTime(post.created_at),
    created_at: post.created_at,
    likes: likeCounts[post.id] || 0,
    liked: myLikes.has(post.id),
    commentCount: commentCounts[post.id] || 0,
    comments: [], // loaded lazily
    showComments: false,
  }))
}

export async function createPost({ content, color }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      content: content.trim(),
      color: color || '#4F46E5',
    })
    .select(`
      id,
      user_id,
      content,
      color,
      created_at,
      profiles:user_id (
        username,
        avatar
      )
    `)
    .single()

  if (error) throw error

  return {
    id: data.id,
    user_id: data.user_id,
    user: data.profiles?.username || 'Anonymous',
    avatar: data.profiles?.avatar || 1,
    content: data.content,
    color: data.color,
    time: 'Just now',
    created_at: data.created_at,
    likes: 0,
    liked: false,
    commentCount: 0,
    comments: [],
    showComments: false,
  }
}

export async function getUserPostCount(userId) {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error) throw error
  return count || 0
}

// ============================================================
// LIKES
// ============================================================

export async function toggleLike(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('post_likes').delete().eq('id', existing.id)
    if (error) throw error
    return { liked: false }
  } else {
    const { error } = await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: user.id,
    })
    if (error) throw error
    return { liked: true }
  }
}

// ============================================================
// COMMENTS
// ============================================================

export async function getComments(postId) {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      id,
      post_id,
      user_id,
      content,
      created_at,
      profiles:user_id (
        username,
        avatar
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return data.map((c) => ({
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    user: c.profiles?.username || 'Anonymous',
    avatar: c.profiles?.avatar || 1,
    content: c.content,
    created_at: c.created_at,
  }))
}

export async function addComment(postId, content) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(`
      id,
      post_id,
      user_id,
      content,
      created_at,
      profiles:user_id (
        username,
        avatar
      )
    `)
    .single()

  if (error) throw error

  return {
    id: data.id,
    post_id: data.post_id,
    user_id: data.user_id,
    user: data.profiles?.username || 'Anonymous',
    avatar: data.profiles?.avatar || 1,
    content: data.content,
    created_at: data.created_at,
  }
}

// ============================================================
// REPORTS
// ============================================================

export async function reportPost(postId, reason = null) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('post_reports')
    .insert({
      post_id: postId,
      reporter_id: user.id,
      reason: reason || 'No reason provided',
    })

  if (error) throw error
}

export async function hasReportedPost(postId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('post_reports')
    .select('id')
    .eq('post_id', postId)
    .eq('reporter_id', user.id)
    .maybeSingle()

  if (error) return false
  return !!data
}

// ============================================================
// HELPERS
// ============================================================

function formatRelativeTime(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  return then.toLocaleDateString()
}