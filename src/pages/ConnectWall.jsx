// pages/ConnectWall.jsx
import React, { useState } from 'react'
import { Plus, MessageSquare, Heart, User as UserIcon } from 'lucide-react'

function ConnectWall() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Emma',
      content: 'Anyone interested in forming a study group for Math? 📚',
      likes: 5,
      comments: 3,
      time: '2 hours ago'
    },
    {
      id: 2,
      user: 'James',
      content: 'Just finished my CS project! Feeling great! 🎉',
      likes: 8,
      comments: 2,
      time: '4 hours ago'
    },
  ])
  const [newPost, setNewPost] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handlePost = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    setPosts([
      {
        id: posts.length + 1,
        user: user.username || 'Anonymous',
        content: newPost.trim(),
        likes: 0,
        comments: 0,
        time: 'Just now'
      },
      ...posts
    ])
    setNewPost('')
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={24} className="text-primary" />
        <h2 className="text-2xl font-bold text-secondary">ConnectWall</h2>
      </div>

      {/* Create Post */}
      <form onSubmit={handlePost} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the community..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus size={20} />
            Post
          </button>
        </div>
      </form>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <UserIcon size={16} className="text-primary" />
              </div>
              <span className="font-semibold text-secondary">{post.user}</span>
              <span className="text-xs text-gray-400 ml-auto">{post.time}</span>
            </div>
            <p className="text-gray-700 mb-3">{post.content}</p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                <Heart size={18} />
                <span className="text-sm">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
                <MessageSquare size={18} />
                <span className="text-sm">{post.comments}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectWall