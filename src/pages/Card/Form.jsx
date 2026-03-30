import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  CreditCard,
  GraduationCap,
  MapPin,
  Send,
  Trash2,
  User,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { listaDeCampus } from '@/data/campus.js'
import { listaDeCursos } from '@/data/cursos.js'
import { studentService } from '@/services/studentService'
import {
  generateRegistrationId,
  formatDocumentId,
  formatBirthDate,
} from '@/utils/formatters'
import './Form.css'

/**
 * Component for the student registration form.
 * Handles input validation, formatting, and submission to Supabase.
 */
function Form() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('unip-card-data')
    return saved
      ? JSON.parse(saved)
      : {
          name: '',
          document_id: '',
          birth_date: '',
          course: '',
          campus: '',
        }
  })

  useEffect(() => {
    localStorage.setItem('unip-card-data', JSON.stringify(formData))
  }, [formData])

  const handleChange = (e) => {
    const { name, value } = e.target
    let finalValue = value

    if (name === 'name') finalValue = value.toUpperCase()
    else if (name === 'document_id') finalValue = formatDocumentId(value)
    else if (name === 'birth_date') finalValue = formatBirthDate(value)

    setFormData((prev) => ({ ...prev, [name]: finalValue }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.document_id.length < 12) return alert('RG (ID) is incomplete.')
    if (formData.birth_date.length < 10)
      return alert('Birth date is incomplete.')

    setLoading(true)
    try {
      const dataToSave = {
        ...formData,
        registration_id: generateRegistrationId().toString(),
        created_at: new Date().toISOString(),
      }

      const savedStudent = await studentService.create(dataToSave)
      // Redirect to the card visualization page
      navigate(`/card/${savedStudent.id}`)
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Error saving data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Clear all fields?')) {
      setFormData({
        name: '',
        document_id: '',
        birth_date: '',
        course: '',
        campus: '',
      })
      localStorage.removeItem('unip-card-data')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="form-container"
    >
      <form onSubmit={handleSubmit} className="glass-form">
        <div className="form-header">
          <div className="title-wrapper">
            <CreditCard className="header-icon" />
            <h1>UNIP Card Generator</h1>
          </div>
          <Link to="/history" className="link-historico">
            View History
          </Link>
        </div>

        <div className="form-grid">
          <fieldset>
            <legend>
              <User className="legend-icon" /> Student Data
            </legend>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="STUDENT NAME"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="document_id">Identity Document (RG)</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="document_id"
                    name="document_id"
                    value={formData.document_id}
                    onChange={handleChange}
                    placeholder="00.000.000-0"
                    required
                    maxLength="12"
                  />
                </div>
              </div>
              <div className="form-group flex-1">
                <label htmlFor="birth_date">Birth Date</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                    required
                    maxLength="10"
                  />
                  <Calendar className="input-icon" />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>
              <GraduationCap className="legend-icon" /> Academic Info
            </legend>
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a course
                </option>
                {listaDeCursos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="campus">Campus / Unit</label>
              <div className="input-with-icon">
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a campus
                  </option>
                  {listaDeCampus.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <MapPin className="input-icon" />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="button-group">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Send size={18} /> Generate Card
              </>
            )}
          </motion.button>
          <button type="button" className="btn-reset" onClick={handleReset}>
            <Trash2 size={18} /> Clear
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default Form
