import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Questionnaire from './pages/Questionnaire'
import Dashboard from './pages/Dashboard'
import ThankYou from './pages/ThankYou'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-accountant" element={<Register />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/questionnaire/:token" element={<Questionnaire />} />
          <Route path="/thank-you/:token" element={<ThankYou />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
