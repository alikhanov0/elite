import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminRegister from './pages/AdminRegister'
import AdminGroups from './pages/AdminGroups'

interface PrivateRouteProps {
  children: React.ReactNode
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/register" element={<PrivateRoute><AdminRegister /></PrivateRoute>} />
        <Route path="/admin/groups/:id" element={<AdminGroups />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
