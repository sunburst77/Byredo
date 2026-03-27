'use client'

import { useMemo, useState } from 'react'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import styles from '@/app/checkout/page.module.css'
import { formatPrice } from '@/lib/shop/products'

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ''

type CheckoutQuantityPanelProps = {
  productName: string
  unitPrice: number
  currency: 'KRW'
  defaultQuantity?: number
}

export default function CheckoutQuantityPanel({
  productName,
  unitPrice,
  currency,
  defaultQuantity = 1,
}: CheckoutQuantityPanelProps) {
  const [quantity, setQuantity] = useState(Math.max(1, defaultQuantity))
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const total = useMemo(() => unitPrice * quantity, [quantity, unitPrice])

  async function handlePayment() {
    setPayError(null)
    setIsPaying(true)
    try {
      const tossPayments = await loadTossPayments(CLIENT_KEY)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS })

      const orderId = `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const origin = typeof window !== 'undefined' ? window.location.origin : ''

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: total },
        orderId,
        orderName: `${productName} x ${quantity}`,
        customerName: 'Guest',
        customerEmail: 'guest@byredo.com',
        successUrl: `${origin}/checkout/success`,
        failUrl: `${origin}/checkout/fail`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '결제 요청 중 오류가 발생했습니다.'
      setPayError(message)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <section className={styles.orderCard} aria-labelledby="order-summary-heading">
      <div className={styles.cardHeader}>
        <p className={styles.eyebrow}>Order Summary</p>
        <h2 id="order-summary-heading" className={styles.cardTitle}>
          Checkout Details
        </h2>
      </div>

      <div className={styles.lineList}>
        <div className={styles.lineRow}>
          <span className={styles.lineLabel}>Product</span>
          <span className={styles.lineValue}>{productName}</span>
        </div>
        <div className={styles.lineRow}>
          <span className={styles.lineLabel}>Unit Price</span>
          <span className={styles.lineValue}>{formatPrice(unitPrice, currency)}</span>
        </div>
        <div className={styles.quantityRow}>
          <span className={styles.lineLabel}>Quantity</span>
          <div className={styles.quantityControl} aria-label="Quantity selector">
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={styles.quantityValue}>{quantity}</span>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={() => setQuantity((current) => current + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatPrice(total, currency)}</span>
      </div>

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handlePayment}
        disabled={isPaying}
        aria-busy={isPaying}
      >
        {isPaying ? 'Processing…' : 'Continue to Payment'}
      </button>

      {payError && (
        <p className={styles.helperText} role="alert" style={{ color: '#c00' }}>
          {payError}
        </p>
      )}
    </section>
  )
}

