import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { startOfWeek, addDays, subWeeks, addWeeks, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import LessonConduct from './LessonConduct'
import AddLessonForm from './AddLessonForm'

interface Group { id: number; name: string }
interface Lesson { id: number; name: string; date: string }

export default function TeacherDashboard() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)

  const loadGroups = async () => {
    const res = await axios.get('/teacher/groups')
    setGroups(res.data.groups)
  }

  const loadLessons = async (groupId: number) => {
    const res = await axios.get(`/teacher/group/${groupId}/lessons`)
    setLessons(res.data.lessons)
  }

  useEffect(() => { loadGroups() }, [])

  useEffect(() => {
    if (selectedGroupId) {
      loadLessons(selectedGroupId)
      setSelectedLessonId(null)
    }
  }, [selectedGroupId])

  const getWeekLessons = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    return weekDays.map(day =>
      lessons
        .filter(l => new Date(l.date).toDateString() === day.toDateString())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    )
  }

  const weekLessons = getWeekLessons()

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold">🧑‍🏫 Панель учителя</h2>

      {/* Группа */}
      <select value={selectedGroupId ?? ''} onChange={e => setSelectedGroupId(+e.target.value)} className="border p-2 rounded w-full">
        <option value="">-- Выберите группу --</option>
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>

      {/* Если группа выбрана — расписание недели */}
      {selectedGroupId && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setWeekStart(w => subWeeks(w, 1))} className="px-3 py-1 bg-gray-200 rounded">← Неделя</button>
            <div className="font-semibold">{format(weekStart, 'dd MMM yyyy', { locale: ru })} – {format(addDays(weekStart,6), 'dd MMM yyyy', { locale: ru })}</div>
            <button onClick={() => setWeekStart(w => addWeeks(w, 1))} className="px-3 py-1 bg-gray-200 rounded">Неделя →</button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekLessons.map((dayList, idx) => (
    <div key={idx} className="bg-white border rounded shadow p-2 flex flex-col">
      <div
  className="font-medium border-b pb-1 mb-2 text-sm h-[40px] flex items-center justify-center text-center"
>
  {format(addDays(weekStart, idx), 'EEEE, dd.MM', { locale: ru })}
</div>

      <div className="flex-1 space-y-2">
        {dayList.map(l => (
          <div
            key={l.id}
            onClick={() => setSelectedLessonId(l.id)}
            className={`text-left border p-2 rounded cursor-pointer hover:bg-blue-50 ${
              l.id === selectedLessonId ? 'bg-blue-100' : ''
            }`}
          >
            <div className="font-semibold text-sm">{l.name}</div>
            <div className="text-xs text-gray-600">{format(new Date(l.date), 'HH:mm')}</div>
          </div>
        ))}
      </div>
    </div>
  ))}
          </div>
        </div>
      )}

      {/* Добавление урока */}
      {selectedGroupId && (
        <AddLessonForm groupId={selectedGroupId} onAdded={() => loadLessons(selectedGroupId)} />
      )}

      {/* Проведение урока */}
      {selectedLessonId && <LessonConduct lessonId={selectedLessonId} />}
    </div>
  )
}
