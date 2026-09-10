// src/services/authService.js
import { supabase } from './supabaseClient'

const EMAIL_DOMAIN = '@occ-chat.local'
const usernameToEmail = (username) => `${username.toLowerCase().trim()}${EMAIL_DOMAIN}`

export async function signUp({ username, password, avatar, course }) {
  const email = usernameToEmail(username)

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username.trim(), avatar, course },
    },
  })

  if (error) throw error
  return { user: data.user, session: data.session }
}

export async function signIn({ username, password }) {
  const email = usernameToEmail(username)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return { user: data.user, session: data.session }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return () => data.subscription.unsubscribe()
}