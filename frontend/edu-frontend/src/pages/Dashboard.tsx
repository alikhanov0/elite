import { useAuth } from '../auth/AuthContext'
import TeacherDashboard from './TeacherDashboard'
import StudentStats from './StudentStats'
import AdminDashboard from './AdminDashboard'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">👋 Привет, {user.name} ({user.role})</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition" onClick={logout}>Выйти</button>
            </div>

            {user.role === 'teacher' && <TeacherDashboard />}
            {user.role === 'student' && <StudentStats />}
            {user.role === 'admin' && <AdminDashboard />}
        </div>
    </div>
  )
}
