import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
}

export default function SelectGroupPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get<{ groups: Group[] }>('/admin/groups');
        setGroups(res.data.groups);
      } catch (err) {
        console.error('Ошибка при загрузке групп:', err);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📘 Выберите группу для редактирования</h1>
      <div className="space-y-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => navigate(`/admin/groups/${group.id}`)}
            className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            {group.name}
          </button>
        ))}
      </div>
    </div>
  );
}
