'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import CheckoutContent from '@/components/checkout/CheckoutContent'
import type { Product } from '@/lib/shop/products'
import styles from './CheckoutModal.module.css'

type CheckoutModalProps = {
  product: Product
  defaultQuantity?: number
  onClose: () => void
}

export default function CheckoutModal({
  product,
  defaultQuantity = 1,
  onClose,
}: CheckoutModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    return () => {
      setIsMounted(false)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!isMounted) {
    return null
  }

  return createPortal(
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="Checkout modal">
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="Close checkout modal" />
      <div className={styles.panel}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Purchase</p>
            <h2 className={styles.title}>Checkout</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close checkout modal">
            Close
          </button>
        </div>
        <div className={styles.content}>
          <CheckoutContent product={product} defaultQuantity={defaultQuantity} />
        </div>
      </div>
    </div>,
    document.body
  )
}
