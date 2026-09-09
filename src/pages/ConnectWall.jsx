// pages/ConnectWall.jsx (with separate PostModal)
import React, { useState } from 'react'
import { Plus, Heart, MessageSquare, Flame, Sparkles, ChevronDown, Heart as HeartFilled, Send } from 'lucide-react'
import Button from '../components/Button'
import PostModal from '../components/PostModal'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'

// Mock avatars for different users
const userAvatars = {
  'Emma': avatar1,
  'James': avatar2,
  'Anonymous': avatar3
}

function ConnectWall() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Emma',
      content: 'Anyone interested in forming a study group for Math? 📚',
      likes: 5,
      liked: false,
      comments: [
        { id: 1, user: 'Mark', content: 'I\'m interested! When are you planning to meet?' },
        { id: 2, user: 'Sarah', content: 'Count me in too!' }
      ],
      showComments: false,
      time: '2 hours ago',
      avatar: avatar1,
      color: '#4F46E5'
    },
    {
      id: 2,
      user: 'James',
      content: 'Just finished my CS project! Feeling great! 🎉',
      likes: 8,
      liked: false,
      comments: [
        { id: 1, user: 'Emma', content: 'Congratulations! 🎉' }
      ],
      showComments: false,
      time: '4 hours ago',
      avatar: avatar2,
      color: '#10B981'
    },
    {
      id: 3,
      user: 'Sarah',
      content: 'Does anyone have recommendations for good study playlists? 🎧',
      likes: 12,
      liked: false,
      comments: [],
      showComments: false,
      time: '6 hours ago',
      avatar: avatar3,
      color: '#F59E0B'
    },
  ])
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [commentInputs, setCommentInputs] = useState({})
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Get avatar for user
  const getAvatarForUser = (username) => {
    const avatars = [avatar1, avatar2, avatar3]
    const index = username.length % avatars.length
    return avatars[index]
  }

  const handlePost = (content, color) => {
    setPosts([
      {
        id: posts.length + 1,
        user: user.username || 'Anonymous',
        content: content,
        likes: 0,
        liked: false,
        comments: [],
        showComments: false,
        time: 'Just now',
        avatar: getAvatarForUser(user.username || 'Anonymous'),
        color: color || '#4F46E5'
      },
      ...posts
    ])
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
  }

  const toggleComments = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          showComments: !post.showComments
        }
      }
      return post
    }))
  }

  const handleAddComment = (postId) => {
    const commentText = commentInputs[postId]?.trim()
    if (!commentText) return

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: post.comments.length + 1,
              user: user.username || 'Anonymous',
              content: commentText
            }
          ]
        }
      }
      return post
    }))

    setCommentInputs(prev => ({
      ...prev,
      [postId]: ''
    }))
  }

  // Sort posts based on selected filter
  const getSortedPosts = () => {
    if (sortBy === 'newest') {
      const timeOrder = { 'Just now': 0, '2 hours ago': 1, '4 hours ago': 2, '6 hours ago': 3 }
      return [...posts].sort((a, b) => (timeOrder[a.time] || 999) - (timeOrder[b.time] || 999))
    }
    return [...posts].sort((a, b) => b.likes - a.likes)
  }

  const sortedPosts = getSortedPosts()

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Sparkles },
    { value: 'trending', label: 'Trending', icon: Flame }
  ]

  const currentSortOption = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0]
  const CurrentIcon = currentSortOption.icon

  return (
    <div className="bg-transparent p-6">
      {/* Header with Sort Dropdown and New Post */}
      <div className="flex items-center justify-between mb-6">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all text-sm font-medium text-secondary"
          >
            <CurrentIcon size={18} className="text-primary" />
            <span>{currentSortOption.label}</span>
            <ChevronDown 
              size={16} 
              className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 overflow-hidden z-20">
              {sortOptions.map((option) => {
                const Icon = option.icon
                const isActive = sortBy === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value)
                      setIsDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-gray-400'} />
                    <span>{option.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"></span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* New Post Button - Smaller */}
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowModal(true)}
          size="sm"
          className="px-4 py-1.5 text-sm"
        >
          New Post
        </Button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white border-2 rounded-2xl p-4 hover:border-primary/50 transition-colors"
            style={{ 
              backgroundColor: post.color ? `${post.color}08` : 'white',
              borderColor: post.color || '#4F46E5'
            }}
          >
            {/* Post Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: post.color || '#4F46E5' }}>
                <img 
                  src={post.avatar || userAvatars[post.user] || avatar3} 
                  alt={post.user}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-secondary">{post.user}</span>
              <span className="text-xs text-gray-400 ml-auto">{post.time}</span>
            </div>
            
            {/* Post Content */}
            <p className="text-gray-700 mb-3">{post.content}</p>
            
            {/* Post Actions */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1 transition-colors group"
              >
                {post.liked ? (
                  <HeartFilled size={18} className="text-red-500 fill-red-500" />
                ) : (
                  <Heart size={18} className="text-gray-500 group-hover:text-red-500 transition-colors" />
                )}
                <span className={`text-sm ${post.liked ? 'text-red-500' : 'text-gray-500'}`}>
                  {post.likes}
                </span>
              </button>
              <button 
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors group"
              >
                <MessageSquare size={18} className="group-hover:text-primary transition-colors" />
                <span className="text-sm">{post.comments.length}</span>
              </button>
            </div>

            {/* Comments Section - Inside the post card */}
            {post.showComments && post.comments.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-primary/30 mt-0.5">
                      <img 
                        src={getAvatarForUser(comment.user)} 
                        alt={comment.user}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-1.5">
                      <span className="font-semibold text-xs text-secondary">{comment.user}</span>
                      <p className="text-sm text-gray-600">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input - Inside the post card */}
            {post.showComments && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(post.id)
                    }
                  }}
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  disabled={!commentInputs[post.id]?.trim()}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      <PostModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handlePost}
      />
    </div>
  )
}

export default ConnectWall