const ADMIN_SESSION_COOKIE = 'byredo-admin-session'

function getRequiredAdminEnv(name: string) {
  return process.env[name] ?? ''
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE
}

export function getAdminLoginEmail() {
  return getRequiredAdminEnv('ADMIN_LOGIN_EMAIL')
}

export function getAdminLoginPassword() {
  return getRequiredAdminEnv('ADMIN_LOGIN_PASSWORD')
}

export function getAdminSessionSecret() {
  return getRequiredAdminEnv('ADMIN_SESSION_SECRET')
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminLoginEmail() && getAdminLoginPassword() && getAdminSessionSecret())
}

export async function createAdminSessionValue() {
  const secret = getAdminSessionSecret()

  if (!secret) {
    return ''
  }

  const buffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`byredo-admin:${secret}`)
  )

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function isValidAdminCredentials(email: string, password: string) {
  return email === getAdminLoginEmail() && password === getAdminLoginPassword()
}
