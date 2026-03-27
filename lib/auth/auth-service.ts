import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { AuthService } from '@/lib/auth/types'

const ADMIN_EMAIL = 'sunburst77@naver.com'

let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null

function getBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }

  return browserClient
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const authService: AuthService = {
  async signIn({ email, password }) {
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return {
        ok: false,
        message: getErrorMessage(error, 'Unable to sign in.'),
      }
    }

    return {
      ok: true,
      message: 'Signed in successfully.',
    }
  },
  async signUp({ fullName, email, password }) {
    const supabase = getBrowserClient()
    const normalizedEmail = email.trim().toLowerCase()
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
      }),
    })

    const payload = (await response.json()) as { ok?: boolean; message?: string }

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        message: payload.message || 'Unable to create your account.',
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (signInError) {
      return {
        ok: true,
        message:
          normalizedEmail === ADMIN_EMAIL
            ? 'Account created. Sign in to continue with this admin account.'
            : 'Account created successfully. Sign in to continue.',
      }
    }

    return {
      ok: true,
      message:
        normalizedEmail === ADMIN_EMAIL
          ? 'Account created successfully. You are now signed in as admin.'
          : payload.message || 'Account created successfully. You are now signed in.',
    }
  },
}
