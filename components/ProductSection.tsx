'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ProductSection.module.css'

gsap.registerPlugin(ScrollTrigger)

interface Product {
  id: number
  name: string
  price: string
  image: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Bal d\'Afrique',
    price: '₩280,000',
    image: '/assets/main/project/image1 1.jpg',
  },
  {
    id: 2,
    name: 'Gypsy Water',
    price: '₩320,000',
    image: '/assets/main/project/image2 1.jpg',
  },
  {
    id: 3,
    name: 'Mojave Ghost',
    price: '₩295,000',
    image: '/assets/main/project/image3 1.jpg',
  },
  {
    id: 4,
    name: 'Rose of No Man\'s Land',
    price: '₩310,000',
    image: '/assets/main/project/image4 1.jpg',
  },
]

export default function ProductSection() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const items = grid.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    gsap.set(items, { clipPath: 'inset(100% 0 0 0)', y: 40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성
    const timer = setTimeout(() => {
      tween = gsap.to(items, {
        clipPath: 'inset(0% 0 0 0)',
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: grid,
          start: 'top 88%',
          once: true,
        },
      })
    }, 950)

    return () => {
      clearTimeout(timer)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [])

  return (
    <section className={styles.loremSection}>
      <div className={styles.loremHeader}>
        <div>
          <h2 className={styles.loremTitleLeft}>SHOP</h2>
        </div>
        <div className={styles.loremLinkWrapper}>
          <Link href="/shop" className={styles.loremLink}>
            <span className={styles.loremLinkText}>VISIT SHOP</span>
            <span className={styles.loremLinkArrow}>→</span>
          </Link>
        </div>
        <div>
          <h2 className={styles.loremTitleRight}>NOW</h2>
        </div>
      </div>
      <div ref={gridRef} className={styles.productGrid}>
        {products.map((product) => (
          /* reveal-item: clip-path 애니메이션 대상 (overflow:hidden인 productItem 바깥) */
          <div key={product.id} className={`${styles.productItemWrap} reveal-item`}>
            <div className={styles.productItem} data-cursor-hover>
              <div className={styles.productItemBg} aria-hidden="true" />
              <img
                src={product.image}
                alt={product.name}
                className={styles.productItemImage}
              />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
