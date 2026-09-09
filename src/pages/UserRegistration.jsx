// pages/UserRegistration.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Check, Lock, Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../layout/AuthLayout'
import Button from '../components/Button'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'

function UserRegistration() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [error, setError] = useState('')

  const avatars = [
    { id: 1, src: avatar1, label: 'Avatar 1' },
    { id: 2, src: avatar2, label: 'Avatar 2' },
    { id: 3, src: avatar3, label: 'Avatar 3' },
  ]

  const courses = [
    { value: 'BSIT', label: 'Bachelor of Science in Information Technology' },
    { value: 'BSBA', label: 'Bachelor of Science in Business Administration' },
    { value: 'FM', label: 'Financial Management' },
    { value: 'MM', label: 'Marketing Management' },
    { value: 'BEED', label: 'Bachelor of Elementary Education' },
    { value: 'BSED', label: 'Bachelor of Secondary Education' },
    { value: 'not-disclose', label: 'Prefer not to disclose' },
  ]

  const handleUsernameChange = (e) => {
    const value = e.target.value
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

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!selectedAvatar) {
      setError('Please select an avatar')
      return
    }

    if (!selectedCourse) {
      setError('Please select your course')
      return
    }

    // Save user data to localStorage
    const userData = {
      username: username.trim(),
      password: password, // In production, this should be hashed
      avatar: selectedAvatar,
      course: selectedCourse,
      joinedAt: new Date().toISOString()
    }
    localStorage.setItem('user', JSON.stringify(userData))
    
    navigate('/app')
  }

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter username (letters & numbers only)"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white"
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
              placeholder="Enter password (min 6 characters)"
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
          <div className="mt-1">
            <span className="text-xs text-gray-500">
              Minimum 6 characters
            </span>
          </div>
        </div>

        {/* Avatar Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose your avatar
          </label>
          <div className="grid grid-cols-3 gap-3">
            {avatars.map((avatar) => (
              <button
                key={avatar.id}
                type="button"
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`
                  relative aspect-square rounded-xl border-4 transition-all hover:scale-105 bg-white
                  ${selectedAvatar === avatar.id 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <img
                  src={avatar.src}
                  alt={avatar.label}
                  className="w-full h-full object-cover rounded-lg"
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

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value)
              setError('')
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white appearance-none"
          >
            <option value="">Select your course</option>
            {courses.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>
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
          Let's Go!
        </Button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default UserRegistration