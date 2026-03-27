'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Footer.module.css'

gsap.registerPlugin(ScrollTrigger)

type FooterProps = {
  scroller?: HTMLElement | Window
}

export default function Footer({ scroller }: FooterProps) {
  const logoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = logoRef.current
    if (!el) return

    gsap.set(el, { clipPath: 'inset(0 0 100% 0)', y: -40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성 — shop 페이지에서도 정상 동작 보장
    const timer = setTimeout(() => {
      tween = gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)',
        y: 0,
        opacity: 1,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          invalidateOnRefresh: true,
          ...(scroller && { scroller }),
        },
      })
    }, 950)

    return () => {
      clearTimeout(timer)
      tween?.scrollTrigger?.kill()
      tween?.kill()
    }
  }, [scroller])

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLogo}>
        <img
          ref={logoRef}
          src="/assets/main/etc/logo.svg"
          alt="BYREDO"
          className={styles.footerLogoImg}
        />
      </div>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <p className={styles.footerText}>Joey Jast</p>
          <p className={styles.footerText}>Crystal_Daniel@hotmail.com</p>
          <p className={styles.footerText}>80916</p>
        </div>
        <div className={styles.footerRight}>
          <p className={styles.footerText} style={{ marginLeft: '13px' }}>
            BYREDO All Right Reserved
          </p>
          <p className={styles.footerText}>Crystal_Daniel@hotmail.com</p>
          <p className={styles.footerText} style={{ marginLeft: '132px' }}>
            80916
          </p>
        </div>
      </div>
    </footer>
  )
}
