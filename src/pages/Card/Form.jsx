import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CreditCard,
  GraduationCap,
  MapPin,
  Send,
  Trash2,
  ShieldAlert,
  User,
  LogOut,
} from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { authService } from '@/services/authService'
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
  const { logout, user, isGold, isAdmin, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [formError, setFormError] = useState('')
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
    setFormError('')

    const nameParts = formData.name.trim().split(' ')
    if (nameParts.length < 2) {
      setFormError('Por favor, informe nome e sobrenome.')
      return
    }

    if (formData.document_id.length < 12) {
      setFormError('Documento de identidade (RG) incompleto.')
      return
    }

    const rgDigits = formData.document_id.replace(/\D/g, '')
    if (/^(\d)\1+$/.test(rgDigits)) {
      setFormError('Número de RG inválido (números repetidos).')
      return
    }

    if (formData.birth_date.length < 10) {
      setFormError('Data de nascimento incompleta. Use o formato DD/MM/AAAA.')
      return
    }

    const dateParts = formData.birth_date.split('/')
    if (dateParts.length === 3) {
      const d = parseInt(dateParts[0], 10)
      const m = parseInt(dateParts[1], 10)
      const y = parseInt(dateParts[2], 10)
      const dateObj = new Date(y, m - 1, d)
      if (
        dateObj.getFullYear() !== y ||
        dateObj.getMonth() !== m - 1 ||
        dateObj.getDate() !== d ||
        y < 1920 ||
        y >= new Date().getFullYear()
      ) {
        setFormError('Data de nascimento inválida.')
        return
      }
    }

    setLoading(true)
    try {
      // NOTE: created_at is intentionally omitted — the database uses DEFAULT NOW()
      const dataToSave = {
        ...formData,
        registration_id: generateRegistrationId().toString(),
        user_id: user.id,
      }

      const savedStudent = await studentService.create(dataToSave)
      
      if (!isGold) {
        await authService.promoteToGold(user.id)
        await refreshProfile()
      }
      
      // Redirect to the card visualization page
      navigate(`/card/${savedStudent.id}`)
    } catch (error) {
      console.error('Error saving student:', error)
      setFormError('Erro ao salvar os dados. Verifique sua conexão e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Limpar todos os campos?')) {
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

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      setFormError('Falha ao sair da conta.')
    } finally {
      setIsLoggingOut(false)
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
            <div>
              <div className={`status-badge ${isGold ? 'gold' : 'silver'}`}>
                NÍVEL {isGold ? 'OURO' : 'PRATA'}
              </div>
              <h1>Gerador de Carteirinha UNIP</h1>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <span className="loader-spinner"></span> : <><LogOut size={16} /> Sair</>}
            </button>
            <Link to="/history" className="link-history">
              Ver Histórico
            </Link>
            {isAdmin && (
              <Link to="/admin" className="link-history admin-btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <ShieldAlert size={16} style={{ marginRight: '6px' }} /> Painel Admin
              </Link>
            )}
          </div>
        </div>

        <div className="form-grid">
          <fieldset>
            <legend>
              <User className="legend-icon" /> Dados do Aluno
            </legend>
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="NOME DO ALUNO"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="document_id">Documento de Identidade (RG)</label>
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
                <label htmlFor="birth_date">Data de Nascimento</label>
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
              <GraduationCap className="legend-icon" /> Informações Acadêmicas
            </legend>
            <div className="form-group">
              <label htmlFor="course">Curso</label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Selecione um curso
                </option>
                {listaDeCursos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="campus">Campus / Unidade</label>
              <div className="input-with-icon">
                <select
                  id="campus"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Selecione um campus
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

        {formError && (
          <div className="form-error-inline">
            <AlertCircle size={16} />
            <span>{formError}</span>
          </div>
        )}

        <div className="button-group">
          <button type="button" className="btn-reset" onClick={handleReset}>
            <Trash2 size={18} /> Limpar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              'Salvando...'
            ) : (
              <>
                <Send size={18} /> Gerar Carteirinha
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default Form
