'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Footer from '@/components/Footer'
import type { Product, ShopCategory } from '@/lib/shop/products'
import { formatPrice } from '@/lib/shop/products'
import styles from './page.module.css'

gsap.registerPlugin(ScrollTrigger)

type ShopPageClientProps = {
  products: Product[]
  categories: ShopCategory[]
}

const ALL_CATEGORY = 'all'

export default function ShopPageClient({ products, categories }: ShopPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY)
  const gridRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const filteredProducts = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return products
    }

    return products.filter((product) => product.categorySlug === selectedCategory)
  }, [products, selectedCategory])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = grid.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    gsap.set(items, { clipPath: 'inset(0 0 100% 0)', y: -40, opacity: 0 })
  }, [filteredProducts])

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = grid.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    tweenRef.current?.scrollTrigger?.kill()
    tweenRef.current?.kill()

    const tween = gsap.to(items, {
      clipPath: 'inset(0 0 0% 0)',
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.14,
    })

    tweenRef.current = tween

    return () => {
      tweenRef.current?.scrollTrigger?.kill()
      tweenRef.current?.kill()
    }
  }, [filteredProducts])

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.filterSection} aria-label="Product categories">
          <div className={styles.filterInner}>
            <p className={styles.filterLabel}>Categories</p>
            <div className={styles.filterRow}>
              <button
                type="button"
                className={`${styles.filterButton} ${selectedCategory === ALL_CATEGORY ? styles.filterButtonActive : ''}`}
                onClick={() => setSelectedCategory(ALL_CATEGORY)}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`${styles.filterButton} ${selectedCategory === category.slug ? styles.filterButtonActive : ''}`}
                  onClick={() => setSelectedCategory(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div ref={gridRef} className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={`${styles.productCardWrap} reveal-item`}>
              <div className={styles.productCard}>
                <div className={styles.productBadge}>TRY-IT-FIRST</div>
                <button className={styles.cartButton} aria-label="Add to cart">
                  <Image src="/assets/shop/cart.png" alt="Cart" width={50} height={50} />
                </button>
                <Link href={`/shop/${product.slug}`} className={styles.productImage} aria-label={`${product.name} 상세 보기`}>
                  <Image src={product.image} alt={product.name} fill style={{ objectFit: 'cover' }} />
                </Link>
                <div className={styles.productInfo}>
                  <p className={styles.productCategory}>{product.category}</p>
                  <h2 className={styles.productName}>
                    <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                  </h2>
                  <p className={styles.productPrice}>{formatPrice(product.price, product.currency)}</p>
                  {product.size ? <p className={styles.productSize}>{product.size}</p> : null}
                  <button className={styles.bookmarkButton} aria-label="Bookmark">
                    <Image src="/assets/shop/mark.png" alt="Bookmark" width={20} height={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No products found in this category.</p>
            <p className={styles.emptyDescription}>Choose another category to browse more items.</p>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
