// pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { User, Calendar, Edit, Camera } from 'lucide-react'

function Profile() {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUsername, setEditedUsername] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setEditedUsername(parsed.username)
    }
  }, [])

  const handleSave = () => {
    if (!editedUsername.trim() || editedUsername.length < 2) return
    
    const updatedUser = {
      ...user,
      username: editedUsername.trim()
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl text-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <div className="text-center">
        {/* Avatar */}
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full border-4 border-primary overflow-hidden mx-auto">
            <img
              src={`/assets/avatars/avatar${user.avatar}.png`}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
            <Camera size={16} />
          </button>
        </div>

        {/* Username */}
        <div className="mt-4">
          {isEditing ? (
            <div className="flex items-center gap-2 justify-center">
              <input
                type="text"
                value={editedUsername}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
                  setEditedUsername(filtered)
                }}
                className="px-3 py-1 border-2 border-primary rounded-xl focus:outline-none text-center"
                maxLength={20}
              />
              <button
                onClick={handleSave}
                className="bg-primary text-white px-4 py-1 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditedUsername(user.username)
                  setIsEditing(false)
                }}
                className="bg-gray-200 text-gray-700 px-4 py-1 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <h2 className="text-2xl font-bold text-secondary">{user.username}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Edit size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <User size={18} />
            <span>Member</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-100">
          <div>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-gray-500">Messages</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-gray-500">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-gray-500">Likes</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile