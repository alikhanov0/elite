import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface News {
  id: number;
  title: string;
  text: string;
  createdAt: string;
}

export default function NewsList() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get<News[]>('http://localhost:5000/api/news');
        setNews(res.data);
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <p className="text-center py-6">Загрузка...</p>;
  }

  if (news.length === 0) {
    return <p className="text-center py-6">Пока нет новостей 📭</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* кнопка назад */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
      >
        ← Назад
      </button>

      <h1 className="text-3xl font-bold mb-6">📰 Новости</h1>

      <div className="space-y-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl shadow-sm p-4 bg-white"
          >
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-gray-600 text-sm mb-2">
              {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
            </p>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
