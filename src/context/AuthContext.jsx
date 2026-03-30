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
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)

      // Safety timeout to prevent infinite loading (5 seconds)
      const timeoutId = setTimeout(() => {
        setLoading(false)
        console.warn('[AuthContext] Loading safety timeout reached.')
      }, 5000)

      try {
        if (session?.user) {
          console.debug(`[AuthContext] Auth event: ${event}`)
          setUser(session.user)

          // Set temporary profile from metadata to avoid flicker
          setProfile({
            ...session.user,
            full_name: session.user.user_metadata?.full_name || session.user.email,
          })

          // Fetch full database profile
          const fullProfile = await authService.getProfile()
          setProfile(fullProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error(`[AuthContext] Fatal auth state error:`, error)
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])


  /**
   * Refreshes the user profile from the database.
   * Useful after status-changing events like code validation.
   */
  const refreshProfile = async () => {
    setLoading(true)
    try {
      const fullProfile = await authService.getProfile()
      setProfile(fullProfile)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = () => authService.loginWithGoogle()
  const logout = () => authService.logout()
  
  const validateCode = async (code) => {
    const result = await authService.validateSecretCode(code)
    // IMPORTANT: After validating, we must refresh to see the NEW status (SILVER)
    await refreshProfile()
    return result
  }


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
