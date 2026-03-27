import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabaseSecretKey, getSupabaseUrl } from '@/lib/supabase/config'

export function createSupabaseAdminClient() {
  const secretKey = getSupabaseSecretKey()

  if (!secretKey) {
    throw new Error(
      '[supabase] Missing server-only secret. Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.'
    )
  }

  return createClient(getSupabaseUrl(), secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
