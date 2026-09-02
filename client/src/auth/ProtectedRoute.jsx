import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import Spinner from '../ui/Spinner.jsx'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Spinner fullPage label="Loading app" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
