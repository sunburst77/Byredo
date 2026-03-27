'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './CollectionsMarquee.module.css'

type CollectionCard = {
  id: string
  imageSrc: string
  title: string
  subtitle?: string
  href?: string
  bgWord?: string
}

const sampleCards: CollectionCard[] = [
  {
    id: '1',
    imageSrc: '/assets/main/journal/new1 1.jpg',
    title: 'Collection One',
    subtitle: 'Lorem Ipsum',
    href: '#',
    bgWord: 'LOREM IPSUM',
  },
  {
    id: '2',
    imageSrc: '/assets/main/journal/new2 1.jpg',
    title: 'Collection Two',
    subtitle: 'Dolor Sit',
    href: '#',
    bgWord: 'DOLOR SIT',
  },
  {
    id: '3',
    imageSrc: '/assets/main/journal/new3 1.jpg',
    title: 'Collection Three',
    subtitle: 'Amet Consectetur',
    href: '#',
    bgWord: 'AMET CONSECTETUR',
  },
  {
    id: '4',
    imageSrc: '/assets/main/journal/new4 1.jpg',
    title: 'Collection Four',
    subtitle: 'Adipiscing Elit',
    href: '#',
    bgWord: 'ADIPISCING ELIT',
  },
  {
    id: '5',
    imageSrc: '/assets/main/project/image1 1.jpg',
    title: 'Collection Five',
    subtitle: 'Sed Do Eiusmod',
    href: '#',
    bgWord: 'SED DO EIUSMOD',
  },
  {
    id: '6',
    imageSrc: '/assets/main/project/image2 1.jpg',
    title: 'Collection Six',
    subtitle: 'Tempor Incididunt',
    href: '#',
    bgWord: 'TEMPOR INCIDIDUNT',
  },
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

type CollectionsMarqueeProps = {
  bgWord?: string
  label?: string
  viewAllText?: string
  viewAllHref?: string
  cards?: CollectionCard[]
}

export default function CollectionsMarquee({
  bgWord = 'SHARP',
  label = 'OUR COLLECTIONS',
  viewAllText = 'VIEW ALL',
  viewAllHref = '/collections',
  cards: propCards,
}: CollectionsMarqueeProps = {}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  
  const [cards] = useState<CollectionCard[]>(propCards || sampleCards)
  const [currentBgWord, setCurrentBgWord] = useState<string>(bgWord)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [prefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // 마퀴 상태
  const stateRef = useRef({
    x: 0,
    baseSpeed: -0.6,
    currentSpeed: -0.6,
    targetSpeed: -0.6,
    lastDir: -1,
    lastInputTime: 0,
    halfWidth: 0,
  })

  useEffect(() => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const state = stateRef.current

    // halfWidth 계산
    const updateHalfWidth = () => {
      if (track.scrollWidth > 0) {
        state.halfWidth = track.scrollWidth / 2
        // x 위치 보정
        if (state.x <= -state.halfWidth) {
          state.x += state.halfWidth
        } else if (state.x >= 0) {
          state.x -= state.halfWidth
        }
      }
    }

    // 초기 halfWidth 계산
    updateHalfWidth()

    // ResizeObserver 설정
    resizeObserverRef.current = new ResizeObserver(() => {
      updateHalfWidth()
    })
    resizeObserverRef.current.observe(track)

    // RAF 루프
    const animate = (now: number) => {
      if (prefersReducedMotion) {
        rafIdRef.current = null
        return
      }

      const state = stateRef.current

      // 스크롤 입력 후 140ms 지나면 baseSpeed로 복귀
      if (now - state.lastInputTime > 140) {
        state.targetSpeed = state.lastDir * Math.abs(state.baseSpeed)
      }

      // 속도 감쇠
      state.currentSpeed = lerp(state.currentSpeed, state.targetSpeed, 0.08)

      // 위치 업데이트
      state.x += state.currentSpeed

      // 무한 루프 처리
      if (state.x <= -state.halfWidth) {
        state.x += state.halfWidth
      } else if (state.x >= 0) {
        state.x -= state.halfWidth
      }

      // transform 적용
      track.style.transform = `translate3d(${state.x}px, 0, 0)`

      rafIdRef.current = requestAnimationFrame(animate)
    }

    // 스크롤 이벤트 핸들러
    const handleWheel = (e: WheelEvent) => {
      if (prefersReducedMotion) return

      const deltaY = e.deltaY
      const dir = deltaY > 0 ? -1 : 1 // 아래로 스크롤 -> 왼쪽
      const boost = clamp(Math.abs(deltaY) * 0.08, 0, 6)
      
      const state = stateRef.current
      state.lastDir = dir
      state.targetSpeed = dir * (Math.abs(state.baseSpeed) + boost)
      state.lastInputTime = performance.now()
    }

    // 이벤트 등록
    window.addEventListener('wheel', handleWheel, { passive: true })
    
    // 애니메이션 시작
    if (!prefersReducedMotion) {
      rafIdRef.current = requestAnimationFrame(animate)
    }

    // Cleanup
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      window.removeEventListener('wheel', handleWheel)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [prefersReducedMotion, cards])

  // 호버된 카드에 따라 배경 텍스트 업데이트
  const handleCardHover = (card: CollectionCard) => {
    setIsHovered(true)
    if (card.bgWord) {
      setCurrentBgWord(card.bgWord)
    } else if (bgWord) {
      setCurrentBgWord(bgWord)
    }
  }

  const handleCardLeave = () => {
    setIsHovered(false)
  }

  // 카드 2세트 렌더링 (무한 루프)
  const cardsDuplicated = [...cards, ...cards]

  return (
    <section id="collections" className={styles.section}>
      <div className={`${styles.bgWord} ${isHovered ? styles.bgWordVisible : ''}`} aria-hidden="true">
        {currentBgWord}
      </div>

      <div className={styles.topBar}>
        <p className={styles.label}>{label}</p>
        <a className={styles.viewAll} href={viewAllHref}>
          {viewAllText} <span className={styles.arrow}>→</span>
        </a>
      </div>

      <div 
        ref={viewportRef} 
        className={`${styles.viewport} ${prefersReducedMotion ? styles.reducedMotion : ''}`}
      >
        <div ref={trackRef} className={styles.track}>
          {cardsDuplicated.map((card, index) => {
            // 원본 카드 인덱스 계산 (2세트 중 어느 것인지)
            const originalIndex = index % cards.length
            const originalCard = cards[originalIndex]
            
            return (
              <a
                key={`${card.id}-${index}`}
                className={styles.card}
                href={card.href ?? '#'}
                onMouseEnter={() => handleCardHover(originalCard)}
                onMouseLeave={handleCardLeave}
              >
                <div className={styles.media}>
                  <img src={card.imageSrc} alt={card.title} />
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
