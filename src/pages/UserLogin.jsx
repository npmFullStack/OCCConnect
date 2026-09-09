// pages/UserLogin.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../layout/AuthLayout'
import Button from '../components/Button'

function UserLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleUsernameChange = (e) => {
    const value = e.target.value
    const filtered = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    setUsername(filtered)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter your username')
      return
    }
    
    if (username.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Check if user exists in localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      // For demo, we'll accept any password if username matches
      if (userData.username.toLowerCase() === username.toLowerCase()) {
        // Update user data with login timestamp
        const updatedUser = {
          ...userData,
          lastLogin: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        navigate('/app')
        return
      }
    }

    // If no matching user found, create one (for demo purposes)
    const newUser = {
      username: username.trim(),
      avatar: 1,
      joinedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      course: 'Not specified'
    }
    localStorage.setItem('user', JSON.stringify(newUser))
    navigate('/app')
  }

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              placeholder="Enter your username"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white"
              maxLength={20}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter your password"
              className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={20} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          className="py-3.5 text-lg"
        >
          Login
        </Button>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default UserLogin