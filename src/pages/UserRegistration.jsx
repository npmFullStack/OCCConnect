// pages/UserRegistration.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Check, Lock, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import AuthLayout from '../layout/AuthLayout'
import Button from '../components/Button'
import { authService, profileService } from '../services'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'
import avatar6 from '../assets/avatars/avatar6.png'

function UserRegistration() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scrollRef = useRef(null)

  const avatars = [
    { id: 1, src: avatar1, label: 'Avatar 1' },
    { id: 2, src: avatar2, label: 'Avatar 2' },
    { id: 3, src: avatar3, label: 'Avatar 3' },
    { id: 4, src: avatar4, label: 'Avatar 4' },
    { id: 5, src: avatar5, label: 'Avatar 5' },
    { id: 6, src: avatar6, label: 'Avatar 6' },
  ]

  const courses = [
    { value: 'BSIT', label: 'Bachelor of Science in Information Technology', color: 'bg-red-500' },
    { value: 'BSBA-FM', label: 'Bachelor of Science in Business Administration - Financial Management', color: 'bg-yellow-500' },
    { value: 'BSBA-MM', label: 'Bachelor of Science in Business Administration - Marketing Management', color: 'bg-yellow-500' },
    { value: 'BEED', label: 'Bachelor of Elementary Education', color: 'bg-blue-500' },
    { value: 'BSED', label: 'Bachelor of Secondary Education', color: 'bg-blue-500' },
    { value: 'not-disclose', label: 'Prefer not to disclose', color: 'bg-gray-400' },
  ]

  const getCourseColor = (courseValue) => {
    const course = courses.find(c => c.value === courseValue)
    return course ? course.color : 'bg-gray-400'
  }

  const getCourseLabel = (courseValue) => {
    if (courseValue === 'not-disclose') return 'Prefer not to disclose'
    return courseValue
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [])

  const scrollAvatars = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value
    const filtered = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    setUsername(filtered)
    setError('')
  }

  const handleSubmit = async (e) => {
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

    if (!selectedCourse) {
      setError('Please select your course')
      return
    }

    if (!selectedAvatar) {
      setError('Please select an avatar')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if username is already taken
      const taken = await profileService.isUsernameTaken(username.trim())
      if (taken) {
        setError('Username is already taken. Please choose another.')
        setLoading(false)
        return
      }

      // Sign up with Supabase
      await authService.signUp({
        username: username.trim(),
        password,
        avatar: selectedAvatar,
        course: selectedCourse,
      })

      navigate('/app')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
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
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white font-normal"
              maxLength={20}
              disabled={loading}
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
              disabled={loading}
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

        {/* Course Selection - Dropdown */}
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
            disabled={loading}
          >
            <option value="">Select your course</option>
            {courses.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>
          {selectedCourse && (
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getCourseColor(selectedCourse)}`}>
                {getCourseLabel(selectedCourse)}
              </span>
            </div>
          )}
        </div>

        {/* Avatar Selection - Horizontally Scrollable with Arrows */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose your avatar
          </label>
          <div className="relative">
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollAvatars('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Scroll left"
              >
                <ChevronLeft size={20} className="text-secondary" />
              </button>
            )}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollAvatars('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Scroll right"
              >
                <ChevronRight size={20} className="text-secondary" />
              </button>
            )}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-xl" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
            )}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-3 overflow-x-auto scroll-smooth pb-2 px-1"
              style={{ scrollbarWidth: 'thin' }}
            >
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  disabled={loading}
                  className={`
                    relative flex-shrink-0 w-20 h-20 rounded-xl border-4 transition-all hover:scale-105 bg-white
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
          disabled={loading}
          className="py-3.5 text-lg opacity-90 hover:opacity-100 transition-opacity"
        >
          {loading ? 'Creating Account...' : "Let's Go!"}
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