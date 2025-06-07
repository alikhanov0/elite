import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

export default function AdminRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    role: 'student'
  })

  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await axios.post('/auth/register', form)
      navigate('/') // ✅ вернуться на панель админа
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold text-center">➕ Добавление пользователя</h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Имя"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="surname"
          placeholder="Фамилия"
          value={form.surname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="student">Студент</option>
          <option value="teacher">Учитель</option>
          <option value="admin">Админ</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Зарегистрировать
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full text-blue-600 underline mt-2"
        >
          ← Назад
        </button>
      </form>
    </div>
  )
}
