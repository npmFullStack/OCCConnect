// layout/AppLayout.jsx
import React, { useEffect, useState, useRef } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Users, User, LogOut, ChevronDown } from 'lucide-react'
import avatar1 from '../assets/avatars/avatar1.png'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/register')
      return
    }
    setUser(JSON.parse(userData))
  }, [navigate])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  const navItems = [
    { path: '/app', label: 'ChatHub', icon: MessageSquare },
    { path: '/app/connect-wall', label: 'ConnectWall', icon: Users },
    { path: '/app/profile', label: 'Profile', icon: User },
  ]

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
          {/* Logo - Same design as Home.jsx */}
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
                className="text-secondary" 
                style={{ 
                  textShadow: '0 0 10px rgba(42, 59, 92, 0.3), 0 4px 8px rgba(0,0,0,0.1)',
                  WebkitTextStroke: '2px white',
                  textStroke: '2px white',
                }}
              >
                {' '}Connect
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
                  src={avatar1}
                  alt={user.username}
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
                    <p className="text-sm font-medium text-secondary">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email || 'student@occ.edu'}</p>
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

      {/* Main Content - with padding for fixed header */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-24">
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