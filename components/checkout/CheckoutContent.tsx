import CheckoutInfoPanel from '@/components/checkout/CheckoutInfoPanel'
import CheckoutQuantityPanel from '@/components/checkout/CheckoutQuantityPanel'
import type { Product } from '@/lib/shop/products'
import styles from '@/app/checkout/page.module.css'

type CheckoutContentProps = {
  product: Product
  defaultQuantity?: number
}

export default function CheckoutContent({
  product,
  defaultQuantity = 1,
}: CheckoutContentProps) {
  return (
    <div className={styles.shell}>
      <CheckoutInfoPanel category={product.category} size={product.size} />
      <CheckoutQuantityPanel
        productName={product.name}
        unitPrice={product.price}
        currency={product.currency}
        defaultQuantity={defaultQuantity}
      />
    </div>
  )
}
