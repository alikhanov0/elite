import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  teacher: {
    id: number;
    name: string;
  };
  students: { student: { id: number; name: string } }[];
  lessons: { id: number; name: string; date: string }[];
}

export default function DeleteGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get<{ groups: Group[] }>('/admin/groups');
        setGroups(res.data.groups);
      } catch (error) {
        console.error('Ошибка при загрузке групп:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту группу?')) return;

    try {
      await axios.delete(`/admin/groups/${id}`);
      setGroups(groups.filter((group) => group.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении группы:', error);
    }
  };

  if (loading) {
    return <p className="text-center py-6">Загрузка...</p>;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-6">
        <p>Нет групп для удаления 📭</p>
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
      <h1 className="text-3xl font-bold mb-6">🗑 Удаление групп</h1>

      <div className="space-y-6">
        {groups.map((group) => (
          <div
            key={group.id}
            className="border rounded-xl shadow-sm p-4 bg-white flex justify-between items-start"
          >
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                Учитель: {group.teacher.name} | Студентов: {group.students.length} | Уроков: {group.lessons.length}
              </p>
            </div>
            <button
              onClick={() => handleDelete(group.id)}
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
