/**
 * Access/status levels for user accounts.
 * BRONZE: nível padrão, acesso somente leitura.
 * SILVER: ativado via código secreto, acesso completo à geração de carteirinha.
 * GOLD: status elevado, atribuído manualmente por administradores.
 */
export const USER_STATUS = {
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
}

/**
 * Papéis de sistema para controle de permissões.
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

/**
 * Mensagens de erro padronizadas para os fluxos de autenticação.
 */
export const AUTH_ERRORS = {
  NOT_AUTHENTICATED: 'Usuário não autenticado. Por favor, faça login.',
  INVALID_CODE: 'Código secreto inválido ou já utilizado.',
  PROFILE_NOT_FOUND: 'Perfil do usuário não encontrado.',
}
