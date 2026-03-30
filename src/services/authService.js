import { supabase } from '@/lib/supabase'

/**
 * Service responsible for authentication and profile management.
 */
export const authService = {
  /**
   * Login via Google OAuth
   */
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) throw error
    return data
  },

  /**
   * Logs out the user
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Gets the complete profile of the authenticated user (Metadata + profiles table data).
   * Implements 'Lazy Profile Creation' as a fallback for potential database trigger latency.
   */
  getProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Try to fetch existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 2. Handle Profile Generation
    if (error && (error.code === 'PGRST116' || error.status === 406)) {
      console.warn(`Profile missing or inaccessible (Code: ${error.code}). Attempting to create one...`)
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            role: 'user',
            status: 'BRONZE',
          },
        ])
        .select()
        .single()

      if (createError) {
        // If conflict (409), it means it exists but we couldn't read it
        if (createError.code === '23505') {
          console.debug('Profile already exists. Re-fetching...')
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          return { ...user, ...retryProfile }
        }
        console.error('Failed to create fallback profile:', createError.message)
        return { ...user, full_name: user.user_metadata?.full_name }
      }
      return { ...user, ...newProfile }
    }

    if (error) {
      console.error('Error fetching profile:', error.message)
      return { ...user, full_name: user.user_metadata?.full_name }
    }

    // Ensure full_name is at the top level
    const mergedProfile = { 
      ...user, 
      ...profile,
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email
    }

    return mergedProfile
  },


  /**
   * Validates a secret code and upgrades the user to SILVER level using an atomic RPC.
   */
  validateSecretCode: async (code) => {
    // We use the database RPC function for atomicity and security
    const { data, error } = await supabase.rpc('validate_secret_code', {
      p_code: code,
    })

    if (error) {
      console.error('Validation error:', error.message)
      throw new Error(error.message || 'Invalid or expired secret code.')
    }

    return data
  },

  /**
   * Checks if there is an active session (cached check)
   */
  isAuthenticated: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  },
}
