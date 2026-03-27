import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getCurrentAdminProfile } from '@/lib/admin/supabase-auth'
import styles from './AdminLayout.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const headerStore = await headers()
  const pathname = headerStore.get('x-pathname') ?? ''
  const isDashboardPage = pathname === '/admin/dashboard' || pathname === '/admin'

  if (pathname === '/admin/login') {
    return children
  }

  const profile = await getCurrentAdminProfile()

  if (!profile) {
    redirect('/admin/login')
  }

  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <AdminSidebar />
        <div className={styles.content}>
          <AdminHeader profile={profile} />
          <main className={`${styles.main} ${isDashboardPage ? styles.mainDashboard : styles.mainScrollable}`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
