// context/ChatGuardContext.jsx
import React, { createContext, useContext, useState, useRef, useCallback } from 'react'

const ChatGuardContext = createContext(null)

export function ChatGuardProvider({ children }) {
  // Whether a chat is currently active (matched with a partner)
  const [isChatActive, setIsChatActive] = useState(false)
  // A ref to the endChat function registered by ChatRoom
  const endChatRef = useRef(null)

  const registerEndChat = useCallback((fn) => {
    endChatRef.current = fn
  }, [])

  const endActiveChat = useCallback(async () => {
    if (endChatRef.current) {
      await endChatRef.current()
    }
    setIsChatActive(false)
  }, [])

  return (
    <ChatGuardContext.Provider
      value={{ isChatActive, setIsChatActive, registerEndChat, endActiveChat }}
    >
      {children}
    </ChatGuardContext.Provider>
  )
}

export function useChatGuard() {
  const ctx = useContext(ChatGuardContext)
  if (!ctx) throw new Error('useChatGuard must be used within ChatGuardProvider')
  return ctx
}