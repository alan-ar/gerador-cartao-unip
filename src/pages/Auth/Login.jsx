import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Lock } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import './Login.css'

function Login() {
  const { loginWithGoogle, user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [user, navigate, from])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
    } catch (err) {
      setError('Falha ao autenticar com o Google. Tente novamente.')
      console.error(err)
      setLoading(false)
    }
  }

  if (authLoading) return <div className="loading-container"></div>

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card glass-effect"
      >
        <div className="login-header">
          <div className="icon-badge">
            <Lock size={24} />
          </div>
          <h1>Bem-vindo</h1>
          <p>Entre com sua conta Google para continuar</p>
        </div>

        <div className="login-form">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="error-alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="button"
            className="btn-google-login"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              <span className="loader-spinner"></span>
            ) : (
              <>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="20"
                />
                Entrar com Google
              </>
            )}
          </button>
        </div>

        <div className="login-footer">
          <p>Ao entrar, você concorda com nossos termos.</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
