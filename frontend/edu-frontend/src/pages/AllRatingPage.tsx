import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios'

interface Rating {
  id: number
  name: string
  surname: string
  totalScore: number
}

export default function AllRatingPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true)
      try {
        const res = await axios.get('/rating/all')
        setRatings(res.data.ratings)
      } catch (e) {
        console.error('Ошибка загрузки рейтинга:', e)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">← Назад</button>
      <h2 className="text-2xl font-bold mb-4">🌍 Весь рейтинг</h2>
      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
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
