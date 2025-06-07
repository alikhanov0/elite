import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await login(username, password)
    navigate('/')
  } catch (err: any) {
    console.error('Login failed:', err.response?.data || err.message)
    alert('❌ Ошибка авторизации. Проверь логин и пароль.')
  }
}


  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm space-y-4"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
        <span>🔐</span> Вход
      </h2>

      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
      >
        Войти
      </button>
    </form>
  </div>
)

}
