import { useEffect, useState } from 'react'
import axios from '../api/axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js'
import { Line, Pie, Radar } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  TimeScale,
  ArcElement,
  RadialLinearScale
)

interface Props {
  studentId: number
  readOnly?: boolean
}

export default function LessonAnalytics({ studentId, readOnly = false }: Props) {
  const [lessons, setLessons] = useState<any[]>([])
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [components, setComponents] = useState<any[]>([])
  const [scores, setScores] = useState<{ [key: number]: number }>({})
  const [loading, setLoading] = useState(false)

  const fetchAnalytics = async () => {
    const params: Record<string, any> = { studentId }
    if (from) params.from = from
    if (to) params.to = to

    const res = await axios.get('/analytics/lesson', { params })
    setLessons(res.data.lessons)
  }

  const fetchComponents = async () => {
    setLoading(true)
    const res = await axios.get('/admin/components')
    setComponents(res.data.components)
    setLoading(false)
  }

  const fetchScores = async () => {
    const res = await axios.get(`/diagnostics/scores/${studentId}`)
    setScores(res.data.scores)
  }

  useEffect(() => {
    fetchAnalytics()
    fetchComponents().then(fetchScores)
  }, [studentId, from, to])

  const handleChange = (id: number, value: number) => {
    setScores(prev => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
  const payload = Object.entries(scores).map(([componentId, score]) => ({
    componentId: +componentId,
    score,
    studentId,
  }))
  await axios.post('admin/diagnostics/update', payload)
  alert('Оценки сохранены ✅')
}


  const visited = lessons.filter(l => l.status === 'visited').length
  const reasoned = lessons.filter(l => l.status === 'absent_reasoned').length
  const unreasoned = lessons.filter(l => l.status === 'absent_unreasoned').length

  const mathComponents = components.filter(c => c.name === 'Math')
  const languageComponents = components.filter(c => c.name === 'Languages')

  const pieData = {
    labels: ['✅ Посещено', '🟡 Пропуск (уваж)', '🔴 Пропуск (неуваж)'],
    datasets: [
      {
        data: [visited, reasoned, unreasoned],
        backgroundColor: ['#34d399', '#facc15', '#f87171'],
        borderColor: ['#059669', '#eab308', '#dc2626'],
        borderWidth: 1
      }
    ]
  }

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h3 className="text-lg font-bold">📈 Успеваемость и посещаемость</h3>

      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm text-gray-600">От:</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">До:</label>
          <input
            type="date"
            className="border rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
      </div>

      <Line
        data={{
          labels: lessons.map(l => new Date(l.date)),
          datasets: [
            {
              label: 'Оценка за урок',
              data: lessons.map(l => l.score),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.3
            },
            {
              label: 'Оценка за ДЗ',
              data: lessons.map(l => l.homeworkScore),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              tension: 0.3
            }
          ]
        }}
        options={{
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: { unit: 'day' },
              title: { display: true, text: 'Дата' }
            },
            y: {
              min: 0,
              max: 10,
              title: { display: true, text: 'Оценка' }
            }
          }
        }}
      />

      <div className="max-w-xs mx-auto mt-4">
        <h4 className="text-center text-md font-semibold mb-2">🧾 Посещаемость</h4>
        <Pie data={pieData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
        <div>
          <h3 className="font-bold text-lg mb-2">📐 Math</h3>
          <div className="space-y-2">
            {mathComponents.map(c => (
              <div key={c.id} className="flex justify-between items-center border p-2 rounded">
                <div className="font-semibold">{c.category}</div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={scores[c.id] ?? ''}
                  onChange={e => handleChange(c.id, +e.target.value)}
                  className="border p-1 rounded w-20 text-center"
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">🗣️ Language</h3>
          <div className="space-y-2">
            {languageComponents.map(c => (
              <div key={c.id} className="flex justify-between items-center border p-2 rounded">
                <div className="font-semibold">{c.category}</div>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={scores[c.id] ?? ''}
                  onChange={e => handleChange(c.id, +e.target.value)}
                  className="border p-1 rounded w-20 text-center"
                  disabled={readOnly}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

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
                  pointBackgroundColor: 'rgb(59, 130, 246)'
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 10,
                  ticks: { stepSize: 1 },
                  pointLabels: { font: { size: 14 }, padding: 10 }
                }
              },
              plugins: { legend: { display: false } }
            }}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded shadow min-h-[400px]">
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
                  pointBackgroundColor: 'rgb(34, 197, 94)'
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 0,
                  max: 10,
                  ticks: { stepSize: 1 },
                  pointLabels: { font: { size: 14 }, padding: 10 }
                }
              },
              plugins: { legend: { display: false } }
            }}
          />
        </div>
      </div>

      {!readOnly && (
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          💾 Сохранить оценки
        </button>
      )}
    </div>
  )
}
