// pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { User, Calendar, Edit, Camera, X, Check, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { postService } from '../services'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'
import avatar6 from '../assets/avatars/avatar6.png'

const avatarMap = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4, 5: avatar5, 6: avatar6 }

function Profile() {
  const { user, profile, loading, refreshProfile } = useAuth()
  const { updateProfile, saving } = useProfile()

  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [error, setError] = useState('')

  // Modal temp states
  const [tempUsername, setTempUsername] = useState('')
  const [tempAvatar, setTempAvatar] = useState(null)
  const [tempCourse, setTempCourse] = useState('')

  // Post count for the stats section
  const [postCount, setPostCount] = useState(0)
  const [postCountLoading, setPostCountLoading] = useState(true)

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

  useEffect(() => {
    if (profile) {
      setTempUsername(profile.username || '')
      setTempAvatar(profile.avatar || 1)
      setTempCourse(profile.course || '')
    }
  }, [profile])

  useEffect(() => {
    if (!profile?.id) return
    let mounted = true
    setPostCountLoading(true)
    postService
      .getUserPostCount(profile.id)
      .then((count) => { if (mounted) setPostCount(count) })
      .catch((e) => console.warn('Failed to load post count:', e.message))
      .finally(() => { if (mounted) setPostCountLoading(false) })
    return () => { mounted = false }
  }, [profile?.id])

  const getAvatarSrc = (avatarId) => avatarMap[avatarId] || avatar1

  const getCourseColor = (courseValue) => {
    const course = courses.find(c => c.value === courseValue)
    return course ? course.color : 'bg-gray-400'
  }

  const getCourseLabel = (courseValue) => {
    if (courseValue === 'not-disclose') return 'Prefer not to disclose'
    return courseValue
  }

  // ----- Avatar Modal -----
  const openAvatarModal = () => {
    setTempAvatar(profile?.avatar || 1)
    setShowAvatarModal(true)
    setError('')
  }

  const saveAvatar = async () => {
    if (!tempAvatar) return
    try {
      await updateProfile({ avatar: tempAvatar })
      await refreshProfile()
      setShowAvatarModal(false)
    } catch (e) {
      setError(e.message)
    }
  }

  // ----- Username Modal -----
  const openUsernameModal = () => {
    setTempUsername(profile?.username || '')
    setShowUsernameModal(true)
    setError('')
  }

  const handleUsernameChange = (e) => {
    const filtered = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    setTempUsername(filtered)
  }

  const saveUsername = async () => {
    if (!tempUsername.trim() || tempUsername.length < 2) return
    try {
      await updateProfile({ username: tempUsername.trim() })
      await refreshProfile()
      setShowUsernameModal(false)
    } catch (e) {
      setError(e.message)
    }
  }

  // ----- Course Modal -----
  const openCourseModal = () => {
    setTempCourse(profile?.course || '')
    setShowCourseModal(true)
    setError('')
  }

  const saveCourse = async () => {
    if (!tempCourse) return
    try {
      await updateProfile({ course: tempCourse })
      await refreshProfile()
      setShowCourseModal(false)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading || !profile) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
        <div className="text-center">
          {/* Avatar */}
          <div className="relative inline-block">
            <button
              type="button"
              onClick={openAvatarModal}
              className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mx-auto block hover:opacity-90 transition-opacity"
              aria-label="Change avatar"
            >
              <img
                src={getAvatarSrc(profile.avatar)}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={openAvatarModal}
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md"
              aria-label="Change avatar"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Username */}
          <div className="mt-4 flex items-center gap-2 justify-center">
            <h2 className="text-2xl font-bold text-secondary">{profile.username}</h2>
            <button
              type="button"
              onClick={openUsernameModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Edit username"
            >
              <Edit size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Course */}
          <div className="mt-3 flex items-center gap-2 justify-center">
            {profile.course ? (
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getCourseColor(profile.course)}`}
              >
                {getCourseLabel(profile.course)}
              </span>
            ) : (
              <span className="text-sm text-gray-400 italic">No course set</span>
            )}
            <button
              type="button"
              onClick={openCourseModal}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Edit course"
            >
              <Edit size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <User size={18} />
              <span>Member</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span>Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex justify-center pt-6 border-t-2 border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {postCountLoading ? '-' : postCount}
              </p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Change Avatar Modal ---------- */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAvatarModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">Change Avatar</h3>
              <p className="text-sm text-gray-500 mt-1">Pick a new look for your profile</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setTempAvatar(avatar.id)}
                  className={`
                    relative aspect-square rounded-xl border-4 transition-all hover:scale-105 bg-white overflow-hidden
                    ${tempAvatar === avatar.id
                      ? 'border-primary shadow-lg shadow-primary/20'
                      : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.label}
                    className="w-full h-full object-cover"
                  />
                  {tempAvatar === avatar.id && (
                    <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl mb-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowAvatarModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAvatar}
                disabled={!tempAvatar || saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Change Username Modal ---------- */}
      {showUsernameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUsernameModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowUsernameModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">Change Username</h3>
              <p className="text-sm text-gray-500 mt-1">Letters and numbers only</p>
            </div>

            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={tempUsername}
                  onChange={handleUsernameChange}
                  placeholder="Enter username"
                  maxLength={20}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors bg-white"
                  autoFocus
                />
              </div>
              <div className="flex justify-between mt-1 px-1">
                <span className="text-xs text-gray-500">Min 2 characters</span>
                <span className="text-xs text-gray-500">{tempUsername.length}/20</span>
              </div>
              {tempUsername.length > 0 && tempUsername.length < 2 && (
                <p className="text-xs text-red-500 mt-1 px-1">
                  Username must be at least 2 characters
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl mb-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowUsernameModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveUsername}
                disabled={!tempUsername.trim() || tempUsername.length < 2 || saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Change Course Modal ---------- */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCourseModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowCourseModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">Change Course</h3>
              <p className="text-sm text-gray-500 mt-1">Select your current course</p>
            </div>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto pr-1">
              {courses.map((course) => (
                <button
                  key={course.value}
                  type="button"
                  onClick={() => setTempCourse(course.value)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                    ${tempCourse === course.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${course.color}`} />
                  <span className="text-sm text-secondary flex-1">{course.label}</span>
                  {tempCourse === course.value && (
                    <Check size={18} className="text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-xl mb-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCourseModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCourse}
                disabled={!tempCourse || saving}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Profile