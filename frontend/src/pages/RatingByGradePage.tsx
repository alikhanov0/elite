import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

type Rating = {
  id: number
  name: string
  surname: string
  totalScore: number
}


export default function RatingByGradePage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [grade, setGrade] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const fetch = async () => {
    if (!grade.trim()) return
    setIsLoading(true)
    try {
      console.log('Grade:', grade)
      const res = await axios.get(`/rating/group/${grade}`)
      setRatings(res.data.ratings)
    } catch (e) {
      console.error('Ошибка загрузки рейтинга:', e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">← Назад</button>
      <h2 className="text-2xl font-bold mb-4">🎓 Рейтинг по параллели</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Введите параллель"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="border px-3 py-2 rounded w-40"
        />
        <button
          onClick={fetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Показать рейтинг
        </button>
      </div>

      {isLoading && <p>Загрузка...</p>}
      {!isLoading && ratings.length > 0 && (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Имя</th>
              <th className="p-2 text-left">Фамилия</th>
              <th className="p-2 text-right">Баллы</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.surname}</td>
                <td className="p-2 text-right font-semibold">{s.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
