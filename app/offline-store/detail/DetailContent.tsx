'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './page.module.css'
import Footer from '@/components/Footer'
import CopyAddressButton from './CopyAddressButton'
import GoogleMap from './GoogleMap'

gsap.registerPlugin(ScrollTrigger)

const PREVIEW_TRANSITION_MS = 250
const STORE_ADDRESS = '123 Rue de Demo, 75000 Paris, France'

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatLocation(city: string, country: string): string {
  return `${toTitleCase(city)}, ${toTitleCase(country)}`
}

const STORE_TABLE_DUMMY: { city: string; country: string; storeName: string; image: string }[] = [
  { city: 'PARIS', country: 'FRANCE', storeName: 'LE BON MARCHE', image: '/assets/offline-store/image 25.jpg' },
  { city: 'LONDON', country: 'UNITED KINGDOM', storeName: 'HARRODS', image: '/assets/offline-store/image 26.jpg' },
  { city: 'MILAN', country: 'ITALY', storeName: 'LA RINASCENTE', image: '/assets/offline-store/image 27.jpg' },
  { city: 'TOKYO', country: 'JAPAN', storeName: 'ISETAN', image: '/assets/offline-store/image 28.jpg' },
  { city: 'NEW YORK', country: 'UNITED STATES', storeName: 'BERGDORF GOODMAN', image: '/assets/offline-store/image 29.jpg' },
]

export default function DetailContent() {
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null)
  const [displayIndex, setDisplayIndex] = useState<number | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  // 갤러리 이미지 컬럼 reveal
  useEffect(() => {
    const gallery = galleryRef.current
    if (!gallery) return

    const items = gallery.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    gsap.set(items, { clipPath: 'inset(0 0 100% 0)', y: -40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성
    const timer = setTimeout(() => {
      tween = gsap.to(items, {
        clipPath: 'inset(0 0 0% 0)',
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'power3.out',
        stagger: 0.22,
        scrollTrigger: {
          trigger: gallery,
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

  const handleRowEnter = useCallback((i: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setHoveredRowIndex(i)
    setDisplayIndex(i)
  }, [])

  const handleRowLeave = useCallback(() => {
    setHoveredRowIndex(null)
    hideTimeoutRef.current = setTimeout(() => {
      setDisplayIndex(null)
      hideTimeoutRef.current = null
    }, PREVIEW_TRANSITION_MS)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.mainTitle}>LE BON MARCHE</h1>

        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            Vero laudantium tenetur quaerat voluptatem recusandae voluptas fuga ut voluptas. Impedit dolorum accusamus. Natus laborum aut et quasi eligendi dolores et. Similique possimus quis. Distinctio dignissimos impedit dolorem quia dicta adipisci eius maxime. Sunt voluptatum rerum consequatur esse quia perspiciatis.
          </p>
        </div>

        <div className={styles.grayBoxAddressContainer}>
          <div className={styles.addressSection}>
            <div className={styles.addressTextGroup}>
              <p className={styles.addressLabel}>STORE ADDRESS</p>
              <p className={styles.addressText}>{STORE_ADDRESS}</p>
            </div>
            <CopyAddressButton address={STORE_ADDRESS} />
          </div>

          <GoogleMap address={STORE_ADDRESS} />
        </div>

        {/* 갤러리: 컬럼 단위로 reveal-item 적용 */}
        <div ref={galleryRef} className={styles.imageGallery}>
          <div className={`${styles.leftImageColumn} reveal-item`}>
            <div className={styles.leftImage}>
              <div className={styles.imageBg} />
              <img
                src="/assets/offline-store/detail/offline-store/ebf9c469bc2e7d38baaedec6a4e5c8af9fcbd313-5400x6156.jpg.jpg"
                alt="Store interior"
                className={styles.imageImg}
              />
            </div>
            <div className={styles.leftCaption}>
              <p className={styles.captionTitle}>SHOP TITLE</p>
              <div className={styles.captionDescription}>
                <p>DISCRIPTION DISCRIPTIONDISCRIPTION</p>
                <p>DISCRIPTION</p>
              </div>
            </div>
          </div>

          <div className={`${styles.rightImageColumn} reveal-item`}>
            <div className={styles.rightImage}>
              <div className={styles.imageBg} />
              <img
                src="/assets/offline-store/detail/offline-store/image 29.jpg"
                alt="Store interior"
                className={styles.imageImg}
              />
            </div>
            <div className={styles.rightCaption}>
              <p className={styles.captionTitle}>SHOP TITLE</p>
              <div className={styles.captionDescription}>
                <p>DISCRIPTION DISCRIPTIONDISCRIPTION</p>
                <p>DISCRIPTION</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableSectionWrapper}>
          <div
            className={`${styles.tablePreview} ${hoveredRowIndex !== null ? styles.tablePreviewVisible : ''}`}
            aria-hidden
          >
            {displayIndex !== null && (
              <img
                src={STORE_TABLE_DUMMY[displayIndex].image}
                alt=""
                className={styles.tablePreviewImg}
              />
            )}
          </div>
          <div className={styles.tableSection}>
            {STORE_TABLE_DUMMY.map((item, i) => (
              <div
                key={i}
                className={styles.tableItem}
                role="button"
                tabIndex={0}
                onMouseEnter={() => handleRowEnter(i)}
                onMouseLeave={handleRowLeave}
                onFocus={() => handleRowEnter(i)}
                onBlur={handleRowLeave}
                aria-label={`${formatLocation(item.city, item.country)} ${item.storeName} 미리보기`}
              >
                <div className={styles.tableBorder} />
                <div className={styles.tableContent}>
                  <div className={styles.tableLeft}>
                    <p className={styles.tableLocation}>{formatLocation(item.city, item.country)}</p>
                    <p className={styles.tableTitle}>{item.storeName}</p>
                  </div>
                  <p className={styles.tablePlus}>+</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
