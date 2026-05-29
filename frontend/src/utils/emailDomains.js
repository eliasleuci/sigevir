/**
 * Dominios de correo permitidos (correos institucionales).
 * VITE_ALLOWED_EMAIL_DOMAINS=policia.gob.ar,fiscalia.gob.ar
 * Si está vacío, se acepta cualquier dominio (solo desarrollo).
 */
export const getAllowedEmailDomains = () => {
  const raw = import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || ''
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean)
}

export const isEmailDomainAllowed = (email) => {
  const domains = getAllowedEmailDomains()
  if (domains.length === 0) return true
  const domain = email?.split('@')[1]?.toLowerCase()
  return Boolean(domain && domains.includes(domain))
}

/** Primer dominio para el parámetro hd de Google (solo uno). */
export const getPrimaryHostedDomain = () => {
  const domains = getAllowedEmailDomains()
  return domains.length === 1 ? domains[0] : null
}
