'use client'

import { useMemo, useState } from 'react'
import styles from '@/app/checkout/page.module.css'
import { formatPrice } from '@/lib/shop/products'

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
  const total = useMemo(() => unitPrice * quantity, [quantity, unitPrice])

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

      <button type="button" className={styles.primaryButton}>
        Continue to Payment
      </button>

      <p className={styles.helperText}>
        Payment processing is not enabled yet. This screen is ready for future Supabase and Toss
        Payments integration.
      </p>
    </section>
  )
}

