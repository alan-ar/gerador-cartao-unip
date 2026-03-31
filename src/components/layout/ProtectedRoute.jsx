import { useAuth } from '@/context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'

/**
 * Route protection component.
 * Handles access control based on user authentication, roles, and status levels.
 *
 * Props:
 *  - requiresAdmin: only admins may access
 *  - requiresSilver: only Silver/Gold/Admin users may access
 *  - onlyBronze: only Bronze users may access (redirects activated users to /)
 */
function ProtectedRoute({
  children,
  requiresAdmin = false,
  requiresSilver = false,
  onlyBronze = false,
}) {
  const { user, loading, isAdmin, isSilver } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
      </div>
    )
  }

  // Não autenticado → redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Rota exclusiva para BRONZE: usuários já ativados (SILVER/GOLD/admin) são
  // redirecionados para a tela principal. Resolve Bug 3: retorno após fechamento.
  if (onlyBronze && (isSilver || isAdmin)) {
    return <Navigate to="/" replace />
  }

  // Admins passam por todas as verificações de nível
  if (isAdmin) return children

  // Requer admin mas usuário não é admin
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // Requer Silver/Gold mas usuário é Bronze
  if (requiresSilver && !isSilver) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default ProtectedRoute
