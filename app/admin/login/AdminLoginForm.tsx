'use client'

import { useState, useTransition } from 'react'
import styles from './page.module.css'

type AdminLoginFormProps = {
  action: (formData: FormData) => void | Promise<void>
  disabled?: boolean
}

type FormErrors = {
  email?: string
  password?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AdminLoginForm({ action, disabled = false }: AdminLoginFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPending, startTransition] = useTransition()

  function validate(formData: FormData) {
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()
    const nextErrors: FormErrors = {}

    if (!email) {
      nextErrors.email = '이메일을 입력해 주세요.'
    } else if (!emailPattern.test(email)) {
      nextErrors.email = '올바른 이메일 형식으로 입력해 주세요.'
    }

    if (!password) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    } else if (password.length < 6) {
      nextErrors.password = '비밀번호는 6자 이상 입력해 주세요.'
    }

    return nextErrors
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const nextErrors = validate(formData)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-email">
          이메일
        </label>
        <input
          id="admin-email"
          type="email"
          name="email"
          placeholder="admin@byredo.com"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'admin-email-error' : undefined}
          onChange={() => {
            if (errors.email) {
              setErrors((current) => ({ ...current, email: undefined }))
            }
          }}
          required
        />
        {errors.email ? (
          <p id="admin-email-error" className={styles.fieldError}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="admin-password">
          비밀번호
        </label>
        <input
          id="admin-password"
          type="password"
          name="password"
          placeholder="비밀번호를 입력하세요"
          className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
          autoComplete="current-password"
          minLength={6}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'admin-password-error' : undefined}
          onChange={() => {
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }))
            }
          }}
          required
        />
        {errors.password ? (
          <p id="admin-password-error" className={styles.fieldError}>
            {errors.password}
          </p>
        ) : null}
      </div>

      <button type="submit" className={styles.submit} disabled={disabled || isPending}>
        {isPending ? '확인 중...' : '로그인'}
      </button>
    </form>
  )
}
