import { useEffect, useState } from 'react'
import axios from '../api/axios'

interface Student {
  id: number
  name: string
  surname: string
  status: 'visited' | 'absent_reasoned' | 'absent_unreasoned'
  score: number
  homeworkScore: number
}

interface Props {
  lessonId: number
}

export default function LessonConduct({ lessonId }: Props) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStudents = async () => {
    const res = await axios.get(`/teacher/lesson/${lessonId}/students`)
    setStudents(res.data.students)
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [lessonId])

  const handleChange = (id: number, field: keyof Student, value: any) => {
    const clamped = Math.min(10, Math.max(0, value))
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: clamped } : s)
    )
  }

  const handleSave = async () => {
  const payload = students.map(s => ({
    studentId: s.id,
    status: s.status,
    score: s.score,
    homeworkScore: s.homeworkScore
  }))

  await axios.post(`/teacher/lesson/${lessonId}/save`, payload)
  alert('✅ Успешно сохранено')
}



  if (loading) return <p>Загрузка студентов...</p>

  return (
    <div className="space-y-4 mt-8">
      <h3 className="text-xl font-bold">📝 Проведение урока</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Студент</th>
            <th className="p-2">Статус</th>
            <th className="p-2">Оценка</th>
            <th className="p-2">Оценка за ДЗ</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name} {s.surname}</td>
              <td className="p-2">
                <select
                  className="border rounded px-2 py-1"
                  value={s.status}
                  onChange={e => handleChange(s.id, 'status', e.target.value)}
                >
                  <option value="visited">✅ Был</option>
                  <option value="absent_reasoned">🟡 Уважительная</option>
                  <option value="absent_unreasoned">🔴 Без уваж.</option>
                </select>
              </td>
              <td className="p-2">
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={s.score}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      let value = e.target.value.replace(/^0+/, '') || '0'
      const numeric = parseInt(value, 10)
      if (!isNaN(numeric) && numeric >= 0 && numeric <= 10) {
        handleChange(s.id, 'score', numeric)
      }
    }}
    onBlur={(e) => {
      let value = parseInt(e.target.value, 10)
      if (isNaN(value) || value < 0) value = 0
      if (value > 10) value = 10
      handleChange(s.id, 'score', value)
    }}
    className="border p-1 rounded w-16 text-center"
  />
</td>

<td className="p-2">
  <input
    type="text"
    inputMode="numeric"
    pattern="[0-9]*"
    value={s.homeworkScore}
    onFocus={(e) => e.target.select()}
    onChange={(e) => {
      let value = e.target.value.replace(/^0+/, '') || '0'
      const numeric = parseInt(value, 10)
      if (!isNaN(numeric) && numeric >= 0 && numeric <= 10) {
        handleChange(s.id, 'homeworkScore', numeric)
      }
    }}
    onBlur={(e) => {
      let value = parseInt(e.target.value, 10)
      if (isNaN(value) || value < 0) value = 0
      if (value > 10) value = 10
      handleChange(s.id, 'homeworkScore', value)
    }}
    className="border p-1 rounded w-16 text-center"
  />
</td>

            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        💾 Сохранить
      </button>
    </div>
  )
}
