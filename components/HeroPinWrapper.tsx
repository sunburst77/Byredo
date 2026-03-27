'use client'

import { useEffect, useRef } from 'react'
import HeroCarousel from '@/components/HeroCarousel'

/**
 * GSAP ScrollTrigger pin을 사용해 hero를 고정.
 * Lenis smooth scroll 환경에서 position:sticky가 동작하지 않는 문제를 우회.
 */
export default function HeroPinWrapper() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx: { revert: () => void } | null = null

    const init = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      if (!wrapperRef.current) return

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapperRef.current,
          start: 'top top',
          end: `+=${wrapperRef.current!.offsetHeight}`,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        })
      })
    }

    init()

    return () => {
      ctx?.revert()
    }
  }, [])

  return (
    <div ref={wrapperRef}>
      <HeroCarousel />
    </div>
  )
}
