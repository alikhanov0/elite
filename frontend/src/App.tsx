import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminRegister from './pages/AdminRegister'
import AdminGroups from './pages/AdminGroups'
import RatingPage from './pages/RatingPage'
import BirthdayPage from './pages/BirthdayPage'
import AllRatingPage from './pages/AllRatingPage'
import RatingByGradePage from './pages/RatingByGradePage'
import CreateNews from './pages/NewsCreate'
import NewsPage from './pages/NewsPage'
import DeleteNews from './pages/DeleteNews'



interface PrivateRouteProps {
  children: React.ReactNode
}


function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

function GlobalButtons() {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <button
        onClick={() => navigate('/rating')}
        className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700"
      >
        📈 Рейтинг
      </button>
      <button
        onClick={() => navigate('/birthdays')}
        className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-yellow-600"
      >
        🎉 Дни рождения
      </button>
      <button
        onClick={() => navigate('/news')}
        className="bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-yellow-600"
      >
        🎉 Объявления 
      </button>
    </div>
  )
}





export default function App() {
  return (
    <BrowserRouter>
    <GlobalButtons />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/news/create" element={<CreateNews />} />
        <Route path="/admin/news/delete" element={<DeleteNews />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/groups/:id" element={<AdminGroups />} />
        <Route path="/rating" element={<RatingPage />} />
        <Route path="/rating/all" element={<AllRatingPage />} />
        <Route path="/rating/by-grade" element={<RatingByGradePage />} />
        <Route path="/birthdays" element={<BirthdayPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}