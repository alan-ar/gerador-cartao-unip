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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import './AdminDashboard.css'

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
      // 1. Buscar Usuários (Profiles)
      const { data: profiles, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (userError) throw userError
      setUsers(profiles)

      // 2. Buscar Códigos Secretos
      const { data: secretCodes, error: codeError } = await supabase
        .from('secret_codes')
        .select('*')
        .order('created_at', { ascending: false })

      if (codeError) throw codeError
      setCodes(secretCodes)
    } catch (err) {
      console.error('Erro ao buscar dados do admin:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCode = async (e) => {
    e.preventDefault()
    if (!newCode) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // 1. Desativar todos os códigos anteriores (conforme regra do usuário)
      await supabase
        .from('secret_codes')
        .update({ is_active: false })
        .eq('is_active', true)

      // 2. Inserir o novo código mestre
      const { error } = await supabase.from('secret_codes').insert([
        {
          code: newCode.toUpperCase(),
          created_by: user.id,
          is_active: true,
        },
      ])

      if (error) throw error
      setNewCode('')
      fetchData()
    } catch (err) {
      alert('Erro ao criar código: ' + err.message)
    }
  }

  const handleDeleteCode = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este código?')) return
    try {
      const { error } = await supabase
        .from('secret_codes')
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      alert('Erro ao excluir código.')
    }
  }

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) throw error
      fetchData()
    } catch (err) {
      alert('Erro ao atualizar status do usuário.')
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="admin-page">
      <header className="admin-header glass-effect">
        <div className="header-left">
          <ShieldAlert className="admin-icon" />
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerenciamento de usuários e acessos do sistema</p>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <LogOut size={18} /> Sair
        </button>
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
                <button className="btn-refresh" onClick={fetchData}>
                  <RefreshCw size={18} /> Atualizar
                </button>
              </div>

              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Email</th>
                      <th>Status atual</th>
                      <th>Cargo</th>
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
                        <td>
                          <span
                            className={`status-badge ${user.status.toLowerCase()}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td>{user.role}</td>
                        <td className="actions-cell">
                          <button
                            onClick={() =>
                              handleUpdateUserStatus(user.id, 'SILVER')
                            }
                            title="Tornar Silver"
                          >
                            🥈
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateUserStatus(user.id, 'GOLD')
                            }
                            title="Tornar Gold"
                          >
                            🥇
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateUserStatus(user.id, 'BRONZE')
                            }
                            title="Resetar para Bronze"
                          >
                            🥉
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
                  placeholder="Novo código mestre (Ex: UNIP2024)"
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
                          {new Date(code.created_at).toLocaleDateString()}
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
