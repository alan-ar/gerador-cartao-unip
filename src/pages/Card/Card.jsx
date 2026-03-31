import { studentService } from '@/services/studentService'
import domtoimage from 'dom-to-image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  ChevronLeft,
  Download,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './Card.css'

/**
 * Component that renders the Digital Student Card.
 * Allows viewing student data and downloading it as a PNG image.
 */
function Card({ data: initialData }) {
  const { id } = useParams()
  const [student, setStudent] = useState(initialData || null)
  const [loading, setLoading] = useState(!initialData && !!id)
  const [error, setError] = useState(null)
  const [expiryDate, setExpiryDate] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    if (initialData) {
      setStudent(initialData)
      setLoading(false)
    } else if (id) {
      fetchStudent(id)
    }
  }, [id, initialData])

  useEffect(() => {
    if (!student) return
    // Derive expiry year from the card's creation date (stored in DB),
    // so the displayed year always reflects the actual issuance year.
    const createdYear = new Date(student.created_at).getFullYear()
    setExpiryDate(`DEZ/${createdYear}`)
  }, [student])

  const fetchStudent = async (studentId) => {
    try {
      setLoading(true)
      const data = await studentService.getById(studentId)
      setStudent(data)
    } catch (err) {
      console.error('Error fetching student:', err)
      setError('Carteirinha não encontrada ou erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  const saveAsImage = () => {
    if (cardRef.current && student) {
      setIsExporting(true)
      // Scale 3 to ensure high resolution on export
      const scale = 3
      const options = {
        width: cardRef.current.clientWidth * scale,
        height: cardRef.current.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${cardRef.current.clientWidth}px`,
          height: `${cardRef.current.clientHeight}px`,
        },
        quality: 1.0,
        bgcolor: '#fff',
      }

      // Small delay to ensure the DOM is ready for capture
      setTimeout(() => {
        domtoimage
          .toPng(cardRef.current, options)
          .then((dataUrl) => {
            const link = document.createElement('a')
            link.download = `unip-card-${student.registration_id}.png`
            link.href = dataUrl
            link.click()
            setIsExporting(false)
          })
          .catch((err) => {
            console.error('Export error:', err)
            alert('Erro ao gerar imagem.')
            setIsExporting(false)
          })
      }, 100)
    }
  }

  if (loading) {
    return (
      <div className="card-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Carregando carteirinha...</p>
      </div>
    )
  }

  if (error || (!student && !loading)) {
    return (
      <div className="card-error">
        <h2>Oops!</h2>
        <p>{error || 'Carteirinha do aluno não encontrada.'}</p>
        <Link to="/history" className="btn-back">
          <ChevronLeft /> Voltar ao Histórico
        </Link>
      </div>
    )
  }

  // Validation URL embedded in the QR Code
  const validationUrl = `${window.location.origin}/validation?id=${student.id}`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="card-page-container"
      >
        <div className="card-view-header">
          <Link to="/history" className="btn-back-link">
            <ChevronLeft size={18} /> Voltar ao Histórico
          </Link>
          <div className="header-status">
            <CheckCircle size={16} color="#10b981" />
            <span>Carteirinha Gerada</span>
          </div>
        </div>

        <div className="card-wrapper">
          <div className="card-background" ref={cardRef}>
            <div className="card-top">
              <img src="/unip.png" alt="UNIP" className="logo" />
              <div className="univ-info">
                <p className="university">UNIVERSIDADE PAULISTA</p>
                <div className="badge-valid">
                  <ShieldCheck size={12} /> DOCUMENTO DIGITAL
                </div>
              </div>
            </div>

            <p className="course-tag">{student.course || 'COURSE'}</p>

            <div className="card-body">
              <div className="info-section">
                <div className="data-field">
                  <label>NOME</label>
                  <p className="val-name">{student.name}</p>
                </div>

                <div className="data-grid">
                  <div className="data-field">
                    <label>MATRÍCULA</label>
                    <p>{student.registration_id}</p>
                  </div>
                  <div className="data-field">
                    <label>RG</label>
                    <p>{student.document_id}</p>
                  </div>
                  <div className="data-field">
                    <label>NASCIMENTO</label>
                    <p>{student.birth_date}</p>
                  </div>
                  <div className="data-field">
                    <label>VALIDADE</label>
                    <p className="highlight-val">{expiryDate}</p>
                  </div>
                </div>

                <div className="data-field campus-field">
                  <label>CAMPUS / UNIDADE</label>
                  <p>{student.campus}</p>
                </div>
              </div>

              <div className="qr-section">
                <div className="qr-container">
                  <QRCodeSVG
                    value={validationUrl}
                    size={130}
                    level="H"
                    includeMargin={false}
                    className="qrcode"
                  />
                </div>
                <span className="qr-label">VALIDAR DOCUMENTO</span>
              </div>
            </div>

            <div className="card-footer">
              <div className="stripe"></div>
              <p>Este cartão é pessoal e intransferível.</p>
            </div>
          </div>
        </div>

        <div className="controls-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-download"
            onClick={saveAsImage}
            disabled={isExporting}
          >
            {isExporting ? (
              'Processando...'
            ) : (
              <>
                <Download size={20} /> Baixar Carteirinha (PNG)
              </>
            )}
          </motion.button>
          <div className="success-msg">
            <CheckCircle size={16} /> Link de visualização pronto
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Card
