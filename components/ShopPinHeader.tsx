'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './ShopPinHeader.module.css'

type ShopPinHeaderProps = {
  onPurchase?: () => void
}

export default function ShopPinHeader({ onPurchase }: ShopPinHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <button
          className={styles.hamburgerButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        <nav className={styles.headerNav}>
          <Link href="/shop">shop</Link>
          <Link href="/offline-store">offline-store</Link>
        </nav>

        <div className={styles.headerLogo}>
          <img
            src="/assets/main/etc/logo.svg"
            alt="BYREDO"
            width={100}
            height={21}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          />
        </div>

        <div className={styles.headerRight}>
          <button className={styles.purchaseBtn} type="button" onClick={onPurchase}>
            PURCHASE
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.menuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          <Link href="/shop" onClick={closeMenu}>shop</Link>
          <Link href="/offline-store" onClick={closeMenu}>offline-store</Link>
          <Link href="/mypage" onClick={closeMenu}>mypage</Link>
          <Link href="/login" onClick={closeMenu}>login</Link>
          <Link href="/join" onClick={closeMenu}>join</Link>
        </nav>
      </div>
      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={closeMenu} />
      )}
    </header>
  )
}
