import styles from '@/app/checkout/page.module.css'

type CheckoutInfoPanelProps = {
  category: string
  size?: string
}

export default function CheckoutInfoPanel({ category, size }: CheckoutInfoPanelProps) {
  return (
    <section className={styles.infoCard} aria-labelledby="checkout-overview-heading">
      <div className={styles.cardHeader}>
        <p className={styles.eyebrow}>Checkout</p>
        <h1 id="checkout-overview-heading" className={styles.pageTitle}>
          Monotone Purchase Flow
        </h1>
      </div>

      <p className={styles.lead}>
        Review your selected fragrance before payment. The current screen is a presentational
        checkout layer designed to connect cleanly to order storage and external payment providers.
      </p>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Category</span>
          <span className={styles.metaValue}>{category}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Size</span>
          <span className={styles.metaValue}>{size ?? 'Standard Edition'}</span>
        </div>
      </div>
    </section>
  )
}
