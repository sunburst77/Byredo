import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Product, ShopCategory } from '@/lib/shop/products'
import { seedShopProducts } from '@/lib/shop/catalog-seed'

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : value ?? null
}

export async function ensureDefaultShopCatalog() {
  const supabaseAdmin = createSupabaseAdminClient()
  const { count: categoryCount } = await supabaseAdmin.from('categories').select('*', { count: 'exact', head: true })

  if ((categoryCount ?? 0) === 0) {
    const uniqueCategories = Array.from(
      new Map(
        seedShopProducts.map((product, index) => [
          product.categorySlug,
          {
            name: product.categoryName,
            slug: product.categorySlug,
            sort_order: index,
            is_active: true,
          },
        ])
      ).values()
    )

    await supabaseAdmin.from('categories').insert(uniqueCategories)
  }

  const { data: categories } = await supabaseAdmin.from('categories').select('id, slug')
  const categoryMap = new Map((categories ?? []).map((category) => [category.slug, category.id]))
  const { count: productCount } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true })

  if ((productCount ?? 0) === 0) {
    const seedRows = seedShopProducts
      .map((product, index) => {
        const categoryId = categoryMap.get(product.categorySlug)
        if (!categoryId) {
          return null
        }

        return {
          category_id: categoryId,
          sku: `SHOP-${String(index + 1).padStart(4, '0')}`,
          name: product.name,
          slug: product.slug,
          short_description: product.size ?? null,
          description: product.description,
          price: product.price,
          stock: 30,
          status: 'active',
          is_active: true,
          thumbnail_url: product.image,
        }
      })
      .filter(Boolean)

    if (seedRows.length > 0) {
      await supabaseAdmin.from('products').insert(seedRows)
    }
  }
}

export async function getShopCategories() {

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (data ?? []).map(
    (category) =>
      ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      }) satisfies ShopCategory
  )
}

export async function getShopProducts() {

  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, price, short_description, description, thumbnail_url, categories(name, slug)')
    .eq('is_active', true)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (data ?? []).map((product) => {
    const category = firstRelation(product.categories) as { name?: string | null; slug?: string | null } | null

    return {
      id: product.id,
      slug: product.slug,
      image: product.thumbnail_url || '/assets/shop/shop_1.png',
      category: category?.name ?? 'UNCATEGORIZED',
      categorySlug: category?.slug ?? 'uncategorized',
      name: product.name,
      price: Number(product.price ?? 0),
      currency: 'KRW',
      description: product.description || 'Details coming soon.',
      size: product.short_description || undefined,
    } satisfies Product
  })
}

export async function getShopProductBySlug(slug: string) {
  const products = await getShopProducts()
  return products.find((product) => product.slug === slug) ?? null
}