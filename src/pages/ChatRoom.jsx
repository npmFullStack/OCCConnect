// pages/ChatRoom.jsx
import React, { useState, useRef, useEffect } from 'react'
import { Send, Check, CheckCheck, LogOut, X } from 'lucide-react'
import Button from '../components/Button'
import avatar2 from '../assets/avatars/avatar2.png'

function ChatRoom() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      user: 'Mark', 
      text: 'Hey there! How are you doing? 👋', 
      time: '10:30 AM',
      isMine: false,
      status: 'seen'
    },
    { 
      id: 2, 
      user: 'You', 
      text: 'I\'m doing great! How about you?', 
      time: '10:31 AM',
      isMine: true,
      status: 'seen'
    },
    { 
      id: 3, 
      user: 'Mark', 
      text: 'I\'m good too! Ready for the group study session later?', 
      time: '10:32 AM',
      isMine: false,
      status: 'seen'
    },
    { 
      id: 4, 
      user: 'You', 
      text: 'Definitely! What time were we meeting?', 
      time: '10:33 AM',
      isMine: true,
      status: 'seen'
    },
    { 
      id: 5, 
      user: 'Mark', 
      text: '3 PM at the library. Don\'t forget to bring your notes! 📚', 
      time: '10:34 AM',
      isMine: false,
      status: 'delivered'
    },
  ])
  const [newMessage, setNewMessage] = useState('')
  const [showEndChatModal, setShowEndChatModal] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        user: 'You',
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMine: true,
        status: 'sent'
      }
    ])
    setNewMessage('')

    // Simulate Mark's reply
    setTimeout(() => {
      const replies = [
        'That\'s interesting! Tell me more.',
        'I totally agree with you!',
        'Haha, that\'s funny! 😄',
        'Got it! See you soon!',
        'Thanks for sharing!'
      ]
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        user: 'Mark',
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
      }, 1000)
    }, 1500)
  }

  const handleEndChat = () => {
    setShowEndChatModal(true)
  }

  const confirmEndChat = () => {
    setShowEndChatModal(false)
    window.location.href = '/app'
  }

  const cancelEndChat = () => {
    setShowEndChatModal(false)
  }

  const StatusIcon = ({ status }) => {
    if (status === 'sent') return <Check size={14} className="text-gray-400" />
    if (status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />
    if (status === 'seen') return <CheckCheck size={14} className="text-blue-500" />
    return null
  }

  return (
    <div className="relative h-[calc(100vh-200px)] flex flex-col">
      {/* Background Grid - Same as Home */}
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
        {/* Chat Header with Mark and End Button - Fixed */}
        <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-4 flex-shrink-0">
          <img
            src={avatar2}
            alt="Mark"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary"
          />
          <div className="flex-1">
            <h3 className="font-bold text-secondary" style={{ fontFamily: "'Cherry Bomb One', sans-serif" }}>
              Mark
            </h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
              Online
            </p>
          </div>
          <Button 
            variant="danger-outline" 
            size="sm"
            icon={LogOut}
            onClick={handleEndChat}
            className="px-4 py-2 text-sm flex-shrink-0"
          >
            End Chat
          </Button>
        </div>

        {/* Messages Container - Scrollable */}
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
                  src={avatar2}
                  alt="Mark"
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                    msg.isMine 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-white/90 backdrop-blur-sm text-secondary rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
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

        {/* Message Input - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-3 mt-auto flex-shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
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
      </div>

      {/* End Chat Modal */}
      {showEndChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={cancelEndChat}
          />
          
          {/* Modal */}
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
                Are you sure you want to end this chat? You can always start a new conversation with Mark later.
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