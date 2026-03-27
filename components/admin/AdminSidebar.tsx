'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminNavigation } from '@/lib/admin/navigation'
import styles from './AdminSidebar.module.css'

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <Link href="/admin/dashboard" className={styles.brand}>
        <p className={styles.brandEyebrow}>Byredo</p>
        <p className={styles.brandTitle}>Admin Console</p>
        <p className={styles.brandText}>좌측에서 섹션을 선택하고 우측 작업 영역에서 실데이터를 점검하고 수정 흐름으로 이동합니다.</p>
      </Link>

      <nav className={styles.nav}>
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              <item.icon className={styles.icon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.panel}>
        <p className={styles.panelEyebrow}>Workspace</p>
        <p className={styles.panelText}>모든 수치는 Supabase 실데이터를 기준으로 렌더링됩니다. 상세 수정은 각 관리 메뉴에서 이어집니다.</p>
      </div>
    </aside>
  )
}
