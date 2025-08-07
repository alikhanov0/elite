import { useNavigate } from 'react-router-dom'

export default function RatingPage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate("/login")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>

      <h2 className="text-2xl font-bold mb-6">📊 Рейтинг студентов</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/rating/all')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Весь рейтинг
        </button>
        <button
          onClick={() => navigate('/rating/by-grade')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Рейтинг по параллели
        </button>
      </div>
    </div>
  )
}
