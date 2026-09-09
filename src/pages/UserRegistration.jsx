// pages/UserRegistration.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Check } from 'lucide-react'
import Button from '../components/Button'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'

function UserRegistration() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [error, setError] = useState('')

  const avatars = [
    { id: 1, src: avatar1, label: 'Avatar 1' },
    { id: 2, src: avatar2, label: 'Avatar 2' },
    { id: 3, src: avatar3, label: 'Avatar 3' },
  ]

  const handleUsernameChange = (e) => {
    const value = e.target.value
    // Only allow letters, numbers, and max 20 characters
    const filtered = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    setUsername(filtered)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }
    
    if (username.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }

    if (!selectedAvatar) {
      setError('Please select an avatar')
      return
    }

    // Save user data to localStorage or context
    const userData = {
      username: username.trim(),
      avatar: selectedAvatar,
      joinedAt: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Navigate to app
    navigate('/app')
  }

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

      {/* Main Card - Transparent (no background color) */}
      <div className="relative z-10 bg-transparent rounded-3xl p-8 max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-secondary" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary">Welcome!</h2>
          <p className="text-gray-600 mt-2">Set up your profile to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username (letters & numbers only)"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors bg-white/90 backdrop-blur-sm"
                maxLength={20}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Letters and numbers only
              </span>
              <span className="text-xs text-gray-500">
                {username.length}/20
              </span>
            </div>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose your avatar
            </label>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`
                    relative aspect-square rounded-2xl border-4 transition-all hover:scale-105 bg-white/90 backdrop-blur-sm
                    ${selectedAvatar === avatar.id 
                      ? 'border-primary shadow-lg shadow-primary/20' 
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50/90 backdrop-blur-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button using Button component */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            className="py-4 text-lg"
          >
            Let's Go!
          </Button>
        </form>
      </div>
    </div>
  )
}

export default UserRegistration