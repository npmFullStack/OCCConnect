// layout/AppLayout.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Users, User, LogOut, ChevronDown, Users as UsersIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { authService, supabase } from '../services'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'

const avatarMap = { 1: avatar1, 2: avatar2, 3: avatar3 }

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)
  const dropdownRef = useRef(null)
  const presenceChannelRef = useRef(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global online users presence (Supabase Realtime Presence)
  useEffect(() => {
    if (!user) return

    let mounted = true

    const channel = supabase.channel('online_users', {
      config: { presence: { key: user.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        if (!mounted) return
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'join' }, () => {
        if (!mounted) return
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .on('presence', { event: 'leave' }, () => {
        if (!mounted) return
        const state = channel.presenceState()
        setOnlineCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            username: profile?.username || user?.user_metadata?.username || 'User',
            online_at: new Date().toISOString(),
          })
        }
      })

    presenceChannelRef.current = channel

    return () => {
      mounted = false
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current)
        presenceChannelRef.current = null
      }
    }
  }, [user, profile])

  const handleLogout = async () => {
    try {
      // Untrack presence before signing out so the count updates immediately
      if (presenceChannelRef.current) {
        await presenceChannelRef.current.untrack()
        supabase.removeChannel(presenceChannelRef.current)
        presenceChannelRef.current = null
      }
      await authService.signOut()
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const navItems = [
    { path: '/app', label: 'ChatHub', icon: MessageSquare },
    { path: '/app/connect-wall', label: 'ConnectWall', icon: Users },
    { path: '/app/profile', label: 'Profile', icon: User },
  ]

  const displayName = profile?.username || user?.user_metadata?.username || 'User'
  const avatarId = profile?.avatar || user?.user_metadata?.avatar || 1
  const avatarSrc = avatarMap[avatarId] || avatar1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] relative">
      {/* Background Grid */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight">
              <span
                className="text-primary"
                style={{
                  textShadow: '0 0 10px rgba(91, 141, 239, 0.3), 0 4px 8px rgba(0,0,0,0.1)',
                  WebkitTextStroke: '2px white',
                  textStroke: '2px white',
                }}
              >
                OCC
              </span>
              <span
                className="text-secondary text-2xl"
                style={{
                  textShadow: '0 0 10px rgba(42, 59, 92, 0.3), 0 4px 8px rgba(0,0,0,0.1)',
                  WebkitTextStroke: '2px white',
                  textStroke: '2px white',
                }}
              >
                Connect
              </span>
            </h1>
          </div>

          {/* User Avatar & Dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors"
              >
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                />
                <ChevronDown
                  size={18}
                  className={`text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-secondary">{displayName}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Online Users Counter - Below Header */}
      <div className="fixed top-[72px] left-0 right-0 z-15 bg-white/70 backdrop-blur-sm border-b border-gray-100 px-4 py-1.5">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-xs">
            <UsersIcon size={14} className="text-primary" />
            <span className="font-semibold text-secondary">{onlineCount}</span>
            <span className="text-gray-500">
              {onlineCount === 1 ? 'User Online' : 'Users Online'}
            </span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-[110px] pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                    ${isActive
                      ? 'text-primary'
                      : 'text-gray-500 hover:text-secondary'}
                  `}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default AppLayout