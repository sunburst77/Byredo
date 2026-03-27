import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CheckoutInfoPanel from '@/components/checkout/CheckoutInfoPanel'
import CheckoutQuantityPanel from '@/components/checkout/CheckoutQuantityPanel'
import { getShopProductBySlug } from '@/lib/shop/data'
import styles from './page.module.css'

type CheckoutPageProps = {
  searchParams?: Promise<{
    product?: string
    quantity?: string
  }>
}

function getInitialQuantity(quantity?: string) {
  const parsed = Number.parseInt(quantity ?? '1', 10)

  if (Number.isNaN(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const productSlug = resolvedSearchParams?.product?.trim() ?? ''
  const product = productSlug ? await getShopProductBySlug(productSlug) : null

  if (!product) {
    notFound()
  }

  const initialQuantity = getInitialQuantity(resolvedSearchParams?.quantity)

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.shell}>
          <CheckoutInfoPanel category={product.category} size={product.size} />
          <CheckoutQuantityPanel
            productName={product.name}
            unitPrice={product.price}
            currency={product.currency}
            defaultQuantity={initialQuantity}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
