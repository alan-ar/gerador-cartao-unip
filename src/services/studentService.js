import { supabase } from '@/lib/supabase'

/**
 * Service responsible for communication with the 'students' table in Supabase.
 * Centralizes CRUD operations to facilitate maintenance and error tracking.
 */

const TABLE_NAME = 'students'

export const studentService = {
  /**
   * Fetches all students ordered by creation date.
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
   * Fetches a single student by ID.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Inserts a new student into the database.
   */
  async create(studentData) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([studentData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Deletes a student by ID.
   */
  async delete(id) {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id)

    if (error) throw error
    return true
  },
}
