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
    let mounted = true

    const syncSession = async (session) => {
      if (!mounted) return
      try {
        if (session?.user) {
          setUser(session.user)
          // Profile temporário para exibir a foto/nome rapidamente sem perder o status anterior
          setProfile((prev) => ({
            ...prev,
            ...session.user,
            full_name: session.user.user_metadata?.full_name || session.user.email || prev?.full_name,
          }))
          
          const fullProfile = await authService.getProfile(session.user)
          if (mounted) setProfile(fullProfile)
        } else {
          if (mounted) {
            setUser(null)
            setProfile(null)
          }
        }
      } catch (err) {
        console.error('[AuthContext] Erro ao sincronizar sessão:', err)
      } finally {
        // SEMPRE desliga a tela de loading. Nunca ativa ela novamente.
        if (mounted) setLoading(false)
      }
    }

    // 1. Busca síncrona/segura (Resolve o bug do Google Login travando na tela preta)
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncSession(session)
    })

    // 2. Assinatura para eventos reativos (Ignora INITIAL_SESSION pois o getSession já fez)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug(`[AuthContext] Auth event: ${event}`)
      
      if (event === 'INITIAL_SESSION') return

      if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
        return
      }

      // Lidar com SIGNED_IN (OAuth concluído), TOKEN_REFRESHED, USER_UPDATED de forma silenciosa e segura
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        syncSession(session)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])


  /**
   * Refreshes the user profile from the database.
   * Useful after status-changing events like code validation.
   */
  const refreshProfile = async () => {
    setLoading(true)
    try {
      // Pega o snapshot local do usuário antes de chamar o serviço
      const fullProfile = await authService.getProfile(user)
      setProfile(fullProfile)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = () => authService.loginWithGoogle()
  const logout = () => authService.logout()
  
  const validateCode = async (code) => {
    try {
      const result = await authService.validateSecretCode(code)
      // Atualiza o perfil para refletir o novo status (SILVER)
      await refreshProfile()
      return result
    } catch (error) {
      // Re-lança explicitamente para que o componente trate o erro
      throw error
    }
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
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
