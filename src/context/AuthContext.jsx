import { USER_ROLES, USER_STATUS } from '@/constants/auth'
import { supabase } from '@/lib/supabase'
import { authService } from '@/services/authService'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /**
     * Centralized auth state handler.
     * Supabase's onAuthStateChange fires for the initial session as well.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Small delay might be needed for initial redirect persistence in some browsers
      setLoading(true)

      try {
        if (session?.user) {
          console.debug(`[AuthContext] State change: ${event}. User identified: ${session.user.id}`)
          setUser(session.user)

          // Fetch full profile (with lazy creation fallback)
          const fullProfile = await authService.getProfile()
          setProfile(fullProfile)
        } else {
          console.debug(`[AuthContext] State change: ${event}. No active session.`)
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error(`[AuthContext] Unexpected error during state change (${event}):`, error)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  const loginWithGoogle = () => authService.loginWithGoogle()
  const logout = () => authService.logout()
  const validateCode = (code) => authService.validateSecretCode(code)

  // Computando permissões de forma centralizada usando as constantes
  const isAdmin = profile?.role === USER_ROLES.ADMIN
  const isSilver =
    profile?.status === USER_STATUS.SILVER ||
    profile?.status === USER_STATUS.GOLD
  const isGold = profile?.status === USER_STATUS.GOLD

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithGoogle,
        logout,
        validateCode,
        isAdmin,
        isSilver,
        isGold,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
