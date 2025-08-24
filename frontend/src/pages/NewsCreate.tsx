import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function NewsCreate() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !text.trim()) {
      alert('Заполните все поля')
      return
    }

    try {
      await axios.post('/news', { title, text })
      alert('Новость успешно добавлена!')
    } catch (error) {
      console.error(error)
      alert('Ошибка при добавлении новости')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">📰 Добавить объявление</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Введите заголовок"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Текст объявления</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Введите текст объявления"
            rows={5}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ✅ Сохранить
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            ⬅ Назад
          </button>
        </div>
      </form>
    </div>
  )
}
