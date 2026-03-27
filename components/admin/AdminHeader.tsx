'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { logoutAdminAction } from '@/app/admin/actions'
import { adminNavigation } from '@/lib/admin/navigation'
import type { AdminProfile } from '@/lib/admin/supabase-auth'
import styles from './AdminHeader.module.css'

type AdminHeaderProps = {
  profile: AdminProfile
}

export function AdminHeader({ profile }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsMobileSearchOpen(false)
  }, [pathname])

  const initials = (profile.full_name ?? profile.email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? '')
    .join('') || 'AD'

  function getSearchTarget(value: string) {
    const normalized = value.trim()

    if (!normalized) {
      return pathname.startsWith('/admin/orders') ? '/admin/orders' : pathname
    }

    if (normalized.includes('@')) {
      return `/admin/members?q=${encodeURIComponent(normalized)}`
    }

    if (/^(ord|pay|shop|prd)[-_a-z0-9]/i.test(normalized) || normalized.includes('-')) {
      return `/admin/orders?q=${encodeURIComponent(normalized)}`
    }

    if (pathname.startsWith('/admin/members')) {
      return `/admin/members?q=${encodeURIComponent(normalized)}`
    }

    if (pathname.startsWith('/admin/products')) {
      return `/admin/products?q=${encodeURIComponent(normalized)}`
    }

    return `/admin/orders?q=${encodeURIComponent(normalized)}`
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsMobileSearchOpen(false)
    router.push(getSearchTarget(query))
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.headingWrap}>
            <button
              type="button"
              className={styles.mobileMenuButton}
              aria-label="관리자 메뉴 열기"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <HamburgerIcon />
            </button>
            <div className={styles.heading}>
              <p className={styles.eyebrow}>Admin Console</p>
              <h1 className={styles.title}>브랜드 운영 관리자</h1>
            </div>
          </div>
          <div className={styles.actions}>
            <form className={styles.search} onSubmit={handleSearchSubmit}>
              <SearchIcon />
              <input
                className={styles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="검색, 주문번호, 회원명"
                aria-label="관리자 검색"
              />
            </form>
            <button
              type="button"
              className={styles.mobileIconButton}
              aria-label="검색 열기"
              aria-expanded={isMobileSearchOpen}
              onClick={() => setIsMobileSearchOpen((current) => !current)}
            >
              <SearchIcon />
            </button>
            <div className={styles.profile}>{profile.full_name ?? profile.email}</div>
            <form action={logoutAdminAction}>
              <button type="submit" className={styles.logout}>
                로그아웃
              </button>
            </form>
            <div className={styles.avatar}>{initials}</div>
          </div>
        </div>
        {isMobileSearchOpen ? (
          <div className={styles.mobileSearchRow}>
            <form className={styles.mobileSearch} onSubmit={handleSearchSubmit}>
              <SearchIcon />
              <input
                className={styles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="검색, 주문번호, 회원명"
                aria-label="모바일 관리자 검색"
                autoFocus
              />
            </form>
          </div>
        ) : null}
      </header>

      {isMobileMenuOpen ? (
        <div className={styles.mobileMenuOverlay}>
          <button type="button" className={styles.mobileMenuBackdrop} aria-label="메뉴 닫기" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className={styles.mobileDrawer}>
            <div className={styles.mobileDrawerHeader}>
              <div>
                <p className={styles.eyebrow}>Admin Menu</p>
                <p className={styles.mobileDrawerTitle}>관리 메뉴</p>
              </div>
              <button type="button" className={styles.mobileDrawerClose} aria-label="메뉴 닫기" onClick={() => setIsMobileMenuOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <nav className={styles.mobileDrawerNav}>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link key={item.href} href={item.href} className={`${styles.mobileDrawerLink} ${isActive ? styles.mobileDrawerLinkActive : ''}`}>
                    <item.icon className={styles.mobileDrawerIcon} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M10.5 4a6.5 6.5 0 1 0 4.02 11.61l4.43 4.43 1.06-1.06-4.43-4.43A6.5 6.5 0 0 0 10.5 4Z"
        fill="currentColor"
      />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
