import { useEffect, useState } from 'react'
import axios from '../api/axios'
import { useParams, useNavigate } from 'react-router-dom'
import { startOfWeek, addDays, subWeeks, addWeeks, format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface Group {
  id: number
  name: string
  teacherId: number
  teacher: { id: number; name: string; surname: string }
  students: {
    student: { id: number; name: string; surname: string; username: string }
    lessonsLeft: number  // ← добавьте это поле
  }[]
  lessons: { id: number; name: string; date: string }[]
}


interface User {
  id: number
  name: string
  surname: string
  username: string
  role: 'student' | 'teacher'
}

interface LessonStudent {
  studentId: number
  name: string
  surname: string
  status: 'visited' | 'absent_reasoned' | 'absent_unreasoned'
  score: number
  homeworkScore: number
}

interface AdminGroupPageProps {
  group: Group
  isEditingName: boolean
  setIsEditingName: (value: boolean) => void
  editedGroupName: string
  setEditedGroupName: (value: string) => void
  refreshGroups: () => void
}

export default function AdminGroupPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [newGroupName, setNewGroupName] = useState<string>('')


  const [group, setGroup] = useState<Group | null>(null)
  const [allStudents, setAllStudents] = useState<User[]>([])
  const [allTeachers, setAllTeachers] = useState<User[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null)
  const [lessonStudents, setLessonStudents] = useState<LessonStudent[]>([])

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [editingLessonName, setEditingLessonName] = useState('')
  const [editingLessonDate, setEditingLessonDate] = useState('')

  const [newLessonName, setNewLessonName] = useState('')
  const [newLessonDate, setNewLessonDate] = useState('')
  const [repeatWeeks, setRepeatWeeks] = useState<number>(4)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const [isEditingName, setIsEditingName] = useState(false)
const [editedGroupName, setEditedGroupName] = useState('')

  
const [selectedWeekday, setSelectedWeekday] = useState<number>(0) // 0 = понедельник
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))


  useEffect(() => {
    fetchGroup()
    fetchUsers()
  }, [id])

  const fetchGroup = async () => {
    const res = await axios.get(`/admin/groups/${id}`)
    setGroup(res.data.group)
    setNewGroupName(res.data.group.name)
    setSelectedTeacherId(res.data.group.teacherId)
  }

  const fetchUsers = async () => {
    const res = await axios.get('/admin/users')
    const users: User[] = res.data.users
    setAllStudents(users.filter(u => u.role === 'student'))
    setAllTeachers(users.filter(u => u.role === 'teacher'))
  }

  const addStudent = async () => {
    if (selectedStudentId === '') return
    await axios.post(`/admin/groups/${id}/add-student`, { studentId: selectedStudentId })
    setSelectedStudentId('')
    fetchGroup()
  }

  const removeStudent = async (studentId: number) => {
    await axios.post(`/admin/groups/${id}/remove-student`, { studentId })
    fetchGroup()
  }

  const saveTeacherChange = async () => {
    if (!selectedTeacherId) return
    await axios.post(`/admin/groups/${id}/change-teacher`, { teacherId: selectedTeacherId })
    fetchGroup()
  }

  const saveGroupName = async () => {
  if (!editedGroupName.trim() || editedGroupName === group?.name) {
    setIsEditingName(false)
    return
  }

  try {
    await axios.post(`/admin/groups/${id}/rename`, {
      name: editedGroupName.trim(),
    })
    await fetchGroup()
    setIsEditingName(false)
  } catch (err) {
    console.error('Ошибка при переименовании группы:', err)
  }
}



  const fetchLessonStudents = async (lessonId: number) => {
    setSelectedLessonId(lessonId)
    const res = await axios.get(`/admin/lesson/${lessonId}/students`)
    const mapped = res.data.students.map((s: any) => ({
      ...s,
      studentId: s.studentId || s.id
    }))
    setLessonStudents(mapped)
  }

  const handleLessonStudentChange = (
    studentId: number,
    field: keyof LessonStudent,
    value: any
  ) => {
    if (field === 'score' || field === 'homeworkScore') {
      value = Math.max(0, Math.min(10, Number(value)))
    }
    setLessonStudents(prev =>
      prev.map(s =>
        s.studentId === studentId ? { ...s, [field]: value } : s
      )
    )
  }


  const saveLessonStudentData = async () => {
  if (!selectedLessonId) return;
  try {
    const res = await axios.post(`/admin/lesson/${selectedLessonId}/save`, lessonStudents);
    if (res.data.warning) {
      alert(res.data.warning); // предупреждение если урок не списался
    }
    // обновляем данные группы и таблицу оценок
    await fetchGroup();
    fetchLessonStudents(selectedLessonId);
  } catch (err) {
    console.error(err);
    alert('Ошибка при сохранении');
  }
};



const addLesson = async () => {
  if (!newLessonName) return

  const baseDate = addDays(weekStart, selectedWeekday)

 await axios.post(`/admin/groups/${id}/add-lesson`, {
  name: newLessonName,
  date: baseDate.toISOString(),
  repeat: repeatWeeks
})


  setNewLessonName('')
  setRepeatWeeks(4)
  setSelectedWeekday(0)
  fetchGroup()
}


const updateLessonsLeft = async (studentId: number, lessonsLeft: number) => {
  await axios.post(`/admin/groups/${id}/update-lessons`, {
    studentId,
    lessonsLeft
  })
  fetchGroup()
}



  const removeLesson = async (lessonId: number) => {
    await axios.delete(`/admin/groups/${id}/lessons/${lessonId}`)
    fetchGroup()
  }

  const sortedLessons = group
    ? [...group.lessons].sort((a, b) =>
        sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : []


  const getWeekKey = (dateStr: string) => {
    const d = new Date(dateStr)
    return startOfWeek(d, { weekStartsOn: 1 }).toISOString().slice(0, 10)
  }

  const lessonsByWeek: Record<string, typeof sortedLessons> = {}
  sortedLessons.forEach(l => {
    const key = getWeekKey(l.date)
    if (!lessonsByWeek[key]) lessonsByWeek[key] = []
    lessonsByWeek[key].push(l)
  })

  if (!group) return <p>Загрузка...</p>

  const currentStudentIds = group.students.map(s => s.student.id)
  const sortedStudents = [...group.students].sort((a, b) => {
  const nameA = `${a.student.name} ${a.student.surname}`.toLowerCase()
  const nameB = `${b.student.name} ${b.student.surname}`.toLowerCase()
  return nameA.localeCompare(nameB)
})

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/')} className="text-blue-600 hover:underline text-sm mb-4">
        ← Назад к панели администратора
      </button>

      <h2 className="text-3xl font-bold flex items-center gap-3">
  👥 Группа:
  {isEditingName ? (
    <>
      <input
        value={editedGroupName}
        onChange={(e) => setEditedGroupName(e.target.value)}
        className="border px-2 py-1 rounded text-base"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') saveGroupName()
          if (e.key === 'Escape') setIsEditingName(false)
        }}
      />
      <button
        onClick={saveGroupName}
        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
      >
        ✔
      </button>
      <button
        onClick={() => setIsEditingName(false)}
        className="text-gray-500 hover:text-red-500"
      >
        ✖
      </button>
    </>
  ) : (
    <>
      <span>{group.name}</span>
      <button
        onClick={() => {
          setIsEditingName(true)
          setEditedGroupName(group.name)
        }}
        className="text-blue-600 hover:underline text-sm"
      >
        ✏️ редактировать
      </button>
    </>
  )}
</h2>


      {/* Учитель */}
      <div>
        <h3 className="text-xl font-semibold">
          🧑‍🏫 Учитель: {group.teacher.name} {group.teacher.surname}
        </h3>
        <div className="flex gap-2 items-center">
          <select
            className="border p-2 rounded"
            value={selectedTeacherId ?? ''}
            onChange={e => setSelectedTeacherId(+e.target.value)}
          >
            {allTeachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} {t.surname}
              </option>
            ))}
          </select>
          <button
            onClick={saveTeacherChange}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            ✅ Сменить
          </button>
        </div>
      </div>

      {/* Студенты */}
      
      <div>
        <h3 className="text-xl font-semibold">🧑‍🎓 Студенты</h3>
        <ul className="space-y-1">
          {sortedStudents.map(s => (
            <li key={s.student.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{s.student.name} {s.student.surname} ({s.student.username})</span>
              <span className="ml-4 font-medium">
    🧾 

<input
  type="number"
  min={0}
  className="border p-1 rounded w-20 ml-2"
  value={s.lessonsLeft}
  onChange={e => updateLessonsLeft(s.student.id, +e.target.value)}
/>уроков осталось </span>


              <button
                onClick={() => removeStudent(s.student.id)}
                className="text-red-600 hover:underline"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 items-center mt-2">
          <select
            className="border p-2 rounded"
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(+e.target.value)}
          >
            <option value="">➕ Добавить студента</option>
            {allStudents
              .filter(s => !currentStudentIds.includes(s.id))
              .map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.surname}
                </option>
              ))}
          </select>
          <button
            onClick={addStudent}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Расписание */}
<div className="border rounded p-4 bg-gray-50">
  <h3 className="text-xl mb-4">
    Неделя с {format(weekStart, 'dd MMM yyyy', { locale: ru })}
  </h3>

  {group && (
    <>
      {(() => {
        const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
        const dayLessons = weekDays.map(day =>
          group.lessons.filter(l => new Date(l.date).toDateString() === day.toDateString())
        )

        return (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => (
              <div key={idx} className="border p-2 rounded min-h-[120px]">
                <div className="font-semibold text-sm mb-2 text-center">
                  {format(day, 'EEEE, dd', { locale: ru })}
                </div>
                {dayLessons[idx].map(l => (
                  <div
                    key={l.id}
                    className="bg-white p-2 mb-1 rounded shadow cursor-pointer hover:bg-blue-50"
                    onClick={() => fetchLessonStudents(l.id)}
                  >
                    <div>{l.name}</div>
                    <div className="text-xs text-gray-600">
                      {format(new Date(l.date), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })()}
    </>
  )}

  {/* Переключение недель */}
  <div className="flex justify-between mt-4">
    <button
      onClick={() => setWeekStart(prev => subWeeks(prev, 1))}
      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      ← Пред. неделя
    </button>
    <button
      onClick={() => setWeekStart(prev => addWeeks(prev, 1))}
      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
    >
      След. неделя →
    </button>
  </div>
</div>





      {/* Таблица оценок */}
      {selectedLessonId && (
        <div className="space-y-2 mt-6">
          <h3 className="text-xl font-semibold">📝 Проведение урока</h3>
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Студент</th>
                <th className="p-2">Статус</th>
                <th className="p-2">Оценка</th>
                <th className="p-2">ДЗ</th>
              </tr>
            </thead>
            <tbody>
              {lessonStudents.map(s => (
                <tr key={s.studentId} className="border-t">
                  <td className="p-2">
                    {s.name} {s.surname}
                  </td>
                  <td className="p-2">
                    <select
                      className="border p-1 rounded"
                      value={s.status}
                      onChange={e => handleLessonStudentChange(s.studentId, 'status', e.target.value)}
                    >
                      <option value="visited">✅ Был</option>
                      <option value="absent_reasoned">🟡 Уваж.</option>
                      <option value="absent_unreasoned">🔴 Без ув.</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={s.score}
                      onChange={e => handleLessonStudentChange(s.studentId, 'score', +e.target.value)}
                      onBlur={e => {
                        let v = parseInt(e.target.value)
                        if (isNaN(v)) v = 0
                        if (v < 0) v = 0
                        if (v > 10) v = 10
                        handleLessonStudentChange(s.studentId, 'score', v)
                      }}
                      className="border p-1 rounded w-16 text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={s.homeworkScore}
                      onChange={e =>
                        handleLessonStudentChange(s.studentId, 'homeworkScore', +e.target.value)
                      }
                      onBlur={e => {
                        let v = parseInt(e.target.value)
                        if (isNaN(v)) v = 0
                        if (v < 0) v = 0
                        if (v > 10) v = 10
                        handleLessonStudentChange(s.studentId, 'homeworkScore', v)
                      }}
                      className="border p-1 rounded w-16 text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-4 mt-4">
  <button
    onClick={saveLessonStudentData}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    💾 Сохранить
  </button>

  <button
    onClick={async () => {
      if (
        window.confirm('Вы уверены, что хотите удалить этот урок? Данные будут удалены безвозвратно.')
      ) {
        await axios.delete(`/admin/groups/${id}/lessons/${selectedLessonId}`)
        setSelectedLessonId(null)
        setLessonStudents([])
        fetchGroup()
      }
    }}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    🗑 Удалить урок
  </button>
</div>


          

        </div>
      )}

      
<div className="border rounded bg-white p-4 mt-8 shadow-md">
  <h3 className="text-2xl font-bold mb-4 text-gray-800">➕ Добавить урок</h3>

  <div className="flex flex-wrap items-center gap-4">
    <input
      type="text"
      placeholder="Название урока"
      className="border p-2 rounded flex-1 min-w-[200px]"
      value={newLessonName}
      onChange={e => setNewLessonName(e.target.value)}
    />
    <select
  className="border p-2 rounded"
  value={selectedWeekday}
  onChange={e => setSelectedWeekday(Number(e.target.value))}
>
  <option value={0}>Понедельник</option>
  <option value={1}>Вторник</option>
  <option value={2}>Среда</option>
  <option value={3}>Четверг</option>
  <option value={4}>Пятница</option>
  <option value={5}>Суббота</option>
  <option value={6}>Воскресенье</option>
</select>

    <input
      type="number"
      min={1}
      max={52}
      className="border p-2 rounded w-28"
      value={repeatWeeks}
      onChange={e => setRepeatWeeks(Number(e.target.value))}
      placeholder="0"
    />
    <button
      onClick={addLesson}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      Добавить
    </button>
  </div>
</div>

<div className="h-20" /> {/* Невидимое пространство снизу */}
    </div>
  )
}
