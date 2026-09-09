// layouts/AuthLayout.jsx
import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function AuthLayout({ children, title, showBack = true }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] relative flex items-center justify-center p-4">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0"
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

      {/* Main Card */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full shadow-lg">
        {/* Header with Back Button and Title */}
        <div className="flex items-center gap-3 mb-6">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-secondary" />
            </button>
          )}
          <h2 className="text-2xl font-bold text-secondary">{title}</h2>
        </div>

        {children}
      </div>
    </div>
  )
}

export default AuthLayout