// pages/ChatRoom.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, Check, CheckCheck, LogOut, X, Users, Loader2, Clock } from 'lucide-react'
import Button from '../components/Button'
import avatar2 from '../assets/avatars/avatar2.png'
import avatar3 from '../assets/avatars/avatar3.png'
import avatar1 from '../assets/avatars/avatar1.png'

function ChatRoom() {
  const [isMatched, setIsMatched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchTime, setSearchTime] = useState(0)
  const [partnerName, setPartnerName] = useState('')
  const [partnerAvatar, setPartnerAvatar] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEndChatModal, setShowEndChatModal] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)
  const searchIntervalRef = useRef(null)

  const avatars = [avatar1, avatar2, avatar3]
  const partnerNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Avery']

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    return () => {
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startMatching = () => {
    setIsSearching(true)
    setSearchTime(0)
    
    // Start timer
    searchIntervalRef.current = setInterval(() => {
      setSearchTime(prev => prev + 1)
    }, 1000)

    // Simulate finding a match after 2-5 seconds
    const matchDelay = Math.floor(Math.random() * 3000) + 2000
    setTimeout(() => {
      // Stop timer
      if (searchIntervalRef.current) {
        clearInterval(searchIntervalRef.current)
      }
      
      // Select random partner
      const randomName = partnerNames[Math.floor(Math.random() * partnerNames.length)]
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)]
      
      setPartnerName(randomName)
      setPartnerAvatar(randomAvatar)
      setIsMatched(true)
      setIsSearching(false)
      
      // Add welcome message - no emojis
      setMessages([
        {
          id: 1,
          user: randomName,
          text: `Hey there! I'm ${randomName}. Nice to meet you!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: false,
          status: 'seen'
        },
        {
          id: 2,
          user: 'You',
          text: `Hi ${randomName}! Great to meet you too!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: true,
          status: 'seen'
        }
      ])
    }, matchDelay)
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !isMatched) return

    const newMsg = {
      id: messages.length + 1,
      user: 'You',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      status: 'sent'
    }
    
    setMessages(prev => [...prev, newMsg])
    setNewMessage('')

    // Simulate partner's reply - no emojis
    setTimeout(() => {
      const replies = [
        "That's really interesting. Tell me more about that.",
        "I totally agree with you on that!",
        "Oh wow, I didn't know that. Thanks for sharing!",
        "That sounds awesome. What else?",
        "I feel the same way about that topic.",
        "That's a great point you made!",
        "Hmm, I never thought about it that way before.",
        "That's cool! Tell me more about your experience.",
        "I've been thinking about that too.",
        "That makes a lot of sense actually."
      ]
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        user: partnerName,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: false,
        status: 'delivered'
      }])
      // Update status to seen after a moment
      setTimeout(() => {
        setMessages(prev => {
          const updated = [...prev]
          const lastIndex = updated.length - 1
          if (updated[lastIndex] && !updated[lastIndex].isMine) {
            updated[lastIndex].status = 'seen'
          }
          return updated
        })
      }, 800)
    }, 1200 + Math.random() * 1000)
  }

  const handleEndChat = () => {
    setShowEndChatModal(true)
  }

  const confirmEndChat = () => {
    setShowEndChatModal(false)
    // Reset chat state
    setIsMatched(false)
    setPartnerName('')
    setPartnerAvatar(null)
    setMessages([])
    if (searchIntervalRef.current) {
      clearInterval(searchIntervalRef.current)
    }
  }

  const cancelEndChat = () => {
    setShowEndChatModal(false)
  }

  const findNewPartner = () => {
    setShowEndChatModal(false)
    setIsMatched(false)
    setPartnerName('')
    setPartnerAvatar(null)
    setMessages([])
    startMatching()
  }

  const StatusIcon = ({ status }) => {
    if (status === 'sent') return <Check size={14} className="text-gray-400" />
    if (status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />
    if (status === 'seen') return <CheckCheck size={14} className="text-blue-500" />
    return null
  }

  // Format search time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <div className="relative h-[calc(100vh-200px)] flex flex-col">
      {/* Background Grid */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e2e8f0 1px, transparent 1px),
            linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
          `,
          backgroundSize: "20px 30px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
        }}
      />

      {/* Chat Content */}
      <div className="relative z-10 flex flex-col h-full">
        {!isMatched && !isSearching ? (
          // Start Matching Screen
          <div className="flex-1 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm p-8">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={48} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-2">
                Find a Chat Partner
              </h2>
              <p className="text-gray-600 mb-8">
                Connect with fellow OCC students and start meaningful conversations instantly!
              </p>
              <Button
                onClick={startMatching}
                icon={Users}
                size="lg"
                fullWidth
                className="py-3.5 text-lg"
              >
                Find Chat Partner
              </Button>
              <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
                
                <span>Your conversations are private and secure</span>
              </div>
            </div>
          </div>
        ) : isSearching ? (
          // Searching Screen
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
              <h2 className="text-2xl font-bold text-secondary mb-2">
                Finding a Match
              </h2>
              <p className="text-gray-600 mb-2">
                Looking for someone to chat with...
              </p>
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
                onClick={() => {
                  if (searchIntervalRef.current) {
                    clearInterval(searchIntervalRef.current)
                  }
                  setIsSearching(false)
                }}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
              >
                Cancel search
              </button>
            </div>
          </div>
        ) : (
          // Chat Interface
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-4 flex-shrink-0">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              />
              <div className="flex-1">
                <h3 className="font-bold text-secondary">
                  {partnerName}
                </h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  Online
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={Users}
                  onClick={findNewPartner}
                  className="px-3 py-1.5 text-sm flex-shrink-0"
                >
                  New
                </Button>
                <Button 
                  variant="danger-outline" 
                  size="sm"
                  icon={LogOut}
                  onClick={handleEndChat}
                  className="px-3 py-1.5 text-sm flex-shrink-0"
                >
                  End
                </Button>
              </div>
            </div>

            {/* Messages Container */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto pb-4 space-y-3"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-2 ${msg.isMine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!msg.isMine && (
                    <img
                      src={partnerAvatar}
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
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-3 mt-auto flex-shrink-0">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
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

      {/* End Chat Modal */}
      {showEndChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelEndChat}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <button
              onClick={cancelEndChat}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary mb-2">
                End Chat?
              </h3>
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
    </div>
  )
}

export default ChatRoom