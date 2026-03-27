'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './PinSection.module.css'

// SSR 비활성화: Three.js는 브라우저 전용
const PerfumeViewer = dynamic(() => import('./PerfumeViewer'), {
  ssr: false,
  loading: () => <div className={styles.viewerLoading} aria-hidden="true" />,
})

// ─── 단계별 텍스트 콘텐츠 ──────────────────────────────────────────────────
interface StepContent {
  title: string
  subtitle: string
  note: string
}

const STEP_CONTENT: Record<number, StepContent> = {
  0: {
    title:    'THE BEGINNING',
    subtitle: 'WHERE EVERY FRAGRANCE STORY STARTS',
    note:     'Front View',
  },
  1: {
    title:    'THE ESSENCE',
    subtitle: 'CRAFTED FROM THE WORLD\'S RAREST INGREDIENTS',
    note:     'Diagonal View',
  },
  2: {
    title:    'THE CRAFT',
    subtitle: 'PRECISION IN EVERY DETAIL',
    note:     'Side View',
  },
  3: {
    title:    'THE MEMORY',
    subtitle: 'SCENT AS A FORM OF REMEMBERING',
    note:     'Top View — Cap Open',
  },
  4: {
    title:    'THE JOURNEY',
    subtitle: 'FROM RAW INGREDIENT TO FINISHED CREATION',
    note:     'Top View — Cap Closed',
  },
  5: {
    title:    'THE CREATION',
    subtitle: 'A BYREDO FRAGRANCE',
    note:     'Front View — Reprise',
  },
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────
export default function PinSection() {
  const sectionRef  = useRef<HTMLElement>(null)
  // progressRef: 스크롤 값을 Three.js 루프에 직접 전달 (리렌더 없음)
  const progressRef = useRef<number>(0)

  const [progress,     setProgress]     = useState(0)
  const [currentStep,  setCurrentStep]  = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current
      if (!section) return

      const sectionTop      = section.getBoundingClientRect().top + window.scrollY
      const scrollableH     = section.offsetHeight - window.innerHeight
      const scrolled        = window.scrollY - sectionTop
      const nextProgress    = Math.max(0, Math.min(1, scrolled / scrollableH))
      const nextStep        = Math.min(5, Math.floor(nextProgress * 6))

      // ref는 즉시 업데이트 → Three.js useFrame에서 읽힘
      progressRef.current = nextProgress
      // state는 UI 텍스트 갱신용
      setProgress(nextProgress)
      setCurrentStep(nextStep)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const content = STEP_CONTENT[currentStep]

  return (
    <section ref={sectionRef} className={styles.pinSection} aria-label="Perfume showcase">
      <div className={styles.stickyContainer}>

        {/* ── 왼쪽: 3D 향수병 뷰어 ─────────────────── */}
        <div className={styles.viewerPane}>
          <PerfumeViewer progressRef={progressRef} />
        </div>

        {/* ── 오른쪽: 텍스트 콘텐츠 ────────────────── */}
        <div className={styles.contentPane}>

          {/* 단계 카운터 */}
          <div className={styles.stepCounter} aria-label={`Step ${currentStep} of 5`}>
            <span className={styles.stepCurrent}>0{currentStep}</span>
            <span className={styles.stepDivider}>/</span>
            <span className={styles.stepTotal}>05</span>
          </div>

          {/* 메인 텍스트 */}
          <div className={styles.textBlock}>
            <h2 key={`title-${currentStep}`} className={styles.stepTitle}>
              {content.title}
            </h2>
            <p key={`sub-${currentStep}`} className={styles.stepSubtitle}>
              {content.subtitle}
            </p>
          </div>

          {/* 뷰 노트 */}
          <p className={styles.viewNote} aria-hidden="true">
            {content.note}
          </p>

          {/* 단계 인디케이터 도트 */}
          <div className={styles.dotRow} role="tablist" aria-label="Steps">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                role="tab"
                aria-selected={i === currentStep}
                aria-label={`Step ${i}`}
                className={`${styles.dot} ${i <= currentStep ? styles.dotActive : ''}`}
              />
            ))}
          </div>
        </div>

        {/* ── 하단 진행 바 ──────────────────────────── */}
        <div className={styles.progressBar} aria-hidden="true">
          <div
            className={styles.progressFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
