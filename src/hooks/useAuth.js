// src/hooks/useAuth.js
import { useEffect, useState, useCallback } from 'react'
import { authService, profileService } from '../services'

export function useAuth() {
  const [user, setUser] = useState(null)       // auth.users record
  const [profile, setProfile] = useState(null) // public.profiles record
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const session = await authService.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          try {
            const p = await profileService.getMyProfile()
            if (mounted) setProfile(p)
          } catch (e) {
            console.warn('Profile load failed:', e.message)
          }
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    const unsubscribe = authService.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(session.user)
        try {
          const p = await profileService.getMyProfile()
          if (mounted) setProfile(p)
        } catch (e) {
          console.warn('Profile reload failed:', e.message)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  // Re-fetch the profile row from the DB and update local state.
  // Call this after any profile update (avatar/username/course) so the
  // UI reflects the change instead of showing stale cached data.
  const refreshProfile = useCallback(async () => {
    try {
      const p = await profileService.getMyProfile()
      setProfile(p)
      return p
    } catch (e) {
      console.warn('Profile refresh failed:', e.message)
      return null
    }
  }, [])

  return { user, profile, loading, refreshProfile }
}