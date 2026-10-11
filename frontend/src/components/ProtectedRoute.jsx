import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/ui'

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, initializing, user } = useAuth()
  const location = useLocation()

  if (initializing) {
    return <PageLoader label="Checking your session..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    const fallback = user.role === 'ADMIN' ? '/admin' : '/musician'
    return <Navigate to={fallback} replace />
  }

  return children
}
