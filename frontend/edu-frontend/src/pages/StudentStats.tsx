import { useAuth } from '../auth/AuthContext'
import LessonAnalytics from '../pages/LessonAnalytics'

export default function StudentDashboard() {
  const { user } = useAuth()
  
  if (!user) return <p>Загрузка...</p>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🎓 Личный кабинет</h2>
      
      {/* Успеваемость и посещаемость */}
      <LessonAnalytics studentId={user.id} readOnly={true}/>
    </div>
  )
}
