import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ profile: null })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.json({
    profile: profile ?? {
      id: user.id,
      email: user.email ?? '',
      full_name: (user.user_metadata.full_name as string | undefined) ?? null,
      role: user.app_metadata.role === 'admin' ? 'admin' : 'customer',
    },
  })
}
