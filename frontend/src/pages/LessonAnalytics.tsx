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

function calcPercentChange(thisAvg: number, lastAvg: number): number {
  if (lastAvg === 0) return thisAvg === 0 ? 0 : 100
  return ((thisAvg - lastAvg) / Math.abs(lastAvg)) * 100
}

function fillWeekdays(from: string, to: string, lessons: any[]) {
  const start = new Date(from)
  const end = new Date(to)

  const grouped: { [key: string]: any[] } = {}
  for (const l of lessons) {
    const key = new Date(l.date).toISOString().slice(0, 10)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(l)
  }

  const filled: any[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)

    if (grouped[key]) {
      const items = grouped[key]
      const score = items.reduce((s, x) => s + x.score, 0) / items.length
      const homeworkScore = items.reduce((s, x) => s + x.homeworkScore, 0) / items.length
      filled.push({ date: key, score, homeworkScore, status: items[0].status })
    } else {
      filled.push({ date: key, score: 0, homeworkScore: 0, status: 'visited' })
    }
  }

  return filled
}


export default function LessonAnalytics({ studentId, readOnly = false }: Props) {

  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  const [thisAvg, setThisAvg] = useState(0);
  const [lastAvg, setLastAvg] = useState(0);
  const [groupAvg, setGroupAvg] = useState<{ date: string, avg: number }[]>([]);
  const [change, setChange] = useState(0);

  const [lessons, setLessons] = useState<any[]>([]);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');


  const [components, setComponents] = useState<any[]>([])
  const [scores, setScores] = useState<{ [key: number]: number }>({})
  const [/*loading*/, setLoading] = useState(false)

 


  async function fetchAnalytics() {
  if (!from || !to) return;

  // 📊 Студенческие данные
  const res = await axios.get('/analytics/lesson', { params: { studentId, from, to } });
  const filled = fillWeekdays(from, to, res.data.lessons);
  setLessons(filled);

  const sum = filled.reduce((a, l) => a + l.score, 0);
  const avgThis = filled.length ? sum / filled.length : 0;
  setThisAvg(avgThis);

  // 📈 Групповая статистика
  const groupId = res.data.groupId; // должен быть возвращён бэкендом
  const groupRes = await axios.get('/analytics/group-avg', {
    params: { groupId, from, to }
  });
  setGroupAvg(groupRes.data.groupAvgByDate);

  // 📉 Данные за прошлый месяц
  const prev = new Date(currentMonth);
  prev.setMonth(prev.getMonth() - 1);
  const pf = new Date(prev.getFullYear(), prev.getMonth(), 1);
  const pt = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
  const res2 = await axios.get('/analytics/lesson', {
    params: { studentId, from: pf.toISOString().slice(0,10), to: pt.toISOString().slice(0,10) }
  });
  const filledPrev = fillWeekdays(pf.toISOString().slice(0,10), pt.toISOString().slice(0,10), res2.data.lessons);
  const avgLast = filledPrev.length
    ? filledPrev.reduce((a, l) => a + l.score, 0) / filledPrev.length
    : 0;

  setLastAvg(avgLast);
  setChange(calcPercentChange(avgThis, avgLast));
}



  async function fetchDiagnostics() {
    const res = await axios.get('/admin/components')
    setComponents(res.data.components)
    const res2 = await axios.get(`/diagnostics/scores/${studentId}`)
    setScores(res2.data.scores)
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

  useEffect(() => {
    const ym = currentMonth;
    const first = new Date(ym.getFullYear(), ym.getMonth(), 1);
    const last = new Date(ym.getFullYear(), ym.getMonth() + 1, 0);
    setFrom(first.toISOString().slice(0, 10));
    setTo(last.toISOString().slice(0, 10));
  }, [currentMonth]);

  
  useEffect(() => {
    fetchAnalytics()
    fetchDiagnostics()
  }, [studentId, from, to])

  useEffect(() => {
    fetchAnalytics();
    fetchComponents().then(fetchScores);
  }, [studentId, from, to]);

  useEffect(() => {
    const now = new Date()
    const f = new Date(now.getFullYear(), now.getMonth(), 1)
    const t = new Date(now.getFullYear(), now.getMonth()+1, 0)
    setFrom(f.toISOString().slice(0,10))
    setTo(t.toISOString().slice(0,10))
  }, [studentId])

  const handleChange = (id: number, value: number) =>
    setScores(prev => ({ ...prev, [id]: value }))

  const handleSave = async () => {
    const payload = Object.entries(scores).map(([cid, sc]) => ({
      componentId: +cid, score: sc, studentId
    }))
    await axios.post('/admin/diagnostics/update', payload)
    alert('✅ Оценки сохранены')
  }



const realLessons = lessons.filter(l => l.score !== 0 || l.homeworkScore !== 0)

const visited = realLessons.filter(l => l.status === 'visited').length
const reasoned = realLessons.filter(l => l.status === 'absent_reasoned').length
const unreasoned = realLessons.filter(l => l.status === 'absent_unreasoned').length


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

  function prevMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function completeGroupAvg(from: string, to: string, raw: { date: string, avg: number }[]) {
    const start = new Date(from), end = new Date(to)
    const map = new Map(raw.map(x => [x.date, x.avg]))
    const res: { x: Date, y: number }[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0,10)
      const avg = map.has(key) ? map.get(key)! : NaN // или 0
      const dd = new Date(d)
      dd.setHours(12,0,0,0)
      res.push({ x: dd, y: avg })
    }
    return res
  }

const completeGroupData = completeGroupAvg(from, to, groupAvg)

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h3 className="text-lg font-bold">📈 Успеваемость и посещаемость</h3>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Пред.</button>
          <div className="font-semibold">
            {currentMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={nextMonth} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">След.</button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">От:</label>
          <input type="date" className="border rounded px-2 py-1"
            value={from} onChange={e => setFrom(e.target.value)} />
          <label className="text-sm text-gray-600">До:</label>
          <input type="date" className="border rounded px-2 py-1"
             value={to} onChange={e => setTo(e.target.value)} />
        </div>

        <button onClick={fetchAnalytics} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Применить
        </button>
      </div>


      {/* График */}
      <div>
      <p>Средний балл за этот месяц: <b>{thisAvg.toFixed(1)}</b></p>
      <p>Средний за прошлый месяц: <b>{lastAvg.toFixed(1)}</b></p>
      <p>
        Рост:
        <b style={{ color: change >= 0 ? 'green' : 'red' }}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}%
        </b>
      </p>
    </div>

      <Line
  data={{
    labels: lessons.map(l => {
      const d = new Date(l.date)
      d.setHours(12, 0, 0, 0)
      return d
    }),
    datasets: [
      {
        label: 'Оценка за урок',
        data: lessons.map(l => {
          const d = new Date(l.date)
          d.setHours(12, 0, 0, 0)
          return { x: d, y: l.score }
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3
      },
      {
        label: 'Оценка за ДЗ',
        data: lessons.map(l => {
          const d = new Date(l.date)
          d.setHours(12, 0, 0, 0)
          return { x: d, y: l.homeworkScore }
        }),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3
      },
      {
        label: 'Средняя оценка группы',
        data: completeGroupData,
        borderColor: '#facc15',
        backgroundColor: 'rgba(250, 204, 21, 0.2)',
        borderDash: [4, 4],
        tension: 0.3,
        spanGaps: true,
      }
    ]
  }}
  options={{
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const date = tooltipItems[0].parsed.x
            return new Date(date).toLocaleDateString('ru-RU')
          }
        }
      }
    },
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




        {/* Посещаемость */}
      <div className="max-w-xs mx-auto mt-4">
        <h4 className="text-center text-md font-semibold mb-2">🧾 Посещаемость</h4>
        <Pie data={pieData} />
      </div>


        {/* Диагностический тест */}
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
