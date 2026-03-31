import {
  CheckCircle,
  Key,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  XCircle,
  Award,
  ShieldCheck,
  UserMinus,
  Download,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '@/utils/formatters'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { profileService } from '@/services/profileService'
import { secretCodeService } from '@/services/secretCodeService'
import { supabase } from '@/lib/supabase'
import './AdminDashboard.css'

/**
 * Administrative dashboard for managing users and secret codes.
 * Uses the profileService and secretCodeService to maintain the service layer architecture.
 */
function AdminDashboard() {
  const { logout } = useAuth()
  const [users, setUsers] = useState([])
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [newCode, setNewCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [profiles, secretCodes] = await Promise.all([
        profileService.getAll(),
        secretCodeService.getAll(),
      ])
      setUsers(profiles)
      setCodes(secretCodes)
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCode = async (e) => {
    e.preventDefault()
    if (!newCode.trim()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await secretCodeService.create(newCode, user.id)
      setNewCode('')
      fetchData()
    } catch (err) {
      alert('Erro ao criar código: ' + err.message)
    }
  }

  const handleDeleteCode = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este código?')) return
    try {
      await secretCodeService.delete(id)
      fetchData()
    } catch (err) {
      alert('Erro ao excluir código: ' + err.message)
    }
  }

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await profileService.updateStatus(userId, newStatus)
      fetchData()
    } catch (err) {
      alert('Erro ao atualizar status do usuário: ' + err.message)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleExportCSV = () => {
    const headers = 'Nome,Email,Status,Cargo,Data de Registro\n'
    const rows = filteredUsers.map(user => {
      const nome = user.full_name || ''
      const email = user.email || ''
      const status = user.status === 'GOLD' ? 'Ouro' : user.status === 'SILVER' ? 'Prata' : user.status === 'BRONZE' ? 'Bronze' : user.status
      const cargo = user.role === 'admin' ? 'Admin' : 'Usuário'
      const registro = user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : ''
      return `"${nome}","${email}","${status}","${cargo}","${registro}"`
    }).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "usuarios_admin.csv")
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header glass-effect">
        <div className="header-left">
          <ShieldAlert className="admin-icon" />
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerenciamento de usuários e acessos</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-logout" onClick={logout}>
            <LogOut size={16} /> Sair
          </button>
          <Link to="/" className="btn-back">
            Acessar o App
          </Link>
        </div>
      </header>

      <main className="admin-content">
        <nav className="admin-tabs glass-effect">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> Usuários
          </button>
          <button
            className={activeTab === 'codes' ? 'active' : ''}
            onClick={() => setActiveTab('codes')}
          >
            <Key size={20} /> Códigos Secretos
          </button>
        </nav>

        <div className="admin-panel glass-effect">
          {activeTab === 'users' ? (
            <div className="users-tab">
              <div className="table-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="table-actions-right" style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-refresh" onClick={fetchData} disabled={loading}>
                    <RefreshCw size={18} /> Atualizar
                  </button>
                  <button className="btn-export-csv" onClick={handleExportCSV}>
                    <Download size={18} /> Exportar CSV
                  </button>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Email</th>
                      <th>Cargo</th>
                      <th>Status Atual</th>
                      <th>Registro</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div
                              className="avatar-mini"
                              style={{
                                backgroundImage: `url(${user.avatar_url})`,
                              }}
                            ></div>
                            <span>{user.full_name}</span>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}</td>
                        <td>
                          <span
                            className={`status-badge ${user.status.toLowerCase()}`}
                          >
                            {user.status === 'GOLD' ? 'Ouro' : user.status === 'SILVER' ? 'Prata' : user.status === 'BRONZE' ? 'Bronze' : user.status}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-status btn-bronze-action"
                            onClick={() => handleUpdateUserStatus(user.id, 'BRONZE')}
                            title="Rebaixar para Bronze"
                          >
                            <UserMinus size={16} />
                          </button>
                          <button
                            className="btn-status btn-silver-action"
                            onClick={() => handleUpdateUserStatus(user.id, 'SILVER')}
                            title="Promover para Prata"
                          >
                            <ShieldCheck size={16} />
                          </button>
                          <button
                            className="btn-status btn-gold-action"
                            onClick={() => handleUpdateUserStatus(user.id, 'GOLD')}
                            title="Promover para Ouro"
                          >
                            <Award size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="codes-tab">
              <form className="create-code-form" onSubmit={handleCreateCode}>
                <input
                  type="text"
                  placeholder="Novo código mestre (ex: UNIP2024)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
                <button type="submit" className="btn-add-code">
                  <Plus size={18} /> Ativar Novo Código
                </button>
              </form>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Status</th>
                      <th>Criado em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id}>
                        <td className="code-text">{code.code}</td>
                        <td>
                          {code.is_active ? (
                            <span className="state-active">
                              <CheckCircle size={14} /> Ativo
                            </span>
                          ) : (
                            <span className="state-inactive">
                              <XCircle size={14} /> Expirado
                            </span>
                          )}
                        </td>
                        <td>
                          {formatDate(code.created_at)}
                        </td>
                        <td>
                          <button
                            className="btn-delete-code"
                            onClick={() => handleDeleteCode(code.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
