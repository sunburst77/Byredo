'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseScrollRevealOptions {
  /** stagger 간격 (초), 기본 0.15 */
  stagger?: number
  /** 애니메이션 지속 시간 (초), 기본 0.9 */
  duration?: number
  /** ScrollTrigger start, 기본 'top 88%' */
  start?: string
}

/**
 * 대상 요소들에 "아래에서 위로 와이프 드러남" 애니메이션을 적용합니다.
 *
 * 사용법:
 *   const ref = useScrollReveal<HTMLDivElement>()
 *   <div ref={ref}>...</div>
 *
 * 또는 여러 요소를 묶을 때:
 *   const ref = useScrollReveal<HTMLUListElement>()
 *   <ul ref={ref}>
 *     <li className="reveal-item">...</li>  ← 자식에 reveal-item 클래스
 *   </ul>
 *
 * 단일 요소일 때는 ref 요소 자체에 애니메이션 적용.
 * 자식에 .reveal-item 이 있으면 그것들에 stagger 적용.
 */
export function useScrollReveal<T extends HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const { stagger = 0.15, duration = 0.9, start = 'top 88%' } = options
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const items = container.querySelectorAll<HTMLElement>('.reveal-item')
    const targets = items.length > 0 ? Array.from(items) : [container]

    // 초기 상태 설정
    gsap.set(targets, {
      clipPath: 'inset(100% 0 0 0)',
      y: 40,
      opacity: 0,
    })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성
    const timer = setTimeout(() => {
      tween = gsap.to(targets, {
        clipPath: 'inset(0% 0 0 0)',
        y: 0,
        opacity: 1,
        duration,
        ease: 'power3.out',
        stagger: targets.length > 1 ? stagger : 0,
        scrollTrigger: {
          trigger: container,
          start,
          once: true,
        },
      })
    }, 950)

    return () => {
      clearTimeout(timer)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [stagger, duration, start])

  return ref
}
