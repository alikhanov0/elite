import { useEffect, useState } from 'react'
import axios from '../api/axios'

export default function GradePanel() {
  const [lessons, setLessons] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null)
  const [grades, setGrades] = useState<Record<number, any>>({}) // studentId → оценка

  useEffect(() => {
    const fetchLessons = async () => {
      const res = await axios.get('/lessons/all')
      setLessons(res.data.lessons)
    }
    const fetchStudents = async () => {
      const res = await axios.get('/admin/users') 
      const onlyStudents = res.data.users.filter((u: any) => u.role === 'student')
      setStudents(onlyStudents)
    }
    fetchLessons()
    fetchStudents()
  }, [])

  const handleChange = (studentId: number, field: string, value: any) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    if (!selectedLesson) return
    for (const studentId in grades) {
      const g = grades[studentId]
      await axios.post(`/lessons/${selectedLesson}/grade`, {
        studentId,
        score: +g.score || 0,
        homeworkScore: +g.homeworkScore || 0,
        status: g.status || 'visited',
        comment: g.comment || ''
      })
    }
    alert('✅ Оценки сохранены')
  }

  return (
    <div className="p-6 space-y-6 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-bold">📝 Выставление оценок</h2>

      <select
        className="border p-2 rounded w-full"
        onChange={e => setSelectedLesson(+e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Выберите урок</option>
        {lessons.map(lesson => (
          <option key={lesson.id} value={lesson.id}>
            {lesson.name} — {new Date(lesson.date).toLocaleDateString()}
          </option>
        ))}
      </select>

      {selectedLesson && (
        <div className="space-y-4">
          {students.map(student => {
            const g = grades[student.id] || {}
            return (
              <div key={student.id} className="border p-4 rounded space-y-2">
                <div className="font-semibold">{student.name} {student.surname}</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Оценка за урок"
                    value={g.score || ''}
                    onChange={e => handleChange(student.id, 'score', e.target.value)}
                  />
                  <input
                    className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder="Оценка за ДЗ"
                    value={g.homeworkScore || ''}
                    onChange={e => handleChange(student.id, 'homeworkScore', e.target.value)}
                  />
                  <select
                    className="border p-2 rounded col-span-2"
                    value={g.status || 'visited'}
                    onChange={e => handleChange(student.id, 'status', e.target.value)}
                  >
                    <option value="visited">Присутствовал</option>
                    <option value="absent_reasoned">Отсутствие по уважительной</option>
                    <option value="absent_unreasoned">Отсутствие без уважительной</option>
                  </select>
                  <textarea
                    className="border p-2 rounded col-span-2"
                    placeholder="Комментарий"
                    value={g.comment || ''}
                    onChange={e => handleChange(student.id, 'comment', e.target.value)}
                  />
                </div>
              </div>
            )
          })}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            onClick={handleSubmit}
          >
            💾 Сохранить оценки
          </button>
        </div>
      )}
    </div>
  )
}
