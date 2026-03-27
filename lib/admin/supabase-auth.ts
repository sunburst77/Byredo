import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export type AdminProfile = {
  id: string
  email: string
  full_name: string | null
  role: 'customer' | 'staff' | 'admin'
}

export async function getCurrentAdminProfile() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle<AdminProfile>()

  if (!profile || profile.role !== 'admin') {
    return null
  }

  return profile
}

