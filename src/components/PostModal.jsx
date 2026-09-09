// components/PostModal.jsx
import React, { useState } from 'react'
import { X } from 'lucide-react'

function PostModal({ isOpen, onClose, onSubmit }) {
  const [newPost, setNewPost] = useState('')
  const [selectedColor, setSelectedColor] = useState('#4F46E5')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    onSubmit(newPost.trim(), selectedColor)
    setNewPost('')
    setSelectedColor('#4F46E5')
    onClose()
  }

  return (
    <>
      {/* Backdrop - overlay for entire app */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          
          <h3 className="text-xl font-bold text-secondary mb-4">
            Create New Post
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts with the community..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose a color for your post
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-12 h-12 rounded-full cursor-pointer border-2 border-gray-300 p-0.5 hover:border-primary transition-colors appearance-none"
                    style={{ 
                      background: selectedColor,
                      borderRadius: '50%',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none'
                    }}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-gray-500 block">Pick a color theme</span>
                  <div className="flex gap-1 mt-1">
                    {['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          selectedColor === color ? 'border-primary scale-110' : 'border-gray-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Preview of post with selected color */}
              <div className="mt-3 p-3 rounded-xl border-2" style={{ 
                backgroundColor: selectedColor + '10',
                borderColor: selectedColor + '40'
              }}>
                <p className="text-sm text-gray-600 truncate">
                  {newPost || 'Preview of your post...'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPost.trim()}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default PostModal