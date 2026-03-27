import ShopPageClient from './ShopPageClient'
import { getShopCategories, getShopProducts } from '@/lib/shop/data'

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getShopProducts(), getShopCategories()])

  return <ShopPageClient products={products} categories={categories} />
}