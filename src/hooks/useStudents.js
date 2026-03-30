import { useCallback, useState } from 'react'
import { studentService } from '@/services/studentService'

/**
 * Custom hook to manage the list of students and CRUD operations.
 * Encapsulates loading and error states related to Supabase.
 */

export const useStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await studentService.getAll()
      setStudents(data)
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const addStudent = async (studentData) => {
    setLoading(true)
    setError(null)
    try {
      const newStudent = await studentService.create(studentData)
      setStudents((prev) => [newStudent, ...prev])
      return newStudent
    } catch (err) {
      console.error('Error adding student:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteStudent = async (id) => {
    setError(null)
    try {
      await studentService.delete(id)
      setStudents((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Error deleting student:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    deleteStudent,
  }
}
