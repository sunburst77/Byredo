import ShopPageClient from './ShopPageClient'
import { ensureDefaultShopCatalog, getShopCategories, getShopProducts } from '@/lib/shop/data'

export default async function ShopPage() {
  await ensureDefaultShopCatalog()
  const [products, categories] = await Promise.all([getShopProducts(), getShopCategories()])

  return <ShopPageClient products={products} categories={categories} />
}