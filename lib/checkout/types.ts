import type { Product } from '@/lib/shop/products'

export type CheckoutLineItem = {
  product: Product
  quantity: number
}

export type PaymentProvider = 'pending' | 'supabase' | 'toss-payments'

export type CheckoutSessionDraft = {
  items: CheckoutLineItem[]
  subtotal: number
  total: number
  currency: Product['currency']
  provider: PaymentProvider
}

export function getOrderTotal(items: CheckoutLineItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}
