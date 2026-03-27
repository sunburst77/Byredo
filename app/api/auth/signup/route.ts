import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type SignUpPayload = {
  fullName?: string
  email?: string
  password?: string
}

export async function POST(request: Request) {
  let payload: SignUpPayload

  try {
    payload = (await request.json()) as SignUpPayload
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request body.' }, { status: 400 })
  }

  const fullName = String(payload.fullName ?? '').trim()
  const email = String(payload.email ?? '').trim().toLowerCase()
  const password = String(payload.password ?? '').trim()

  if (!fullName || !email || !password) {
    return NextResponse.json({ ok: false, message: 'Please complete all required fields.' }, { status: 400 })
  }

  if (!emailPattern.test(email)) {
    return NextResponse.json({ ok: false, message: 'Enter a valid email address.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ ok: false, message: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  })

  if (error || !data.user) {
    const message = error?.message?.toLowerCase().includes('already')
      ? 'An account with this email already exists.'
      : error?.message || 'Unable to create your account.'

    return NextResponse.json({ ok: false, message }, { status: 400 })
  }

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    is_active: true,
  })

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id)
    return NextResponse.json({ ok: false, message: 'Unable to create your profile.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: 'Account created successfully. You are now signed in.',
  })
}
