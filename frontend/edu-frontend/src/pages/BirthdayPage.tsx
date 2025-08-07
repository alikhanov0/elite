import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from '../api/axios';

interface BirthdayUser {
  id: number;
  name: string;
  surname: string;
  role: string;
}

export default function BirthdayPage() {
  const [todayBirthdays, setTodayBirthdays] = useState<BirthdayUser[]>([]);
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('auth/notifications/birthdays/today')
      .then(res => setTodayBirthdays(res.data.todayBirthdays))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
        <button
        onClick={() => navigate(-1)} // можно заменить на navigate('/dashboard') если нужно фиксировано
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Назад
      </button>
      <h1 className="text-3xl font-bold mb-4">🎉 Дни рождения сегодня</h1>
      {todayBirthdays.length === 0 ? (
        <p>Сегодня нет дней рождения</p>
      ) : (
        <ul className="list-disc ml-5 mt-2 text-lg space-y-1">
          {todayBirthdays.map(user => (
            <li key={user.id}>
              {user.surname} {user.name} {user.role === 'teacher' ? '🧑‍🏫' : user.role === 'student' ? '🎓' : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
