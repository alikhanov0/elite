import { createContext, useContext, useState, useEffect } from 'react'
import axios from '../api/axios'

const AuthContext = createContext<any>(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)

  const fetchMe = async () => {
    try { 
      const res = await axios.get('/auth/me')
      setUser(res.data.user)
    } catch {
      localStorage.removeItem('token')
    }
  }

  useEffect(() => {
  const token = localStorage.getItem('token')
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}` // 👈 ДОБАВЬ ЭТО
    fetchMe()
  }
}, [])

  const login = async (username: string, password: string) => {
    const res = await axios.post('/auth/login', { username, password })
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)

    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
