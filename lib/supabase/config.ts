const REQUIRED_ENV_ERROR_PREFIX = '[supabase]'

function getRequiredValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${REQUIRED_ENV_ERROR_PREFIX} Missing environment variable: ${name}`)
  }

  return value
}

export function getSupabaseUrl() {
  return getRequiredValue(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL')
}

export function getSupabaseAnonKey() {
  return getRequiredValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export function getSupabaseSecretKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? ''
}
