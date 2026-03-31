import { motion } from 'framer-motion'
import { AlertCircle, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { studentService } from '@/services/studentService'
import './Validation.css'

/**
 * Public validation page.
 * Fetches and displays student data based on a query parameter ID.
 * Used for verifying the authenticity of the digital card via QR Code.
 *
 * NOTE (LGPD/Privacy): The document ID (RG) is partially masked on this public
 * page to avoid exposing sensitive personal data. Only the first two digits
 * are shown; the remainder is replaced with asterisks.
 */

/**
 * Masks a Brazilian ID document (RG), showing only the leading digit group.
 * Example: "12.345.678-9" → "12.***.***-*"
 * @param {string} docId
 * @returns {string}
 */
const maskDocumentId = (docId) => {
  if (!docId) return ''
  // Keep the first segment (up to the first dot or first 2 chars), mask the rest
  return docId.replace(/(\d{2})\.\d{3}\.\d{3}-[\dX]/i, '$1.***.***-*')
}
const Validation = () => {
  const { user } = useAuth()
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
        setError('Registro não encontrado ou inválido.')
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
        <p>Validando credencial...</p>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="validacao-error">
        <AlertCircle size={64} color="#ef4444" />
        <h1>Validação Falhou</h1>
        <p>{error || 'Nenhum ID de validação fornecido.'}</p>
        {user && (
          <Link to="/history" className="btn-back">
            <ChevronLeft /> Voltar ao Histórico
          </Link>
        )}
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
            <h1>Credencial Validada</h1>
            <p>Documento autêntico e ativo no sistema</p>
          </div>
        </div>

        <div className="validacao-info">
          <div className="info-item">
            <span className="label">Nome Completo</span>
            <span className="value">{student.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Matrícula</span>
            <span className="value">{student.registration_id}</span>
          </div>
          <div className="info-row">
            <div className="info-item">
              <span className="label">Documento de Identidade</span>
              <span className="value">{maskDocumentId(student.document_id)}</span>
            </div>
            <div className="info-item">
              <span className="label">Data de Nascimento</span>
              <span className="value">{student.birth_date}</span>
            </div>
          </div>
          <div className="info-item">
            <span className="label">Curso</span>
            <span className="value uppercase">{student.course}</span>
          </div>
          <div className="info-item">
            <span className="label">Campus / Unidade</span>
            <span className="value uppercase">{student.campus}</span>
          </div>
        </div>

        <div className="validacao-footer">
          <div className="status-badge">
            <div className="dot"></div>
            CARTÃO ATIVO
          </div>
          <p className="timestamp">
            Consulta realizada em: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {user && (
        <Link to="/history" className="btn-home">
          Ir para o Histórico
        </Link>
      )}
    </motion.div>
  )
}

export default Validation
