'use client'

import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './page.module.css'

gsap.registerPlugin(ScrollTrigger)

/** Lenis 스크롤 방지 — 이 페이지는 네이티브 스크롤으로 pin + 가로 슬라이드 */
interface Store {
  id: number
  image: string
  title: string
  tags: string[]
}

const stores: Store[] = [
  {
    id: 1,
    image: '/assets/offline-store/image 25.jpg',
    title: 'BYREDO Seoul Gangnam',
    tags: ['Seoul', 'Korea', 'Flagship'],
  },
  {
    id: 2,
    image: '/assets/offline-store/image 26.jpg',
    title: 'BYREDO Tokyo Omotesando',
    tags: ['Tokyo', 'Japan', 'Concept'],
  },
  {
    id: 3,
    image: '/assets/offline-store/image 27.jpg',
    title: 'BYREDO New York SoHo',
    tags: ['New York', 'USA', 'Flagship'],
  },
  {
    id: 4,
    image: '/assets/offline-store/image 28.jpg',
    title: 'BYREDO London Mayfair',
    tags: ['London', 'UK', 'Heritage'],
  },
  {
    id: 5,
    image: '/assets/offline-store/image 29.jpg',
    title: 'BYREDO Paris Le Marais',
    tags: ['Paris', 'France', 'Exclusive'],
  },
  {
    id: 6,
    image: '/assets/offline-store/image 27.jpg',
    title: 'BYREDO Los Angeles Beverly Hills',
    tags: ['Los Angeles', 'USA', 'Pop-up'],
  },
]

export default function OfflineStorePage() {
  const [step, setStep] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const section = sectionRef.current
    const track = trackRef.current
    if (!scrollContainer || !section || !track) return

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(0, track.scrollWidth - window.innerWidth)}`,
          pin: true,
          pinSpacing: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          scroller: scrollContainer,
          onUpdate: (self: { progress: number }) => {
            setStep(
              Math.min(stores.length, Math.floor(self.progress * stores.length))
            )
          },
        },
      })
    }, scrollContainer)

    return () => {
      ctx.revert()
    }
  }, [])

  // useLayoutEffect: React가 DOM을 제거하기 직전에 동기적으로 실행
  // pin wrapper를 React보다 먼저 정리해 removeChild 충돌 방지
  useLayoutEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
      ScrollTrigger.clearScrollMemory()
    }
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className={styles.scrollContainer}
      data-lenis-prevent
    >
      <div ref={sectionRef} className={styles.pinSection}>
        <div className={styles.stickyContainer}>
          <div className={styles.trackWrapper}>
            <div ref={trackRef} className={styles.track}>
              {stores.map((store, index) => (
                <div key={store.id} className={styles.storeCard}>
                  <a
                    href="/offline-store/detail"
                    className={styles.thumbnailButton}
                    aria-label={`${store.title} 상세 보기`}
                  >
                    <div className={styles.thumbnail}>
                      <img
                        src={store.image}
                        alt={store.title}
                        className={styles.thumbnailImg}
                      />
                    </div>
                  </a>

                  <div className={styles.cardInfo}>
                    <h2 className={styles.cardTitle}>{store.title}</h2>
                    <div className={styles.tagList}>
                      {store.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footerInfo}>
          <p className={styles.scrollText}>(SCROLL)</p>
          <p className={styles.storeNumber}>
            STORE-{String(step).padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  )
}
