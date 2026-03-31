import { AnimatePresence, motion } from 'framer-motion'
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom'

// Pages
import AdminDashboard from '@/pages/Admin/AdminDashboard'
import Card from '@/pages/Card/Card'
import Form from '@/pages/Card/Form'
import History from '@/pages/Card/History'
import Login from '@/pages/Auth/Login'
import Onboarding from '@/pages/Auth/Onboarding'
import Validation from '@/pages/Validation/Validation'

// Structure and Context Components
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { AuthProvider } from '@/context/AuthContext'

function AnimatedRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Onboarding (somente para BRONZE — ativados são redirecionados para /) */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute onlyBronze={true}>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Card Generator (Requires Silver or Admin) */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiresSilver={true}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="page-wrapper"
            >
              <Form />
            </motion.div>
          </ProtectedRoute>
        }
      />

      {/* Card Visualization (Public via ID or Private with RLS) */}
      <Route path="/card/:id" element={<Card />} />

      {/* Protected History */}
      <Route
        path="/history"
        element={
          <ProtectedRoute requiresSilver={true}>
            <History />
          </ProtectedRoute>
        }
      />

      {/* Administrative Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiresAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Validation */}
      <Route path="/validation" element={<Validation />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <AnimatedRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
