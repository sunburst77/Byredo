'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthModal from '@/components/auth/AuthModal'
import styles from './Header.module.css'
import { authService } from '@/lib/auth/auth-service'
import type { AuthMode } from '@/lib/auth/types'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type HeaderProfile = {
  id: string
  email: string
  full_name: string | null
  role: 'customer' | 'admin'
}

const supabase = createSupabaseBrowserClient()

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('sign-up')
  const [profile, setProfile] = useState<HeaderProfile | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const syncProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })
        const payload = (await response.json()) as { profile: HeaderProfile | null }

        if (!isMounted) {
          return
        }

        setProfile(payload.profile)
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    void syncProfile()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncProfile()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
    closeMenu()
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    await supabase.auth.signOut()
    setProfile(null)
    closeMenu()
  }

  const displayName = profile?.full_name?.trim() || profile?.email || 'account'
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContainer}>
          <button
            className={styles.hamburgerButton}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineTopOpen : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineMiddleOpen : ''}`}></span>
            <span className={`${styles.hamburgerLine} ${isMenuOpen ? styles.hamburgerLineBottomOpen : ''}`}></span>
          </button>

          <nav className={styles.headerNav}>
            <Link href="/shop">shop</Link>
            <Link href="/offline-store">offline-store</Link>
          </nav>

          <Link href="/" className={styles.headerLogo} aria-label="Go to the BYREDO home page">
            <img
              src="/assets/main/etc/logo.svg"
              alt="BYREDO"
              width={100}
              height={21}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </Link>

          <div className={styles.headerRight}>
            <Link href="/mypage">mypage</Link>
            {isAuthLoading ? null : profile ? (
              <>
                {isAdmin ? <Link href="/admin">admin</Link> : null}
                <span className={styles.headerLabel}>{displayName}</span>
                <button type="button" className={styles.headerAction} onClick={handleSignOut}>
                  logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.headerAction} onClick={() => openAuthModal('sign-in')}>
                  login
                </button>
                <button type="button" className={styles.headerAction} onClick={() => openAuthModal('sign-up')}>
                  join
                </button>
              </>
            )}
          </div>
        </div>

        <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <nav className={styles.mobileNav}>
            <Link href="/shop" onClick={closeMenu}>
              shop
            </Link>
            <Link href="/offline-store" onClick={closeMenu}>
              offline-store
            </Link>
            <Link href="/mypage" onClick={closeMenu}>
              mypage
            </Link>
            {isAuthLoading ? null : profile ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" onClick={closeMenu}>
                    admin
                  </Link>
                ) : null}
                <span className={styles.mobileLabel}>{displayName}</span>
                <button type="button" className={styles.mobileAction} onClick={handleSignOut}>
                  logout
                </button>
              </>
            ) : (
              <>
                <button type="button" className={styles.mobileAction} onClick={() => openAuthModal('sign-in')}>
                  login
                </button>
                <button type="button" className={styles.mobileAction} onClick={() => openAuthModal('sign-up')}>
                  join
                </button>
              </>
            )}
          </nav>
        </div>

        {isMenuOpen && <div className={styles.menuOverlay} onClick={closeMenu}></div>}
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        service={authService}
      />
    </>
  )
}
