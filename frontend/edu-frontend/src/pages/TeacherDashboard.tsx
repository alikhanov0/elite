import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { useAuth } from '../auth/AuthContext'
import LessonConduct from './LessonConduct'

interface Group {
  id: number
  name: string
}

interface Lesson {
  id: number
  name: string
  date: string
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  const [newLessonName, setNewLessonName] = useState('')
  const [newLessonDate, setNewLessonDate] = useState('')

  const fetchGroups = async () => {
    const res = await axios.get('/teacher/groups')
    setGroups(res.data.groups)
  }

  const fetchLessons = async (groupId: number) => {
    const res = await axios.get(`/teacher/group/${groupId}/lessons`)
    setLessons(res.data.lessons)
  }

  const handleCreateLesson = async () => {
    if (!selectedGroupId || !newLessonName || !newLessonDate) return
    await axios.post(`/teacher/group/${selectedGroupId}/create-lesson`, {
      name: newLessonName,
      date: newLessonDate
    })
    setNewLessonName('')
    setNewLessonDate('')
    fetchLessons(selectedGroupId)
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      fetchLessons(selectedGroupId)
      setSelectedLessonId(null)
    }
  }, [selectedGroupId])

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">🧑‍🏫 Панель учителя</h2>

      {/* Выбор группы */}
      <div>
        <label className="block text-sm font-medium mb-1">📚 Выберите группу:</label>
        <select
          value={selectedGroupId ?? ''}
          onChange={(e) => setSelectedGroupId(+e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">-- Выберите группу --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Уроки группы */}
      {selectedGroupId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📅 Уроки</h3>

          <ul className="space-y-2">
            {lessons.map(lesson => (
              <li
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`border p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  lesson.id === selectedLessonId ? 'bg-blue-100' : ''
                }`}
              >
                <div className="font-semibold">{lesson.name}</div>
                <div className="text-sm text-gray-600">{new Date(lesson.date).toLocaleString()}</div>
              </li>
            ))}
          </ul>

          {/* Добавить урок */}
          <div className="space-y-2 mt-4">
            <input
              type="text"
              placeholder="Название урока"
              className="border p-2 rounded w-full"
              value={newLessonName}
              onChange={(e) => setNewLessonName(e.target.value)}
            />
            <input
              type="datetime-local"
              className="border p-2 rounded w-full"
              value={newLessonDate}
              min="2000-01-01T00:00"
              max="2124-12-31T23:59"
              onChange={(e) => setNewLessonDate(e.target.value)}
            />
            <button
              onClick={handleCreateLesson}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ➕ Добавить урок
            </button>
          </div>
        </div>
      )}

      {/* Проведение урока */}
      {selectedLessonId && (
        <LessonConduct lessonId={selectedLessonId} />
      )}
    </div>
  )
}
