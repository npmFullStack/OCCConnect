// src/hooks/useProfile.js
import { useState, useCallback } from 'react'
import { profileService } from '../services'

export function useProfile() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateProfile = useCallback(async (updates) => {
    setSaving(true)
    setError('')
    try {
      const updated = await profileService.updateMyProfile(updates)
      return updated
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setSaving(false)
    }
  }, [])

  return { updateProfile, saving, error }
}