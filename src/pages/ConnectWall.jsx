// pages/ConnectWall.jsx
import React, { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Heart,
  MessageSquare,
  Flame,
  Sparkles,
  ChevronDown,
  Heart as HeartFilled,
  Send,
  MoreVertical,
  Flag,
  Loader2,
  X,
} from 'lucide-react'
import Button from '../components/Button'
import PostModal from '../components/PostModal'
import { postService, supabase } from '../services'
import { useAuth } from '../hooks/useAuth'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar4 from '../assets/avatars/avatar4.png'
import avatar5 from '../assets/avatars/avatar5.png'
import avatar6 from '../assets/avatars/avatar6.png'

const avatarMap = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4, 5: avatar5, 6: avatar6 }

function ConnectWall() {
  const { user } = useAuth()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [commentInputs, setCommentInputs] = useState({})
  const [openDropdownPostId, setOpenDropdownPostId] = useState(null)

  const [reportPostTarget, setReportPostTarget] = useState(null)
  const [reportingPost, setReportingPost] = useState(false)
  const [reportedPostIds, setReportedPostIds] = useState(new Set())

  const dropdownRef = useRef(null)

  // ------------------------------------------------------------
  // Load posts on mount
  // ------------------------------------------------------------
  useEffect(() => {
    loadPosts()
  }, [])

  // ------------------------------------------------------------
  // Close post ellipsis dropdown on outside click
  // ------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdownPostId(null)
      }
    }
    if (openDropdownPostId) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownPostId])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await postService.getPosts()
      setPosts(data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------------------------------------
  // Create post
  // ------------------------------------------------------------
  const handlePost = async (content, color) => {
    setIsPosting(true)
    try {
      const newPost = await postService.createPost({ content, color })
      setPosts((prev) => [newPost, ...prev])
      // Errors propagate up so PostModal keeps the draft open
    } finally {
      setIsPosting(false)
    }
  }

  // ------------------------------------------------------------
  // Likes
  // ------------------------------------------------------------
  const handleLike = async (postId) => {
    // Optimistic
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    )

    try {
      await postService.toggleLike(postId)
    } catch (err) {
      console.error('Failed to toggle like:', err)
      // Revert
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
              }
            : post
        )
      )
    }
  }

  // ------------------------------------------------------------
  // Comments
  // ------------------------------------------------------------
  const toggleComments = async (postId) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    // Lazy-load comments the first time
    if (!post.showComments && !post.commentsLoaded) {
      try {
        const comments = await postService.getComments(postId)
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments, commentsLoaded: true, showComments: true }
              : p
          )
        )
        return
      } catch (err) {
        console.error('Failed to load comments:', err)
        return
      }
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, showComments: !p.showComments } : p
      )
    )
  }

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return

    try {
      const newComment = await postService.addComment(postId, text)

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, newComment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      )

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  // ------------------------------------------------------------
  // Reports
  // ------------------------------------------------------------
  const handleOpenReport = (post) => {
    setOpenDropdownPostId(null)
    setReportPostTarget(post)
  }

  const handleConfirmReport = async () => {
    if (!reportPostTarget) return
    const targetId = reportPostTarget.id

    try {
      setReportingPost(true)
      await postService.reportPost(targetId)

      setReportedPostIds((prev) => new Set(prev).add(targetId))

      // Check if the post crossed the 5-report threshold and should be
      // removed from the UI right away. The DB trigger also deletes it,
      // so this is just for instant feedback.
      const { count } = await supabase
        .from('post_reports')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', targetId)

      if (count >= 5) {
        setPosts((prev) => prev.filter((p) => p.id !== targetId))
      }

      setReportPostTarget(null)
    } catch (err) {
      console.error('Failed to report post:', err)
      // Unique constraint (already reported)
      if (err.code === '23505' || err?.status === 409) {
        setReportedPostIds((prev) => new Set(prev).add(targetId))
        setReportPostTarget(null)
      }
    } finally {
      setReportingPost(false)
    }
  }

  // ------------------------------------------------------------
  // Sorting
  // ------------------------------------------------------------
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at)
    }
    return b.likes - a.likes
  })

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Sparkles },
    { value: 'trending', label: 'Trending', icon: Flame },
  ]
  const currentSortOption =
    sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0]
  const CurrentIcon = currentSortOption.icon

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div className="bg-transparent p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-gray-200 hover:border-primary/50 transition-all text-sm font-medium text-secondary"
          >
            <CurrentIcon size={18} className="text-primary" />
            <span>{currentSortOption.label}</span>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

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
                    <Icon
                      size={18}
                      className={isActive ? 'text-primary' : 'text-gray-400'}
                    />
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

        {/* New Post */}
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
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-primary animate-spin" />
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl">
          <p className="text-gray-500">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => {
            const alreadyReported = reportedPostIds.has(post.id)
            return (
              <div
                key={post.id}
                className="bg-white border-2 rounded-2xl p-4 hover:border-primary/50 transition-colors relative"
                style={{
                  backgroundColor: post.color ? `${post.color}08` : 'white',
                  borderColor: post.color || '#4F46E5',
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2"
                    style={{ borderColor: post.color || '#4F46E5' }}
                  >
                    <img
                      src={avatarMap[post.avatar] || avatar1}
                      alt={post.user}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold text-secondary">{post.user}</span>
                  <span className="text-xs text-gray-400 ml-auto mr-8">
                    {post.time}
                  </span>

                  {/* Ellipsis menu */}
                  <div
                    className="absolute top-3 right-3"
                    ref={openDropdownPostId === post.id ? dropdownRef : null}
                  >
                    <button
                      onClick={() =>
                        setOpenDropdownPostId(
                          openDropdownPostId === post.id ? null : post.id
                        )
                      }
                      className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors"
                      aria-label="Post options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openDropdownPostId === post.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                        <button
                          onClick={() => handleOpenReport(post)}
                          disabled={alreadyReported}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Flag size={14} />
                          {alreadyReported ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-3">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 transition-colors group"
                  >
                    {post.liked ? (
                      <HeartFilled
                        size={18}
                        className="text-red-500 fill-red-500"
                      />
                    ) : (
                      <Heart
                        size={18}
                        className="text-gray-500 group-hover:text-red-500 transition-colors"
                      />
                    )}
                    <span
                      className={`text-sm ${
                        post.liked ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      {post.likes}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors group"
                  >
                    <MessageSquare
                      size={18}
                      className="group-hover:text-primary transition-colors"
                    />
                    <span className="text-sm">{post.commentCount}</span>
                  </button>
                </div>

                {/* Comments list */}
                {post.showComments && post.comments.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-primary/30 mt-0.5">
                          <img
                            src={avatarMap[comment.avatar] || avatar1}
                            alt={comment.user}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-1.5">
                          <span className="font-semibold text-xs text-secondary">
                            {comment.user}
                          </span>
                          <p className="text-sm text-gray-600">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                {post.showComments && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
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
            )
          })}
        </div>
      )}

      {/* New Post Modal */}
      <PostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handlePost}
        submitting={isPosting}
      />

      {/* Report Confirmation Modal */}
      {reportPostTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !reportingPost && setReportPostTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button
              onClick={() => !reportingPost && setReportPostTarget(null)}
              disabled={reportingPost}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Flag size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">
                Report this post?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to report this post by{' '}
                <span className="font-semibold">{reportPostTarget.user}</span>?
                Posts with 5 or more reports are automatically removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setReportPostTarget(null)}
                  disabled={reportingPost}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReport}
                  disabled={reportingPost}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {reportingPost ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Reporting...
                    </>
                  ) : (
                    'Report'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectWall