// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import UserRegistration from './pages/UserRegistration'
import AppLayout from './layout/AppLayout'
import ChatRoom from './pages/ChatRoom'
import ConnectWall from './pages/ConnectWall'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<UserRegistration />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<ChatRoom />} />
          <Route path="connect-wall" element={<ConnectWall />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App