import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Student {
  id: number
  name: string
  surname: string
  username: string
}

interface Component {
  id: number
  name: string // Math / Languages
  category: string // Logic, Vocabulary, etc.
}

export default function DiagnosticsResultsManager() {
  const [students, setStudents] = useState<Student[]>([])
  const [components, setComponents] = useState<Component[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)

  // 1️⃣ Загрузка студентов и компонентов
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const usersRes = await axios.get('/admin/users')
        const compsRes = await axios.get('/admin/components')

        const onlyStudents = usersRes.data.users.filter((u: any) => u.role === 'student')
        setStudents(onlyStudents)
        setComponents(compsRes.data.components)
      } catch (err) {
        console.error('Ошибка при загрузке пользователей и компонентов:', err)
      }
    }

    fetchInitial()
  }, [])

  // 2️⃣ Загрузка оценок после загрузки компонентов + выбора студента
  useEffect(() => {
    const fetchScores = async () => {
      if (!selectedStudentId || components.length === 0) return
      setLoading(true)

      try {
        const res = await axios.get(`/student/diagnostics/${selectedStudentId}`)
        const resultMap: Record<number, number> = {}

        res.data.results.forEach((r: any) => {
          resultMap[r.componentId] = r.score
        })

        const filledScores: Record<number, number> = {}
        components.forEach((c: Component) => {
          filledScores[c.id] = resultMap[c.id] ?? 0
        })

        setScores(filledScores)
      } catch (err) {
        console.error('Ошибка при загрузке результатов:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchScores()
  }, [selectedStudentId, components])

  const handleChange = (componentId: number, value: number) => {
    const clamped = Math.min(10, Math.max(0, value))
    setScores(prev => ({
      ...prev,
      [componentId]: clamped
    }))
  }

  const handleSave = async () => {
    if (!selectedStudentId) return

    try {
      await Promise.all(
        Object.entries(scores).map(([componentId, score]) =>
          axios.post('/admin/diagnostics/update', {
            studentId: selectedStudentId,
            componentId: +componentId,
            score: +score
          })
        )
      )
      alert('✅ Оценки успешно сохранены')
    } catch (err) {
      console.error('Ошибка при сохранении:', err)
      alert('❌ Ошибка при сохранении')
    }
  }

  // 🔍 Сортировка по предметам
  const mathComponents = components.filter(c => c.name.trim().toLowerCase() === 'math')
  const languageComponents = components.filter(c => c.name.trim().toLowerCase() === 'languages')


  console.log('🔍 mathComponents:', mathComponents)
  console.log('🧠 categories:', mathComponents.map(c => c.category))
  console.log('📊 scores:', scores)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold">📊 Управление результатами диагностики</h2>

      <select
        className="border p-2 rounded w-full"
        value={selectedStudentId ?? ''}
        onChange={e => setSelectedStudentId(+e.target.value)}
      >
        <option value="">Выберите студента</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} {s.surname} ({s.username})
          </option>
        ))}
      </select>

      {selectedStudentId && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-gray-500">Загрузка оценок...</p>
          ) : (
            <>
              {/* 🔢 Инпуты */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="font-bold text-lg mb-2">📐 Math</h3>
                  <div className="space-y-2">
                    {mathComponents.map(c => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <div>
                          <div className="font-semibold">{c.category}</div>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={scores[c.id] ?? ''}
                          onChange={e => handleChange(c.id, +e.target.value)}
                          className="border p-1 rounded w-20 text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-2">🗣️ Language</h3>
                  <div className="space-y-2">
                    {languageComponents.map(c => (
                      <div
                        key={c.id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <div>
                          <div className="font-semibold">{c.category}</div>
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={scores[c.id] ?? ''}
                          onChange={e => handleChange(c.id, +e.target.value)}
                          className="border p-1 rounded w-20 text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 🕸️ Диаграммы */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-gray-50 p-4 rounded shadow min-h-[400px]">
                  <Radar
                    data={{
                      labels: mathComponents.map(c => c.category),
                      datasets: [
                        {
                          label: 'Math',
                          data: mathComponents.map(c => scores[c.id] ?? 0),
                          backgroundColor: 'rgba(59, 130, 246, 0.2)',
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgb(59, 130, 246)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          min: 0,
                          max: 10,
                          ticks: { stepSize: 1 },
                          pointLabels: {
                            font: { size: 14 },
                            padding: 10
                          },
                        },
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded shadow min-h-[500px]">
                  <Radar
                    data={{
                      labels: languageComponents.map(c => c.category),
                      datasets: [
                        {
                          label: 'Language',
                          data: languageComponents.map(c => scores[c.id] ?? 0),
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          borderColor: 'rgb(34, 197, 94)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgb(34, 197, 94)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          min: 0,
                          max: 10,
                          ticks: { stepSize: 1 },
                          pointLabels: {
                            font: { size: 14 },
                            padding: 10
                          },
                        },
                      },
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </div>

              {/* 💾 Сохранение */}
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                💾 Сохранить оценки
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
