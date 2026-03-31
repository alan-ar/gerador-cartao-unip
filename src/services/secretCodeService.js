import { supabase } from '@/lib/supabase'

/**
 * Service responsible for communication with the 'secret_codes' table in Supabase.
 * Centralizes CRUD operations and business rules around secret code management.
 */

const TABLE_NAME = 'secret_codes'

export const secretCodeService = {
  /**
   * Fetches all secret codes ordered by creation date (most recent first).
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
   * Creates a new active secret code, atomically deactivating all previous ones.
   * Business rule: only one active code is allowed at a time.
   * @param {string} code - The raw code string (will be uppercased).
   * @param {string} createdBy - UUID of the admin user creating the code.
   */
  async create(code, createdBy) {
    // Step 1: Deactivate all currently active codes
    const { error: deactivateError } = await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .eq('is_active', true)

    if (deactivateError) throw deactivateError

    // Step 2: Insert the new master code
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([
        {
          code: code.toUpperCase(),
          created_by: createdBy,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Deletes a secret code permanently by its ID.
   * @param {string} id - UUID of the code to delete.
   */
  async delete(id) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)
    if (error) throw error
    return true
  },
}
