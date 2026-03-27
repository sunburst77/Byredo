import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { getShopProductBySlug, getShopProducts } from '@/lib/shop/data'

type ProductDetailPageProps = {
  params: Promise<{
    product: string
  }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { product: slug } = await params
  const [product, products] = await Promise.all([getShopProductBySlug(slug), getShopProducts()])

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} products={products} />
}