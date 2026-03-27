'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './AuthModal.module.css'
import type { AuthMode, AuthResult, AuthService, SignInInput } from '@/lib/auth/types'

type SignUpFormState = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

type AuthModalProps = {
  isOpen: boolean
  initialMode?: AuthMode
  onClose: () => void
  service: AuthService
}

const signInInitialState: SignInInput = {
  email: '',
  password: '',
}

const signUpInitialState: SignUpFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function AuthModal({
  isOpen,
  initialMode = 'sign-in',
  onClose,
  service,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [signInForm, setSignInForm] = useState<SignInInput>(signInInitialState)
  const [signUpForm, setSignUpForm] = useState<SignUpFormState>(signUpInitialState)
  const [feedback, setFeedback] = useState<AuthResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setMode(initialMode)
    setFeedback(null)
  }, [initialMode, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isMounted || !isOpen) {
    return null
  }

  const handleSuccessfulAuth = () => {
    window.setTimeout(() => {
      onClose()
    }, 900)
  }

  const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const result = await service.signIn(signInForm)
      setFeedback(result)

      if (result.ok) {
        setSignInForm(signInInitialState)
        handleSuccessfulAuth()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFeedback(null)

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setFeedback({
        ok: false,
        message: 'Passwords do not match.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await service.signUp({
        fullName: signUpForm.fullName,
        email: signUpForm.email,
        password: signUpForm.password,
      })
      setFeedback(result)

      if (result.ok) {
        setSignUpForm(signUpInitialState)
        setSignInForm(signInInitialState)
        handleSuccessfulAuth()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className={styles.root} aria-modal="true" role="dialog" aria-labelledby="auth-modal-title">
      <button className={styles.backdrop} aria-label="Close authentication modal" onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Account Access</p>
            <h2 id="auth-modal-title" className={styles.title}>
              {mode === 'sign-in' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>

        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleButton} ${mode === 'sign-in' ? styles.toggleButtonActive : ''}`}
            onClick={() => {
              setMode('sign-in')
              setFeedback(null)
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${mode === 'sign-up' ? styles.toggleButtonActive : ''}`}
            onClick={() => {
              setMode('sign-up')
              setFeedback(null)
            }}
          >
            Join
          </button>
        </div>

        <div className={styles.content}>
          {mode === 'sign-in' ? (
            <form className={styles.form} onSubmit={handleSignInSubmit}>
              <p className={styles.description}>
                Sign in to review saved pieces, manage orders, and continue with your Supabase account.
              </p>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={signInForm.email}
                  onChange={(event) => setSignInForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={signInForm.password}
                  onChange={(event) => setSignInForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </label>

              {feedback && (
                <p className={`${styles.feedback} ${feedback.ok ? styles.feedbackSuccess : styles.feedbackError}`}>
                  {feedback.message}
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Sign In'}
              </button>

              <p className={styles.switchText}>
                New here?{' '}
                <button type="button" className={styles.inlineButton} onClick={() => setMode('sign-up')}>
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSignUpSubmit}>
              <p className={styles.description}>
                Create a Supabase-backed member account. Your profile row is created automatically after signup.
              </p>

              <label className={styles.field}>
                <span>Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Your name"
                  value={signUpForm.fullName}
                  onChange={(event) => setSignUpForm((current) => ({ ...current, fullName: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={signUpForm.email}
                  onChange={(event) => setSignUpForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={signUpForm.password}
                  onChange={(event) => setSignUpForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Confirm Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={signUpForm.confirmPassword}
                  onChange={(event) =>
                    setSignUpForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  required
                />
              </label>

              {feedback && (
                <p className={`${styles.feedback} ${feedback.ok ? styles.feedbackSuccess : styles.feedbackError}`}>
                  {feedback.message}
                </p>
              )}

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Create Account'}
              </button>

              <p className={styles.switchText}>
                Already registered?{' '}
                <button type="button" className={styles.inlineButton} onClick={() => setMode('sign-in')}>
                  Sign in instead
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
    ,
    document.body
  )
}
