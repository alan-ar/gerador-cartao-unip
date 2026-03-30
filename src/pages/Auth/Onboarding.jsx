import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Key, Shield } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './Onboarding.css'

function Onboarding() {
  const { validateCode, profile, logout } = useAuth()
  const [code, setCode] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!accepted) {
      setError('Você precisa aceitar os termos de uso para continuar.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await validateCode(code)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao validar o código secreto.')
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="onboarding-card glass-effect"
      >
        <div className="onboarding-header">
          <div className="status-badge bronze">NÍVEL BRONZE</div>
          <h1>Olá, {profile?.full_name?.split(' ')[0]}!</h1>
          <p>
            Para desbloquear as funcionalidades de geração de carteirinha, siga
            os passos abaixo:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="onboarding-section">
            <div className="section-title">
              <Shield size={20} />
              <span>Termos de Uso</span>
            </div>
            <div className="terms-box">
              <p>Ao utilizar este gerador, você concorda que:</p>
              <ul>
                <li>
                  Este documento é para fins de identificação digital
                  estudantil.
                </li>
                <li>
                  Você é o único responsável pela veracidade dos dados
                  informados.
                </li>
                <li>
                  O uso indevido deste sistema pode resultar na suspensão da
                  conta.
                </li>
              </ul>
            </div>
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="checkmark"></span>
              Li e concordo com os termos
            </label>
          </div>

          <div className="onboarding-section">
            <div className="section-title">
              <Key size={20} />
              <span>Código Secreto</span>
            </div>
            <p className="section-hint">
              Insira o código de convite fornecido pelo seu administrador.
            </p>
            <input
              type="text"
              className="input-code"
              placeholder="Digite seu código aqui..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="onboarding-actions">
            <button type="button" className="btn-secondary" onClick={logout}>
              Sair da Conta
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="loader-spinner"></span>
              ) : (
                <>
                  <CheckCircle size={20} /> Ativar Minha Conta
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Onboarding
