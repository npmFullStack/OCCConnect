// layout/AppLayout.jsx
import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { MessageSquare, Users, User, LogOut } from 'lucide-react'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/register')
      return
    }
    setUser(JSON.parse(userData))
  }, [navigate])

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

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-xl">OCC</span>
              <span className="text-secondary font-bold text-xl">Connect</span>
            </div>
            {user && (
              <div className="flex items-center gap-2 ml-4">
                <img
                  src={`/assets/avatars/avatar${user.avatar}.png`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut size={20} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-t border-gray-200">
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