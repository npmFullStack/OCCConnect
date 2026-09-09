// pages/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Users, UserPlus, Compass } from 'lucide-react'
import Button from '../components/Button'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] relative flex items-center justify-center p-4">
      {/* Top Fade Grid Background */}
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

      {/* Main Card - Transparent */}
      <div className="relative z-10 bg-transparent rounded-3xl p-8 max-w-md w-full">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-7xl font-black mb-2 tracking-tight">
            <span className="text-primary" style={{ 
              textShadow: '0 0 10px rgba(91, 141, 239, 0.3), 0 4px 8px rgba(0,0,0,0.1)',
              WebkitTextStroke: '2px white',
              textStroke: '2px white',
            }}>OCC</span>
            <span className="text-secondary" style={{ 
              textShadow: '0 0 10px rgba(42, 59, 92, 0.3), 0 4px 8px rgba(0,0,0,0.1)',
              WebkitTextStroke: '2px white',
              textStroke: '2px white',
            }}> Connect</span>
          </h1>
          
          <p className="text-gray-900 mb-6 text-lg">
            Meet and chat with fellow OCC students instantly!
          </p>
        </div>

        {/* Start Chatting Button - Navigates to Login */}
        <Button
          onClick={() => navigate('/login')}
          icon={MessageCircle}
          size="lg"
          fullWidth
          className="py-4 text-lg"
        >
          Start Chatting Now
        </Button>

        {/* Tags Section */}
        <div className="mt-8 pt-6 border-t-2 border-primary/20">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-gray-900 text-xs font-medium">
              <UserPlus size={12} />
              Find Friends
            </span>
            
            <span className="text-primary/30 text-xs">|</span>
            
            <span className="flex items-center gap-1 text-gray-900 text-xs font-medium">
              <Users size={12} />
              Community
            </span>
            
            <span className="text-primary/30 text-xs">|</span>
            
            <span className="flex items-center gap-1 text-gray-900 text-xs font-medium">
              <Compass size={12} />
              Explore
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home