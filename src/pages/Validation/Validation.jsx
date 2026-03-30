import { motion } from 'framer-motion'
import { AlertCircle, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { studentService } from '@/services/studentService'
import './Validation.css'

/**
 * Public validation page.
 * Fetches and displays student data based on a query parameter ID.
 * Used for verifying the authenticity of the digital card via QR Code.
 */
const Validation = () => {
  const [searchParams] = useSearchParams()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const id = searchParams.get('id')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchStudent = async () => {
      try {
        const data = await studentService.getById(id)
        setStudent(data)
      } catch (err) {
        console.error('Validation error:', err)
        setError('Record not found or invalid.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [id])

  if (loading) {
    return (
      <div className="validacao-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Validating credential...</p>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="validacao-error">
        <AlertCircle size={64} color="#ef4444" />
        <h1>Validation Failed</h1>
        <p>{error || 'No validation ID provided.'}</p>
        <Link to="/" className="btn-back">
          <ChevronLeft /> Back to Home
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="validacao-container"
    >
      <div className="validacao-card glass-card">
        <div className="validacao-header">
          <ShieldCheck size={40} color="#10b981" />
          <div className="header-text">
            <h1>Credential Validated</h1>
            <p>Authentic and active document in the system</p>
          </div>
        </div>

        <div className="validacao-info">
          <div className="info-item">
            <span className="label">Full Name</span>
            <span className="value">{student.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Registration</span>
            <span className="value">{student.registration_id}</span>
          </div>
          <div className="info-row">
            <div className="info-item">
              <span className="label">ID Document</span>
              <span className="value">{student.document_id}</span>
            </div>
            <div className="info-item">
              <span className="label">Birth Date</span>
              <span className="value">{student.birth_date}</span>
            </div>
          </div>
          <div className="info-item">
            <span className="label">Course</span>
            <span className="value uppercase">{student.course}</span>
          </div>
          <div className="info-item">
            <span className="label">Campus / Unit</span>
            <span className="value uppercase">{student.campus}</span>
          </div>
        </div>

        <div className="validacao-footer">
          <div className="status-badge">
            <div className="dot"></div>
            ACTIVE CARD
          </div>
          <p className="timestamp">
            Query performed on: {new Date().toLocaleString('en-US')}
          </p>
        </div>
      </div>

      <Link to="/" className="btn-home">
        Go to Home
      </Link>
    </motion.div>
  )
}

export default Validation
