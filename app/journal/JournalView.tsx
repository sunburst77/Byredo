'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './page.module.css'

interface JournalItem {
  src: string
  title: string
  subtitle: string
  x: number
  y: number
  rotation: number
}

const CANVAS_W = 2800
const CANVAS_H = 2200
const CARD_W = 260

const positions: JournalItem[] = [
  {
    src: '/assets/main/journal/c85a915388e9f08f71fddde83d4a0048 1.jpg',
    title: 'Oud Immortel',
    subtitle: 'Black Tea',
    x: 80,
    y: 120,
    rotation: -2,
  },
  {
    src: '/assets/main/journal/59aff09c965bb558b5403dfbbfcd4507 1.jpg',
    title: 'Blanche',
    subtitle: 'Eau de Parfum',
    x: 490,
    y: 52,
    rotation: 1.5,
  },
  {
    src: '/assets/main/journal/4f4b57256f2f727ac5d3906dda206b62 1.jpg',
    title: 'Gypsy Water',
    subtitle: 'Forest Notes',
    x: 1040,
    y: 185,
    rotation: -1,
  },
  {
    src: '/assets/main/journal/bc0a74cf9d913ed5932a8b5ee6e26121 1.jpg',
    title: 'Mojave Ghost',
    subtitle: 'Desert Air',
    x: 1650,
    y: 88,
    rotation: 2,
  },
  {
    src: '/assets/main/journal/new1 1.jpg',
    title: "Bal d'Afrique",
    subtitle: 'Floral',
    x: 2380,
    y: 215,
    rotation: -1.5,
  },
  {
    src: '/assets/main/journal/06a26ecb2b36382d23d4ec52eb9e3547 1.jpg',
    title: 'Parfums Heritage',
    subtitle: 'La Collection',
    x: 115,
    y: 720,
    rotation: 1,
  },
  {
    src: '/assets/main/journal/80b0fcbb7ccdc11253a8d12ed689d66b 1.jpg',
    title: 'La Tulipe',
    subtitle: 'Garden Notes',
    x: 660,
    y: 840,
    rotation: -2,
  },
  {
    src: '/assets/main/journal/938e616f08e040dda7ac16105fdffd11 1.jpg',
    title: 'Sellier',
    subtitle: 'Equestrian',
    x: 1250,
    y: 700,
    rotation: 1.5,
  },
  {
    src: '/assets/main/journal/99d2de151233233e825c0b711e20596b 1.jpg',
    title: 'Bibliothèque',
    subtitle: 'Library',
    x: 1850,
    y: 780,
    rotation: -1,
  },
  {
    src: '/assets/main/journal/new4 1.jpg',
    title: 'Vetyver',
    subtitle: 'Wood & Earth',
    x: 2480,
    y: 645,
    rotation: 2,
  },
  {
    src: '/assets/main/journal/26f5ffed3d3d6e932ab83d2e964c44ab 1.jpg',
    title: 'Rose Nouée',
    subtitle: 'Floral Rose',
    x: 300,
    y: 1460,
    rotation: -1.5,
  },
  {
    src: '/assets/main/journal/1ac9caeddaded3252f77b3fd0f1314b9 1.jpg',
    title: 'Sunday Cologne',
    subtitle: 'Fresh',
    x: 1080,
    y: 1570,
    rotation: 1,
  },
]

export default function JournalView() {
  const pathname = usePathname()
  const canvasRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const headerRef = useRef<HTMLElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const currentPos = useRef({ x: 0, y: 0 })
  const targetPos = useRef({ x: 0, y: 0 })
  // 스프레드 애니메이션이 끝나기 전까지 캔버스 이동 차단
  const spreadDone = useRef(false)
  const [hoveredItem, setHoveredItem] = useState<JournalItem | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const animationStartedRef = useRef(false)

  useEffect(() => {
    // /journal 페이지가 아니거나 이미 애니메이션이 시작된 경우 무시
    if (pathname !== '/journal' || animationStartedRef.current) return

    let rafId = 0

    // 디버깅: 카드들이 렌더링되었는지 확인
    console.log('JournalView: 카드 개수:', cardRefs.current.length)
    console.log('JournalView: 캔버스 ref:', canvasRef.current)
    console.log('JournalView: 첫 번째 카드 위치:', positions[0]?.x, positions[0]?.y)

    // GSAP 즉시 로드하여 카드들이 보이도록 함
    void import('gsap').then(({ default: gsap }) => {
      console.log('JournalView: GSAP 로드 완료')
      
      const ctx = gsap.context(() => {
        // 각 카드에 최종 위치 정보를 data attribute로 저장 및 초기 상태 설정
        cardRefs.current.forEach((el, i) => {
          if (!el) {
            console.warn(`JournalView: 카드 ${i}가 없습니다`)
            return
          }
          const item = positions[i]
          // 캔버스 중앙으로 이동하는 오프셋 (gather phase에서 사용)
          el.dataset.offsetX = String(CANVAS_W / 2 - item.x - CARD_W / 2)
          el.dataset.offsetY = String(CANVAS_H / 2 - item.y - CARD_W / 2)
          el.dataset.finalRotation = String(item.rotation)
          
          // 초기에 카드들을 뷰포트 중앙 근처에 보이도록 설정
          // 각 카드를 캔버스 중앙으로 이동시켜서 보이게 함
          const offsetX = CANVAS_W / 2 - item.x - CARD_W / 2
          const offsetY = CANVAS_H / 2 - item.y - CARD_W / 2
          
          // 인라인 스타일로 이미 중앙에 위치하므로 GSAP으로 동일한 위치 유지
          // 랜덤 회전만 추가
          const randomRotation = (Math.random() - 0.5) * 90
          gsap.set(el, {
            x: offsetX, // 초기에 중앙으로 이동 (인라인 스타일과 동일)
            y: offsetY,
            scale: 0.22, // gather phase와 동일한 크기 (인라인 스타일과 동일)
            rotation: randomRotation, // 랜덤 회전
            opacity: 1,
            visibility: 'visible',
          })
        })

        // 헤더/센터/바텀 텍스트 초기 상태 설정 (애니메이션 전)
        // centerText는 CSS transform을 유지해야 하므로 GSAP transform 사용 안 함
        if (headerRef.current) {
          gsap.set(headerRef.current, {
            opacity: 0,
            y: 20,
          })
        }
        if (centerRef.current) {
          // centerText는 CSS transform을 건드리지 않고 opacity만 설정
          gsap.set(centerRef.current, {
            opacity: 0,
            // transform은 건드리지 않음 (CSS의 translate(-50%, -50%) 유지)
          })
        }
        if (bottomRef.current) {
          gsap.set(bottomRef.current, {
            opacity: 0,
            y: 20,
          })
        }

        const validCards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
        console.log('JournalView: 유효한 카드 개수:', validCards.length)

        // ── Phase 1: 각자 위치 → 중앙으로 순식간에 모임 ──────────────
        // ── Phase 2: 중앙에서 사방으로 뿌려짐 ───────────────────────
        // /journal 페이지는 PageTransition이 없으므로 즉시 시작
        const tl = gsap.timeline({
          delay: 0.1, // 짧은 delay로 즉시 시작
          onStart: () => {
            console.log('JournalView: 애니메이션 시작')
          },
          onComplete: () => { 
            console.log('JournalView: 애니메이션 완료')
            spreadDone.current = true
            animationStartedRef.current = true
          },
        })

          // Phase 1: 이미 중앙에 모여있으므로 중앙에 머무는 시간 추가
          // 중앙에 모여있는 상태를 유지 (0.8초 대기)
          tl.to(validCards, {
            x: (_i: number, el: HTMLElement) => parseFloat(el.dataset.offsetX ?? '0'),
            y: (_i: number, el: HTMLElement) => parseFloat(el.dataset.offsetY ?? '0'),
            scale: 0.22,
            rotation: () => (Math.random() - 0.5) * 90,
            duration: 0, // 즉시 중앙 위치 유지 (이미 중앙에 있음)
            stagger: 0,
          })
          
          // 중앙에 모여있는 시간 (0.8초 대기)
          tl.to({}, { duration: 0.8 })
          
          // Phase 2: 중앙에서 사방으로 뿌려짐
          tl.to(validCards, {
            x: 0,
            y: 0,
            scale: 1,
            rotation: (_i: number, el: HTMLElement) =>
              parseFloat(el.dataset.finalRotation ?? '0'),
            duration: 1.05,
            stagger: 0,
            ease: 'expo.out',    // 순간 폭발 → 부드럽게 안착
          })

        // 헤더/바텀은 일반적으로 애니메이션
        if (headerRef.current && bottomRef.current) {
          gsap.to([headerRef.current, bottomRef.current], {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.9, // 중앙 대기(0.8초) + 여유시간(0.1초)
            ease: 'power2.out',
          })
        }
        // centerText는 CSS transform을 유지하면서 opacity만 애니메이션
        if (centerRef.current) {
          gsap.to(centerRef.current, {
            opacity: 1,
            // transform은 건드리지 않음 (CSS의 translate(-50%, -50%) 유지)
            duration: 0.6,
            delay: 0.9, // 중앙 대기(0.8초) + 여유시간(0.1초)
            ease: 'power2.out',
          })
        }

        const handleMouseMove = (e: MouseEvent) => {
          const vw = window.innerWidth
          const vh = window.innerHeight
          const nx = e.clientX / vw
          const ny = e.clientY / vh
          targetPos.current.x = (0.5 - nx) * (CANVAS_W - vw)
          targetPos.current.y = (0.5 - ny) * (CANVAS_H - vh)
        }

        const animateCanvas = () => {
          // 스프레드 애니메이션 중에는 캔버스를 중앙에 고정
          if (spreadDone.current) {
            const LERP = 0.06
            currentPos.current.x += (targetPos.current.x - currentPos.current.x) * LERP
            currentPos.current.y += (targetPos.current.y - currentPos.current.y) * LERP

            if (canvasRef.current) {
              canvasRef.current.style.transform = `translate(calc(-50% + ${currentPos.current.x}px), calc(-50% + ${currentPos.current.y}px))`
            }
          }

          rafId = requestAnimationFrame(animateCanvas)
        }

        window.addEventListener('mousemove', handleMouseMove)
        rafId = requestAnimationFrame(animateCanvas)

        cleanupRef.current = () => {
          ctx.revert()
          window.removeEventListener('mousemove', handleMouseMove)
          cancelAnimationFrame(rafId)
        }
      })
    })

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      animationStartedRef.current = false
      spreadDone.current = false
    }
  }, [pathname])

  return (
    <div className={styles.wrapper}>
      <header ref={headerRef} className={styles.header}>
        <Link href="/" className={styles.headerBack}>
          ← Back
        </Link>
        <span className={styles.headerCenter}>Collection</span>
        <span className={styles.headerRight}>12 Items</span>
      </header>

      <div ref={centerRef} className={styles.centerText}>
        <p
          className={styles.centerTitle}
          style={{ opacity: hoveredItem ? 1 : 0.35 }}
        >
          {hoveredItem ? hoveredItem.title : 'Explore'}
        </p>
        {!hoveredItem && (
          <p className={styles.centerHint}>Hover to discover</p>
        )}
        <p
          className={styles.centerSubtitle}
          aria-live="polite"
        >
          {hoveredItem ? hoveredItem.subtitle : ''}
        </p>
      </div>

      <div ref={bottomRef} className={styles.bottomHint}>
        <span>Move to explore</span>
      </div>

      <div ref={canvasRef} className={styles.canvas} aria-label="Journal collection canvas">
        {positions.map((item, i) => {
          // 초기에 카드들을 중앙에 보이도록 offset 계산
          const offsetX = CANVAS_W / 2 - item.x - CARD_W / 2
          const offsetY = CANVAS_H / 2 - item.y - CARD_W / 2
          
          return (
            <div
              key={item.title}
              ref={(el) => { cardRefs.current[i] = el }}
              className={styles.cardWrapper}
              style={{ 
                left: item.x, 
                top: item.y,
                // 초기에 중앙에 보이도록 transform 적용 (GSAP 로드 전에도 보임)
                transform: `translate(${offsetX}px, ${offsetY}px) scale(0.22)`,
                opacity: 1,
                visibility: 'visible',
              }}
            >
            <div
              className={styles.card}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              role="img"
              aria-label={`${item.title} — ${item.subtitle}`}
            >
              <div className={styles.cardInner}>
                <img
                  src={item.src}
                  alt={item.title}
                  className={styles.cardImage}
                  draggable={false}
                />
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
