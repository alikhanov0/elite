import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { useParams, useNavigate } from 'react-router-dom'

interface Group {
  id: number
  name: string
  teacherId: number
  teacher: { id: number; name: string; surname: string }
  students: { student: { id: number; name: string; surname: string; username: string } }[]
  lessons: { id: number; name: string; date: string }[]
}

interface User {
  id: number
  name: string
  surname: string
  username: string
  role: 'student' | 'teacher'
}

export default function AdminGroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [group, setGroup] = useState<Group | null>(null)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [allTeachers, setAllTeachers] = useState<User[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)

  const [newLessonName, setNewLessonName] = useState('')
  const [newLessonDate, setNewLessonDate] = useState('')
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [editingLessonName, setEditingLessonName] = useState('')
  const [editingLessonDate, setEditingLessonDate] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchGroup()
    fetchUsers()
  }, [id])

  const fetchGroup = async () => {
    const res = await axios.get(`/admin/groups/${id}`)
    setGroup(res.data.group)
    setSelectedTeacherId(res.data.group.teacherId)
  }

  const fetchUsers = async () => {
    const res = await axios.get('/admin/users')
    const users: User[] = res.data.users
    setAllStudents(users.filter(u => u.role === 'student'))
    setAllTeachers(users.filter(u => u.role === 'teacher'))
  }

  const addStudent = async (studentId: number) => {
    await axios.post(`/admin/groups/${id}/add-student`, { studentId })
    fetchGroup()
  }

  const removeStudent = async (studentId: number) => {
    await axios.post(`/admin/groups/${id}/remove-student`, { studentId })
    fetchGroup()
  }

  const saveTeacherChange = async () => {
    if (!selectedTeacherId) return
    await axios.post(`/admin/groups/${id}/change-teacher`, { teacherId: selectedTeacherId })
    fetchGroup()
  }

  const addLesson = async () => {
    if (!newLessonName || !newLessonDate) return
    await axios.post(`/admin/groups/${id}/add-lesson`, {
      name: newLessonName,
      date: newLessonDate
    })
    setNewLessonName('')
    setNewLessonDate('')
    fetchGroup()
  }

  const removeLesson = async (lessonId: number) => {
    await axios.delete(`/admin/groups/${id}/lessons/${lessonId}`)
    fetchGroup()
  }

  const startEditLesson = (lesson: Group['lessons'][0]) => {
    setEditingLessonId(lesson.id)
    setEditingLessonName(lesson.name)
    setEditingLessonDate(lesson.date.slice(0, 10))
  }

  const saveLessonEdit = async () => {
    if (!editingLessonId) return
    await axios.put(`/admin/groups/${id}/lessons/${editingLessonId}`, {
      name: editingLessonName,
      date: editingLessonDate
    })
    setEditingLessonId(null)
    setEditingLessonName('')
    setEditingLessonDate('')
    fetchGroup()
  }

  if (!group) return <p>Загрузка...</p>

  const currentStudentIds = group.students.map(s => s.student.id)
  const sortedLessons = [...group.lessons].sort((a, b) =>
    sortOrder === 'asc'
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm mb-4">
        ← Назад к панели администратора
      </button>

      <h2 className="text-3xl font-bold">👥 Группа: {group.name}</h2>

      {/* Учитель */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">🧑‍🏫 Учитель: {group.teacher?.name} {group.teacher?.surname}</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border p-2 rounded"
            value={selectedTeacherId ?? ''}
            onChange={(e) => setSelectedTeacherId(+e.target.value)}
          >
            {allTeachers.map(t => (
              <option key={t.id} value={t.id}>{t.name} {t.surname}</option>
            ))}
          </select>
          <button
            onClick={saveTeacherChange}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ✅ Сменить
          </button>
        </div>
      </div>

      {/* Студенты */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">🧑‍🎓 Студенты</h3>
        <ul className="space-y-1">
          {group.students.map(s => (
            <li key={s.student.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{s.student.name} {s.student.surname} ({s.student.username})</span>
              <button onClick={() => removeStudent(s.student.id)} className="text-red-600 hover:underline">Удалить</button>
            </li>
          ))}
        </ul>
        <select
          className="mt-2 border p-2 rounded"
          onChange={(e) => addStudent(+e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>➕ Добавить студента</option>
          {allStudents
            .filter(s => !currentStudentIds.includes(s.id))
            .map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.surname}
              </option>
            ))}
        </select>
      </div>

      {/* Уроки */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">📅 Уроки</h3>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-sm text-blue-600 hover:underline"
          >
            Сортировать: {sortOrder === 'asc' ? 'от старых к новым' : 'от новых к старым'}
          </button>
        </div>

        <ul className="space-y-1">
          {sortedLessons.map(l => (
            <li key={l.id} className="bg-gray-100 p-3 rounded space-y-1">
              {editingLessonId === l.id ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    className="border p-1 rounded w-full"
                    value={editingLessonName}
                    onChange={(e) => setEditingLessonName(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border p-1 rounded"
                    value={editingLessonDate}
                    onChange={(e) => setEditingLessonDate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={saveLessonEdit} className="bg-green-600 text-white px-3 py-1 rounded">💾 Сохранить</button>
                    <button onClick={() => setEditingLessonId(null)} className="text-gray-600 hover:underline">Отмена</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{l.name} — {new Date(l.date).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEditLesson(l)} className="text-blue-600 hover:underline">✏️ Редактировать</button>
                    <button onClick={() => removeLesson(l.id)} className="text-red-600 hover:underline">Удалить</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Новый урок */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            placeholder="Название урока"
            className="border p-2 rounded w-1/2"
            value={newLessonName}
            onChange={(e) => setNewLessonName(e.target.value)}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={newLessonDate}
            onChange={(e) => setNewLessonDate(e.target.value)}
          />
          <button
            onClick={addLesson}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            ➕ Добавить урок
          </button>
        </div>
      </div>
    </div>
  )
}
