// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserRegistration from './pages/UserRegistration'
import AppLayout from './layout/AppLayout'
import ChatRoom from './pages/ChatRoom'
import ConnectWall from './pages/ConnectWall'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { ChatGuardProvider } from './context/ChatGuardContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatGuardProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegistration />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ChatRoom />} />
              <Route path="connect-wall" element={<ConnectWall />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </ChatGuardProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App