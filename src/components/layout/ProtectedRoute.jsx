import { useAuth } from '@/context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Route protection component.
 * Handles access control based on user authentication, roles, and status levels.
 */
function ProtectedRoute({
  children,
  requiresAdmin = false,
  requiresSilver = false,
}) {
  const { user, profile, loading, isAdmin, isSilver } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
      </div>
    )
  }

  // Not logged in -> Redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admins bypass standard level checks
  if (isAdmin) return children

  // Requires Admin but user is not admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Requires Silver/Gold but user is Bronze
  if (requiresSilver && !isSilver) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default ProtectedRoute
