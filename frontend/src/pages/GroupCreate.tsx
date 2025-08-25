import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

interface User {
  id: number
  name: string
  surname: string
  username: string
  role: 'student' | 'teacher'
}

export default function GroupCreate() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [teacherId, setTeacherId] = useState<number | null>(null)

  const [allTeachers, setAllTeachers] = useState<User[]>([])
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')

  const [groupStudents, setGroupStudents] = useState<User[]>([])

  // Загружаем всех пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/admin/users')
        const users: User[] = res.data.users
        setAllTeachers(users.filter(u => u.role === 'teacher'))
        setAllStudents(users.filter(u => u.role === 'student'))
      } catch (err) {
        console.error(err)
        alert('Ошибка при загрузке пользователей')
      }
    }
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !teacherId) {
      alert('Заполните все поля')
      return
    }

    try {
      const res = await axios.post('/admin/groups', { name, teacherId })
      const newGroupId = res.data.group.id
      // Если добавляли студентов до создания группы, можно их добавить после
      
      await Promise.all(
        groupStudents.map(student =>
          axios.post(`/admin/groups/${newGroupId}/students`, { studentId: student.id })
        )
      )


      alert('Группа успешно создана!')
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Ошибка при создании группы')
    }
  }

  const addStudentToGroup = () => {
    if (selectedStudentId === '') return
    const student = allStudents.find(s => s.id === selectedStudentId)
    if (!student) return
    setGroupStudents(prev => [...prev, student])
    setSelectedStudentId('')
  }

  const removeStudentFromGroup = (id: number) => {
    setGroupStudents(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">👥 Создать группу</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Название группы</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Введите название группы"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Учитель</label>
          <select
            value={teacherId ?? ''}
            onChange={e => setTeacherId(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          >
            <option value="" disabled>
              Выберите учителя
            </option>
            {allTeachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} {t.surname}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Студенты</label>
          <div className="flex gap-2 items-center mb-2">
            <select
              className="border p-2 rounded flex-1"
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
            >
              <option value="">➕ Добавить студента</option>
              {allStudents
                .filter(s => !groupStudents.some(gs => gs.id === s.id))
                .map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.surname}
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={addStudentToGroup}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Добавить
            </button>
          </div>

          <ul className="space-y-1">
            {groupStudents.map(s => (
              <li
                key={s.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>
                  {s.name} {s.surname} ({s.username})
                </span>
                <button
                  type="button"
                  onClick={() => removeStudentFromGroup(s.id)}
                  className="text-red-600 hover:underline"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ✅ Создать
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            ⬅ Назад
          </button>
        </div>
      </form>
    </div>
  )
}
