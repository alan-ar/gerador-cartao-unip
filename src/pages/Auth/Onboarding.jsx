import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Key, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './Onboarding.css'

function Onboarding() {
  const { validateCode, profile, logout, isSilver, isAdmin, loading: authLoading } = useAuth()
  const [code, setCode] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()

  /**
   * Bug 3 fix: Se o usuário já tem status SILVER/GOLD ou é admin,
   * ele não deve estar nesta tela. Redireciona para o início.
   * Cobre o caso de retorno após fechar o app com conta já ativada.
   */
  useEffect(() => {
    if (!authLoading && (isSilver || isAdmin)) {
      navigate('/', { replace: true })
    }
  }, [isSilver, isAdmin, authLoading, navigate])

  /**
   * Bug 1 fix: `isLoggingOut` é um estado separado de `loading` (submit).
   * Evita que o spinner apareça no botão "Ativar Minha Conta" ao clicar em "Sair".
   */
  const handleLogout = async () => {
    setIsLoggingOut(true)
    setError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      setError('Falha ao sair da conta. Tente novamente.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  /**
   * Bug 2 fix: `finally` garante que `loading` seja sempre zerado,
   * evitando loop infinito caso `validateCode` não lance exceção.
   * Também valida `data` retornado — RPC pode retornar `false` sem `error`.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!accepted) {
      setError('Você precisa aceitar os termos de uso para continuar.')
      return
    }
    if (!code.trim()) {
      setError('Insira o código secreto antes de continuar.')
      return
    }

    setLoading(true)
    try {
      const success = await validateCode(code)
      if (success) {
        navigate('/', { replace: true })
      } else {
        // RPC retornou false (sem erro explícito) — código inválido
        setError('Código secreto inválido ou expirado.')
      }
    } catch (err) {
      setError(err.message || 'Erro ao validar o código secreto.')
    } finally {
      setLoading(false)
    }
  }

  // Enquanto o AuthContext verifica o perfil, não renderiza nada (evita flash)
  if (authLoading) return null

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
            {/* type="button" previne submit do form ao clicar em Sair */}
            <button
              type="button"
              className="btn-secondary"
              onClick={handleLogout}
              disabled={loading || isLoggingOut}
            >
              {isLoggingOut ? <span className="loader-spinner"></span> : 'Sair da Conta'}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || isLoggingOut}
            >
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
