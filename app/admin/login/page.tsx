import Link from 'next/link'
import { redirect } from 'next/navigation'
import { loginAdminAction } from '@/app/admin/actions'
import { getCurrentAdminProfile } from '@/lib/admin/supabase-auth'
import { AdminLoginForm } from './AdminLoginForm'
import styles from './page.module.css'

type AdminLoginPageProps = {
  searchParams?: {
    error?: string
  }
}

const errorMessageMap: Record<string, string> = {
  required: '이메일과 비밀번호를 모두 입력해 주세요.',
  email: '올바른 이메일 형식으로 입력해 주세요.',
  password: '비밀번호는 6자 이상 입력해 주세요.',
  invalid: '이메일 또는 비밀번호가 올바르지 않습니다.',
  unauthorized: '관리자 권한이 없는 계정입니다.',
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const profile = await getCurrentAdminProfile()

  if (profile) {
    redirect('/admin')
  }

  const errorKey = searchParams?.error ?? ''
  const errorMessage = errorMessageMap[errorKey] ?? ''

  return (
    <main className={styles.page}>
      <div className={styles.center}>
        <section className={styles.card}>
          <div>
            <p className={styles.eyebrow}>Byredo Admin</p>
            <h1 className={styles.title}>관리자 로그인</h1>
            <p className={styles.description}>Supabase에 로그인된 관리자 계정만 관리자 페이지에 접근할 수 있습니다.</p>
          </div>

          {errorMessage ? <div className={`${styles.notice} ${styles.error}`}>{errorMessage}</div> : null}

          <AdminLoginForm action={loginAdminAction} />

          <div className={styles.footer}>
            메인 사이트로 돌아가려면 <Link href="/" className={styles.link}>홈으로 이동</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
