'use client'

import { useState, useTransition } from 'react'
import type { MyPageProfile } from '@/lib/mypage/data'
import styles from './page.module.css'

type Props = {
  profile: MyPageProfile
  onSave: (formData: FormData) => Promise<{ ok: boolean; message: string }>
}

export default function MyPageProfileForm({ profile, onSave }: Props) {
  const [fullName, setFullName] = useState(profile.fullName ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData()
    formData.set('fullName', fullName)
    formData.set('phone', phone)

    startTransition(async () => {
      const result = await onSave(formData)
      setMessage(result.message)
      setIsSuccess(result.ok)
    })
  }

  return (
    <form className={styles.profileForm} onSubmit={handleSubmit}>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>이름</span>
        <input
          className={styles.input}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="이름을 입력해 주세요"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>이메일</span>
        <input className={`${styles.input} ${styles.inputMuted}`} value={profile.email} readOnly />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>연락처</span>
        <input
          className={styles.input}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="연락처를 입력해 주세요"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>가입일</span>
        <input className={`${styles.input} ${styles.inputMuted}`} value={new Intl.DateTimeFormat('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(profile.createdAt))} readOnly />
      </label>

      {message ? (
        <p className={`${styles.formMessage} ${isSuccess ? styles.formMessageSuccess : styles.formMessageError}`}>
          {message}
        </p>
      ) : null}

      <button type="submit" className={styles.primaryButton} disabled={isPending}>
        {isPending ? '저장 중...' : '회원정보 저장'}
      </button>
    </form>
  )
}
