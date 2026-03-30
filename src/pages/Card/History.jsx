import { useStudents } from '@/hooks/useStudents'
import { authService } from '@/services/authService'
import { formatDate } from '@/utils/formatters'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  Calendar as DateIcon,
  Download,
  Eye,
  LogOut,
  Plus,
  Table,
  Trash2,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './History.css'

/**
 * Page that displays the history of student registrations.
 * Allows exporting to CSV, viewing individual cards, and deleting records.
 */
const History = () => {
  const { students, loading, error, fetchStudents, deleteStudent } =
    useStudents()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  const exportToCSV = () => {
    if (!students || students.length === 0) return

    const headers = [
      'Name',
      'Document ID',
      'Birth Date',
      'Course',
      'Campus',
      'Registration',
      'Creation Date',
    ]
    const rows = students.map((s) => [
      s.name,
      s.document_id,
      s.birth_date,
      s.course,
      s.campus,
      s.registration_id,
      formatDate(s.created_at),
    ])

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'registered_students.csv'
    link.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="historico-container"
    >
      <div className="historico-header glass-effect">
        <div className="title-section">
          <Table className="title-icon" />
          <div>
            <h1>Registration History</h1>
            <p>Manage records saved in the cloud</p>
          </div>
        </div>
        <div className="historico-actions">
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <LogOut size={18} /> Logout
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="btn-export"
            disabled={students.length === 0}
          >
            <Download size={18} /> Export CSV
          </motion.button>
          <Link to="/" className="btn-back">
            <Plus size={18} /> New Card
          </Link>
        </div>
      </div>

      <div className="table-wrapper glass-effect">
        <table className="historico-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Registration</th>
              <th>Course / Unit</th>
              <th>
                <DateIcon size={14} /> Created At
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="status-cell">
                    Fetching records from cloud...
                  </td>
                </motion.tr>
              ) : error ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="status-cell error-cell">
                    {error}
                  </td>
                </motion.tr>
              ) : students.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="status-cell">
                    No records found.
                  </td>
                </motion.tr>
              ) : (
                students.map((student) => (
                  <motion.tr
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <td>
                      <div className="aluno-name">{student.name}</div>
                      <div className="aluno-rg">ID: {student.document_id}</div>
                    </td>
                    <td>
                      <span className="badge-matricula">
                        {student.registration_id}
                      </span>
                    </td>
                    <td>
                      <div className="aluno-course">{student.course}</div>
                      <div className="aluno-campus">{student.campus}</div>
                    </td>
                    <td>{formatDate(student.created_at)}</td>
                    <td>
                      <div className="action-row">
                        <Link
                          to={`/card/${student.id}`}
                          className="btn-view"
                          title="View Card"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => deleteStudent(student.id)}
                          className="btn-delete"
                          title="Delete from cloud"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="footer-actions">
        <Link to="/" className="link-back">
          <ChevronLeft size={16} /> Back to Home
        </Link>
      </div>
    </motion.div>
  )
}

export default History
