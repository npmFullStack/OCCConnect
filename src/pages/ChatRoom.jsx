// pages/ChatRoom.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Check, CheckCheck, LogOut, X, Users, Loader2, Clock, UserPlus, MoreVertical, RefreshCw } from 'lucide-react'
import Button from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { chatService, presenceService } from '../services'
import avatar1 from '../assets/avatars/avatar1.png'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'

const avatarMap = { 1: avatar1, 2: avatar2, 3: avatar3 }

// ✅ Animated 3-dot typing bubble
function TypingBubble({ avatarSrc, name }) {
  return (
    <div className="flex items-end gap-2 flex-row">
      <img
        src={avatarSrc}
        alt={name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex flex-col items-start max-w-[70%]">
        <div className="px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm rounded-bl-none shadow-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">{name} is typing…</span>
      </div>
    </div>
  )
}

function ChatRoom() {
  const { user, profile } = useAuth()
  const [isMatched, setIsMatched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [conversationId, setConversationId] = useState(null)
  const [partnerName, setPartnerName] = useState('')
  const [partnerAvatar, setPartnerAvatar] = useState(null)
  const [partnerCourse, setPartnerCourse] = useState('')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEndChatModal, setShowEndChatModal] = useState(false)
  const [showNewPartnerModal, setShowNewPartnerModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isPartnerTyping, setIsPartnerTyping] = useState(false)
  const [showLeavePageModal, setShowLeavePageModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)

  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const searchIntervalRef = useRef(null)
  const matchPollRef = useRef(null)
  const dropdownRef = useRef(null)
  const presenceChannelRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Refs to avoid stale closures in beforeunload
  const conversationIdRef = useRef(null)
  const isMatchedRef = useRef(false)
  useEffect(() => { conversationIdRef.current = conversationId }, [conversationId])
  useEffect(() => { isMatchedRef.current = isMatched }, [isMatched])

  const getCourseColor = (course) => {
    if (course === 'BSIT') return 'bg-red-500'
    if (course === 'BSBA-FM' || course === 'BSBA-MM') return 'bg-yellow-500'
    if (course === 'BEED' || course === 'BSED') return 'bg-blue-500'
    return 'bg-gray-400'
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isPartnerTyping])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current)
      if (matchPollRef.current) clearInterval(matchPollRef.current)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (presenceChannelRef.current) {
        try {
          presenceService.broadcastTyping(presenceChannelRef.current, user?.id, profile?.username, false)
          presenceChannelRef.current.unsubscribe()
        } catch (e) { /* noop */ }
      }
      chatService.leaveMatchQueue()
    }
  }, [])

  // ✅ Subscribe to messages when matched
  useEffect(() => {
    if (!conversationId) return

    console.log('[ChatRoom] subscribing to messages for conv:', conversationId)

    const unsubscribe = chatService.subscribeToMessages(conversationId, (payload) => {
      const msg = payload.new
      if (!msg) return
      if (payload.eventType === 'UPDATE') {
        // Update existing message status
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msg.id ? { ...m, status: msg.status || m.status } : m
          )
        )
        return
      }
      // INSERT
      if (msg.sender_id === user?.id) return // skip own (already optimistic)

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev
        return [
          ...prev,
          {
            id: msg.id,
            user: partnerName,
            text: msg.text,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false,
            status: msg.status || 'delivered',
          },
        ]
      })
    })

    return unsubscribe
  }, [conversationId, user?.id, partnerName])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  // ✅ Warn before closing tab / refreshing
  useEffect(() => {
    const handler = (e) => {
      if (isMatchedRef.current && conversationIdRef.current) {
        e.preventDefault()
        e.returnValue = ''
        return ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startMatching = async () => {
    if (!profile) return

    setIsSearching(true)
    setSearchTime(0)

    searchIntervalRef.current = setInterval(() => {
      setSearchTime((prev) => prev + 1)
    }, 1000)

    try {
      await chatService.joinMatchQueue({
        course: profile.course,
        avatar: profile.avatar,
        username: profile.username,
      })

      matchPollRef.current = setInterval(async () => {
        try {
          const match = await chatService.tryFindMatch()
          if (match) {
            clearInterval(matchPollRef.current)
            clearInterval(searchIntervalRef.current)
            setIsSearching(false)
            setIsMatched(true)
            const convId = match.conversation_id || match.id
            setConversationId(convId)
            setPartnerName(match.partner_username || match.username || 'Partner')
            setPartnerAvatar(match.partner_avatar || match.avatar || 1)
            setPartnerCourse(match.partner_course || match.course || '')

            const existing = await chatService.getMessages(convId)
            setMessages(
              existing.map((m) => ({
                id: m.id,
                user: m.sender_id === user?.id ? 'You' : (match.partner_username || 'Partner'),
                text: m.text,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMine: m.sender_id === user?.id,
                status: m.status || 'sent',
              }))
            )

            presenceChannelRef.current = presenceService.createPresenceChannel(
              convId,
              { userId: user?.id, username: profile.username },
              {
                onTyping: (payload) => {
                  if (payload.userId !== user?.id) {
                    setIsPartnerTyping(payload.isTyping)
                  }
                },
              }
            )
          }
        } catch (err) {
          console.error('Match poll error:', err)
        }
      }, 2000)
    } catch (err) {
      console.error('Match queue error:', err)
      setIsSearching(false)
      if (searchIntervalRef.current) clearInterval(searchIntervalRef.current)
    }
  }

  const handleTyping = (value) => {
    setNewMessage(value)

    if (presenceChannelRef.current && user) {
      presenceService.broadcastTyping(presenceChannelRef.current, user.id, profile?.username, true)

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        if (presenceChannelRef.current && user) {
          presenceService.broadcastTyping(presenceChannelRef.current, user.id, profile?.username, false)
        }
      }, 1500)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !isMatched || !conversationId) return

    const text = newMessage.trim()
    setNewMessage('')

    const tempId = `temp-${Date.now()}`
    const newMsg = {
      id: tempId,
      user: 'You',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      status: 'sent',
    }
    setMessages((prev) => [...prev, newMsg])

    try {
      const sent = await chatService.sendMessage({ conversationId, text })
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, id: sent.id, status: 'sent' } : m))
      )

      if (presenceChannelRef.current && user) {
        presenceService.broadcastTyping(presenceChannelRef.current, user.id, profile?.username, false)
      }
    } catch (err) {
      console.error('Send message error:', err)
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      )
    }
  }

  const handleEndChat = () => {
    setShowDropdown(false)
    setShowEndChatModal(true)
  }

  const confirmEndChat = async () => {
    setShowEndChatModal(false)
    if (conversationId) {
      try { await chatService.endConversation(conversationId) } catch (err) { console.error(err) }
    }
    if (presenceChannelRef.current) {
      presenceChannelRef.current.unsubscribe()
      presenceChannelRef.current = null
    }
    resetChat()
  }

  const cancelEndChat = () => setShowEndChatModal(false)

  const handleNewPartner = () => {
    setShowDropdown(false)
    setShowNewPartnerModal(true)
  }

  const confirmNewPartner = async () => {
    setShowNewPartnerModal(false)
    if (conversationId) {
      try { await chatService.endConversation(conversationId) } catch (err) { console.error(err) }
    }
    if (presenceChannelRef.current) {
      presenceChannelRef.current.unsubscribe()
      presenceChannelRef.current = null
    }
    resetChat()
    startMatching()
  }

  const cancelNewPartner = () => setShowNewPartnerModal(false)

  const resetChat = () => {
    setIsMatched(false)
    setConversationId(null)
    setPartnerName('')
    setPartnerAvatar(null)
    setPartnerCourse('')
    setMessages([])
    setIsPartnerTyping(false)
    if (searchIntervalRef.current) clearInterval(searchIntervalRef.current)
    if (matchPollRef.current) clearInterval(matchPollRef.current)
  }

  const StatusIcon = ({ status }) => {
    if (status === 'sent') return <Check size={14} className="text-gray-400" />
    if (status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />
    if (status === 'seen') return <CheckCheck size={14} className="text-blue-500" />
    if (status === 'failed') return <span className="text-red-400 text-[10px]">Failed</span>
    return null
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="relative h-[calc(100vh-200px)] flex flex-col">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {!isMatched && !isSearching ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-2">Find a Chat Partner</h2>
              <p className="text-gray-600 mb-8">
                Connect with fellow OCC students and start meaningful conversations instantly!
              </p>
              <Button onClick={startMatching} icon={Users} size="lg" fullWidth className="py-3.5 text-lg">
                Find Chat Partner
              </Button>
              <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
                <span>Your conversations are private and secure</span>
              </div>
            </div>
          </div>
        ) : isSearching ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <div className="text-center max-w-sm mx-auto">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 bg-primary/40 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-primary/60 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-4 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 size={32} className="text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-2">Finding a Match</h2>
              <p className="text-gray-600 mb-2">Looking for someone to chat with...</p>
              <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                <Clock size={18} />
                <span>{formatTime(searchTime)}</span>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <button
                onClick={async () => {
                  if (searchIntervalRef.current) clearInterval(searchIntervalRef.current)
                  if (matchPollRef.current) clearInterval(matchPollRef.current)
                  await chatService.leaveMatchQueue()
                  setIsSearching(false)
                }}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Cancel search
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="relative z-20 flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-4 flex-shrink-0">
              <img
                src={avatarMap[partnerAvatar] || avatar1}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-normal text-secondary truncate">{partnerName}</span>
                  {partnerCourse && (
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getCourseColor(partnerCourse)}`}>
                      {partnerCourse}
                    </span>
                  )}
                </div>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  {isPartnerTyping ? 'Typing...' : 'Online'}
                </p>
              </div>

              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-secondary hover:bg-gray-100 transition-colors"
                  aria-label="Chat options"
                >
                  <MoreVertical size={16} />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                    <button
                      onClick={handleNewPartner}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-secondary hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={14} className="text-primary" />
                      New Partner
                    </button>
                    <button
                      onClick={handleEndChat}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      End Chat
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Container */}
            <div ref={chatContainerRef} className="relative z-0 flex-1 overflow-y-auto pb-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!msg.isMine && (
                    <img
                      src={avatarMap[partnerAvatar] || avatar1}
                      alt={partnerName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl w-full ${
                        msg.isMine
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white/90 backdrop-blur-sm text-secondary rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-gray-400">{msg.time}</span>
                      {msg.isMine && <StatusIcon status={msg.status} />}
                    </div>
                  </div>
                </div>
              ))}

              {/* ✅ Typing bubble */}
              {isPartnerTyping && (
                <TypingBubble
                  avatarSrc={avatarMap[partnerAvatar] || avatar1}
                  name={partnerName}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-3 mt-auto flex-shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder={`Message ${partnerName}...`}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors text-secondary bg-white"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-600 transition-colors p-1.5"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* New Partner Modal */}
      {showNewPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelNewPartner} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button onClick={cancelNewPartner} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Find New Partner?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to leave this conversation with {partnerName} and find a new partner?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelNewPartner}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmNewPartner}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  Find New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* End Chat Modal */}
      {showEndChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelEndChat} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button onClick={cancelEndChat} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">End Chat?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to end this conversation with {partnerName}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelEndChat}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEndChat}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  End Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Leaving page modal (browser navigation / refresh) */}
      {showLeavePageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">Leaving the page?</h3>
              <p className="text-gray-600 mb-6">
                Leaving now will end your current conversation with {partnerName}. Do you want to continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLeavePageModal(false)
                    setPendingNavigation(null)
                  }}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Stay
                </button>
                <button
                  onClick={async () => {
                    setShowLeavePageModal(false)
                    if (conversationId) {
                      try { await chatService.endConversation(conversationId) } catch (err) { console.error(err) }
                    }
                    if (presenceChannelRef.current) {
                      presenceChannelRef.current.unsubscribe()
                      presenceChannelRef.current = null
                    }
                    if (pendingNavigation) pendingNavigation()
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatRoom