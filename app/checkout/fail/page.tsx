import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import styles from '../success/page.module.css'

type FailPageProps = {
  searchParams?: Promise<{
    code?: string
    message?: string
    orderId?: string
  }>
}

export default async function PaymentFailPage({ searchParams }: FailPageProps) {
  const params = searchParams ? await searchParams : {}
  const { code, message, orderId } = params

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Payment Failed</p>
          <h1 className={styles.title}>Error</h1>
          <ul className={styles.detail}>
            {orderId && (
              <li>
                <span className={styles.label}>Order ID</span>
                <span className={styles.value}>{orderId}</span>
              </li>
            )}
            {code && (
              <li>
                <span className={styles.label}>Code</span>
                <span className={styles.value}>{code}</span>
              </li>
            )}
            {message && (
              <li>
                <span className={styles.label}>Reason</span>
                <span className={styles.value}>{message}</span>
              </li>
            )}
          </ul>
          <Link href="/" className={styles.homeButton}>
            Back to Shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
