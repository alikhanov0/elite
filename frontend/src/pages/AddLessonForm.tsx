import { useState } from 'react'
import axios from '../api/axios'

interface Props {
  groupId: number
  onAdded: () => void
}

export default function AddLessonForm({ groupId, onAdded }: Props) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  const handleAdd = async () => {
    if (!name || !date) return
    await axios.post(`/teacher/group/${groupId}/create-lesson`, { name, date })
    setName('')
    setDate('')
    onAdded()
  }

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-lg font-semibold">➕ Добавить урок</h3>
      <input
        type="text"
        placeholder="Название урока"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input
        type="datetime-local"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border p-2 rounded w-full"
        min="2000-01-01T00:00"
        max="2124-12-31T23:59"
      />
      <button
        onClick={handleAdd}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Сохранить
      </button>
    </div>
  )
}
