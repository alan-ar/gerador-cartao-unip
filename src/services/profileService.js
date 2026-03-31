import { supabase } from '@/lib/supabase'

/**
 * Service responsible for communication with the 'profiles' table in Supabase.
 * Centralizes read and update operations to maintain the service layer pattern.
 */

const TABLE_NAME = 'profiles'

export const profileService = {
  /**
   * Fetches all user profiles ordered by creation date (most recent first).
   * Requires admin-level RLS policy.
   */
  async getAll() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Updates the status level of a specific user profile.
   * @param {string} userId - The UUID of the user to update.
   * @param {'BRONZE' | 'SILVER' | 'GOLD'} newStatus - Target status level.
   */
  async updateStatus(userId, newStatus) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
