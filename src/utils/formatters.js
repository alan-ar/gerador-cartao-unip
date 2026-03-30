/**
 * Formatting utilities and input masks for the UNIP Card project.
 * Uses pure functions to facilitate unit testing.
 */

/**
 * Formats a Brazilian ID (RG) with dots and a dash.
 */
export const formatDocumentId = (value) => {
  if (!value) return ''
  let v = value
    .toUpperCase()
    .replace(/[^0-9X]/g, '')
    .substring(0, 9)

  if (v.indexOf('X') !== -1 && v.indexOf('X') !== 8) {
    v = v.replace(/X/g, '')
  }

  v = v.replace(/^(\d{2})/, '$1.')
  v = v.replace(/^(\d{2})\.(\d{3})/, '$1.$2.')
  v = v.replace(/(\d{3})-?([\dX])$/, '$1-$2')
  return v
}

/**
 * Formats a date string into DD/MM/YYYY mask.
 */
export const formatBirthDate = (value) => {
  if (!value) return ''
  let v = value.replace(/\D/g, '').substring(0, 8)
  if (v.length > 4) {
    v = v.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3')
  } else if (v.length > 2) {
    v = v.replace(/(\d{2})(\d)/, '$1/$2')
  }
  return v
}

/**
 * Generates a random 7-digit enrollment/registration ID.
 */
export const generateRegistrationId = () => {
  const min = 1000000
  const max = 9999999
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Formats an ISO date string into Brazilian date format.
 */
export const formatDate = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('pt-BR')
}
