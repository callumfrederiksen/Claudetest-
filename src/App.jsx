import { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Game from './components/Game'

export default function App() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [page, setPage] = useState('dashboard')

  useEffect(() => {
    const token = localStorage.getItem('chess_token')
    const saved = localStorage.getItem('chess_user')
    if (token && saved) setUser(JSON.parse(saved))
    setReady(true)
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('chess_token', token)
    localStorage.setItem('chess_user', JSON.stringify(userData))
    setUser(userData)
    setPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('chess_token')
    localStorage.removeItem('chess_user')
    setUser(null)
    setPage('dashboard')
  }

  if (!ready) return null
  if (!user) return <Auth onLogin={handleLogin} />
  if (page === 'game') return <Game user={user} onBack={() => setPage('dashboard')} />
  return <Dashboard user={user} onLogout={handleLogout} onPlay={() => setPage('game')} />
}
