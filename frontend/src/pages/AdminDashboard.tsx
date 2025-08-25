import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'
import LessonAnalytics from './LessonAnalytics'
import { isBefore, isAfter, subYears } from 'date-fns'

interface User {
  id: number
  name: string
  surname: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  email: string
  birthday?: string | null 
}

interface Group {
  id: number
  name: string
}

/* interface News {
  id: number
  title: string
  text: string
  createdAt: string
} */

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<User[]>([])
  const [/*groups*/, setGroups] = useState<Group[]>([])
  //const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  // 📥 Загрузка пользователей
  const fetchUsers = async () => {
    const res = await axios.get('/admin/users')
    const sorted = res.data.users.slice().sort((a: User, b: User) => {
      const nameA = `${a.surname} ${a.name}`.toLowerCase()
      const nameB = `${b.surname} ${b.name}`.toLowerCase()
      return nameA.localeCompare(nameB)
    })
    setUsers(sorted)
    setLoading(false)
  }

  // 📥 Загрузка групп
  const fetchGroups = async () => {
    const res = await axios.get('/admin/groups')
    setGroups(res.data.groups)
  }

  // 📥 Загрузка новостей
  const fetchNews = async () => {
    //const res = await axios.get('/news')
    //setNews(res.data)
  }

  // 🔁 Обновление роли
  const handleRoleChange = async (id: number, role: string) => {
    await axios.put(`/admin/users/${id}/role`, { role })
    fetchUsers()
  }

  // ❌ Удаление пользователя
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Удалить пользователя?')) return
    await axios.delete(`/admin/users/${id}`)
    fetchUsers()
  }

  // ❌ Удаление новости
  /*const handleDeleteNews = async (id: number) => {
    if (!confirm('Удалить объявление?')) return
    await axios.delete(`/news/${id}`)
    fetchNews()
  }*/

  async function handleBirthdayChange(userId: number, dateStr: string) {
    const date = new Date(dateStr)
    const minDate = subYears(new Date(), 80)
    const maxDate = subYears(new Date(), 1)

    if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      alert('Дата рождения должна быть от 1 до 80 лет назад')
      fetchUsers()
      return
    }

    await axios.put(`/admin/users/${userId}/birthday`, { birthday: dateStr })
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
    fetchGroups()
    fetchNews()
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🛠️ Панель администратора</h2>
        <button
          onClick={() => navigate('/admin/register')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ➕ Добавить пользователя
        </button>
      </div>

      {/* 📘 Список групп */}
      <div>
        <h3 className="text-lg font-semibold mb-2">📘 Группы</h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => navigate('/admin/groups/create')}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            ➕ Создать группу
          </button>
          <button
            onClick={() => navigate('admin/groups/delete')}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
              Удалить группу
          </button>

        </div>
        
      </div>

      {/* 📰 Новости */}
      <div>
        <h3 className="text-lg font-semibold mb-2">📰 Новости</h3>
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => navigate('/admin/news/create')}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            ➕ Создать объявление
          </button>
          <button
            onClick={() => navigate('admin/news/delete')}
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg"
          >
              Удалить объявление
          </button>

        </div>
        
      </div>

      {/* 📋 Таблица пользователей */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">👤 Пользователи</h3>
        {loading ? (
          <p>Загрузка...</p>
        ) : (
          <table className="w-full border shadow text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Имя</th>
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Роль</th>
                <th className="p-2">Д.р.</th>
                <th className="p-2 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">{user.surname} {user.name}</td>
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <select
                      className="border p-1 rounded"
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      defaultValue={user.birthday ? user.birthday.slice(0, 10) : ''}
                      onBlur={e => handleBirthdayChange(user.id, e.target.value)}
                      className="border p-1 rounded"
                      max={subYears(new Date(), 1).toISOString().slice(0, 10)}
                      min={subYears(new Date(), 80).toISOString().slice(0, 10)}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📊 Аналитика по урокам */}
      <div className="space-y-4 mt-10">
        <h3 className="text-xl font-bold">📅 Аналитика по урокам</h3>
        <select
          className="border p-2 rounded w-full max-w-sm"
          value={selectedStudentId ?? ''}
          onChange={e => setSelectedStudentId(+e.target.value)}
        >
          <option value="">Выберите студента</option>
          {users.filter(u => u.role === 'student').map(student => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname} ({student.username})
            </option>
          ))}
        </select>

        {selectedStudentId && (
          <LessonAnalytics studentId={selectedStudentId} readOnly={false} />
        )}
      </div>
    </div>
  )
}
