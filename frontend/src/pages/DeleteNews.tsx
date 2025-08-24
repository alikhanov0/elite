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

export default function DeleteNews() {
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

  const handleDelete = async (id: number) => {
    if (!window.confirm("Вы уверены, что хотите удалить это объявление?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/news/${id}`);
      setNews(news.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  if (loading) {
    return <p className="text-center py-6">Загрузка...</p>;
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-6">
        <p>Нет объявлений для удаления 📭</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
        >
          Назад
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🗑 Удаление объявлений</h1>

      <div className="space-y-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl shadow-sm p-4 bg-white flex justify-between items-start"
          >
            <div>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
              </p>
              <p>{item.text}</p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg"
      >
        Назад
      </button>
    </div>
  );
}
