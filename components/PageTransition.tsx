'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

type PageTransitionProps = {
  children: React.ReactNode
}

const TRANSITION_DURATION = 0.9

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const isJournalPage = pathname === '/journal'

  // pathname 변경 시 스크롤 초기화 (Lenis와 네이티브 스크롤 동기화)
  useEffect(() => {
    window.scrollTo(0, 0)
    const lenis = (window as Window & { __lenis?: { scrollTo: (t: number | string, o?: { immediate?: boolean; force?: boolean }) => void } }).__lenis
    lenis?.scrollTo(0, { immediate: true, force: true })
  }, [pathname])

  const handleAnimationStart = () => {
    if (isJournalPage) return // /journal 페이지는 애니메이션 없음
    const lenis = (window as Window & { __lenis?: { stop: () => void } }).__lenis
    lenis?.stop()
  }

  const handleAnimationComplete = () => {
    if (isJournalPage) return // /journal 페이지는 애니메이션 없음
    const lenis = (window as Window & { __lenis?: { start: () => void; resize: () => void } }).__lenis
    lenis?.start()
    // GSAP ScrollTrigger 위치 재계산 (전환 후 레이아웃 반영)
    if (typeof window !== 'undefined') {
      const ST = (window as Window & { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger
      ST?.refresh()
      // pinSpacing 등 DOM 변경 후 Lenis dimension 갱신 (offline-store 가로 슬라이드)
      lenis?.resize()
    }
  }

  // /journal 페이지는 전환 효과 없이 바로 표시
  if (isJournalPage) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          margin: 0,
          padding: 0,
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
      }}
    >
      <motion.div
        key={pathname}
        initial={{ y: '100vh' }}
        animate={{ y: 0 }}
        transition={{ duration: TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: 0,
          padding: 0,
          position: 'relative',
        }}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {children}
      </motion.div>
    </div>
  )
}
