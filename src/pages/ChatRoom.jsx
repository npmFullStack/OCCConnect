// pages/ChatRoom.jsx
import React, { useState } from 'react'
import { Send, MessageCircle, User as UserIcon } from 'lucide-react'

function ChatRoom() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex', text: 'Hey everyone! 👋', time: '10:30 AM' },
    { id: 2, user: 'Sarah', text: 'How is everyone doing today?', time: '10:32 AM' },
    { id: 3, user: 'Mike', text: 'Ready for the upcoming exams?', time: '10:35 AM' },
  ])
  const [newMessage, setNewMessage] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        user: user.username || 'Anonymous',
        text: newMessage.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
    setNewMessage('')
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl min-h-[60vh]">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={24} className="text-primary" />
        <h2 className="text-2xl font-bold text-secondary">ChatHub</h2>
        <span className="text-sm text-gray-500 ml-auto">
          {messages.length} messages
        </span>
      </div>

      {/* Messages Container */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <UserIcon size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-secondary">{msg.user}</span>
                <span className="text-xs text-gray-400">{msg.time}</span>
              </div>
              <p className="text-gray-700">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-primary focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Send size={20} />
          Send
        </button>
      </form>
    </div>
  )
}

export default ChatRoom