// src/context/AuthContext.jsx
import React, { createContext, useContext } from 'react'
import { useAuth as useAuthHook } from '../hooks/useAuth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Single shared instance for the entire app — this is what makes
  // Profile and AppLayout see the same `profile` state.
  const auth = useAuthHook()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}