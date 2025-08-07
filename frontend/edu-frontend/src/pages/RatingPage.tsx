import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

interface StudentRating {
  id: number
  name: string
  surname: string
  totalScore: number
}

export default function RatingPage() {
  const [ratings, setRatings] = useState<StudentRating[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await axios.get('/rating')
        setRatings(res.data.ratings)
      } catch (err) {
        console.error('Ошибка загрузки рейтинга:', err)
      }
    }

    fetchRating()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)} // можно заменить на navigate('/dashboard') если нужно фиксировано
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>

      <h2 className="text-2xl font-bold mb-4">📊 Рейтинг студентов (текущий месяц)</h2>

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
          {ratings.map((s, index) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.surname}</td>
              <td className="p-2 text-right font-semibold">{s.totalScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
