export type ShopCategory = {
  id: string
  name: string
  slug: string
}

export type Product = {
  id: string
  slug: string
  image: string
  category: string
  categorySlug: string
  name: string
  price: number
  currency: 'KRW'
  description: string
  size?: string
}

export function formatPrice(price: number, currency: Product['currency'] = 'KRW') {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}
