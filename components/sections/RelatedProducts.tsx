'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { formatPrice, type Product } from '@/lib/shop/products'
import styles from './RelatedProducts.module.css'

gsap.registerPlugin(ScrollTrigger)

type Props = {
  products: Product[]
  currentProductId: string
  scroller?: HTMLElement | Window
}

export default function RelatedProducts({ products, currentProductId, scroller }: Props) {
  const related = products.filter((product) => product.id !== currentProductId)
  const total = related.length

  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const maxIndex = Math.max(0, total - 3)
  const canPrev = index > 0
  const canNext = index < maxIndex

  const prev = () => setIndex((current) => Math.max(0, current - 1))
  const next = () => setIndex((current) => Math.min(maxIndex, current + 1))

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const items = track.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    gsap.set(items, { clipPath: 'inset(100% 0 0 0)', y: 40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    const timer = setTimeout(() => {
      tween = gsap.to(items, {
        clipPath: 'inset(0% 0 0 0)',
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: track,
          start: 'top 88%',
          once: true,
          ...(scroller && { scroller }),
        },
      })
    }, 950)

    return () => {
      clearTimeout(timer)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [related.length, scroller])

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${visible ? styles.sectionVisible : ''}`}
      aria-label="Related products"
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>RELATED PRODUCTS</h2>
        </div>

        <div className={styles.carouselContainer}>
          <button
            className={`${styles.arrowBtn} ${styles.arrowPrev} ${!canPrev ? styles.arrowDisabled : ''}`}
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={styles.carouselWrapper}>
            <div
              ref={trackRef}
              className={styles.carouselTrack}
              style={{
                width: `calc(${total} * ((100% - 50px) / 3))`,
                transform: `translateX(calc(-${index} * (100% / ${total})))`,
              }}
            >
              {related.map((product) => (
                <div key={product.id} className={`${styles.card} reveal-item`} style={{ width: `calc(100% / ${total})` }}>
                  <Link href={`/shop/${product.slug}`} className={styles.cardImageWrap} aria-label={`View ${product.name}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 90vw, 33vw"
                    />
                  </Link>
                  <div className={styles.cardInfo}>
                    <p className={styles.cardCategory}>{product.category}</p>
                    <h3 className={styles.cardName}>
                      <Link href={`/shop/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className={styles.cardPrice}>{formatPrice(product.price, product.currency)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className={`${styles.arrowBtn} ${styles.arrowNext} ${!canNext ? styles.arrowDisabled : ''}`}
            onClick={next}
            disabled={!canNext}
            aria-label="Next product"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 5L16 12L9 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
