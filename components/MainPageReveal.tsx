'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from '@/app/page.module.css'

gsap.registerPlugin(ScrollTrigger)

/** 메인 페이지 Editorial 섹션 이미지 reveal */
export function EditorialImageReveal() {
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return

    gsap.set(el, { clipPath: 'inset(100% 0 0 0)', y: 40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성
    const timer = setTimeout(() => {
      tween = gsap.to(el, {
        clipPath: 'inset(0% 0 0 0)',
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
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

  return (
    <div ref={imgRef} className={styles.editorialImage}>
      <div className={styles.editorialImageBg} aria-hidden="true" />
      <img
        src="/assets/main/journal/c85a915388e9f08f71fddde83d4a0048 1.jpg"
        alt="Editorial"
        className={styles.editorialImageImg}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  )
}

/** 메인 페이지 Journal 섹션 전체 (이미지 4개 + 텍스트 + 버튼) */
export function JournalSectionReveal() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = section.querySelectorAll<HTMLElement>('.reveal-item')
    if (items.length === 0) return

    gsap.set(items, { clipPath: 'inset(100% 0 0 0)', y: 40, opacity: 0 })

    let tween: gsap.core.Tween | null = null

    // PageTransition 완료 후 ScrollTrigger 생성
    const timer = setTimeout(() => {
      tween = gsap.to(items, {
        clipPath: 'inset(0% 0 0 0)',
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: section,
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

  return (
    <section ref={sectionRef} className={styles.journalSection}>
      <div className={`${styles.journalImage1} reveal-item`}>
        <div className={styles.journalImage1Bg} aria-hidden="true" />
        <img
          src="/assets/main/journal/06a26ecb2b36382d23d4ec52eb9e3547 1.jpg"
          alt="Journal 1"
          className={styles.journalImage1Img}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className={`${styles.journalImage2} reveal-item`}>
        <div className={styles.journalImage2Bg} aria-hidden="true" />
        <img
          src="/assets/main/journal/1ac9caeddaded3252f77b3fd0f1314b9 1.jpg"
          alt="Journal 2"
          className={styles.journalImage2Img}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className={`${styles.journalImage3} reveal-item`}>
        <div className={styles.journalImage3Bg} aria-hidden="true" />
        <img
          src="/assets/main/journal/26f5ffed3d3d6e932ab83d2e964c44ab 1.jpg"
          alt="Journal 3"
          className={styles.journalImage3Img}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className={`${styles.journalImage4} reveal-item`}>
        <div className={styles.journalImage4Bg} aria-hidden="true" />
        <img
          src="/assets/main/journal/411063cbf2810c9d225649a475245795 1.jpg"
          alt="Journal 4"
          className={styles.journalImage4Img}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className={styles.journalTitle}>
        <h2 className={styles.journalTitleText}>Journal</h2>
      </div>
      <div className={styles.journalSubtitle}>
        <p className={styles.journalSubtitleText}>LOREM IPSUM DOLOR</p>
        <p className={styles.journalSubtitleText}>SIT AMET</p>
      </div>
      <div className={styles.journalDescription}>
        <p className={styles.journalDescriptionText}>
          Lorem ipsum dolor sit amet consectetur adipiscing elit sed
        </p>
        <p className={styles.journalDescriptionText}>
          do eiusmod tempor incididunt ut labore et dolore magna
        </p>
        <p className={styles.journalDescriptionText}>
          aliqua. Ut enim ad minim veniam quis.
        </p>
      </div>
      <div className={styles.journalButton}>
        <div className={styles.journalButtonDivider} />
        <Link
          href="/journal"
          className={styles.journalButtonBtn}
          aria-label="Journal 페이지로 이동"
        >
          <span className={styles.journalButtonBtnText}>VIEW MORE</span>
        </Link>
      </div>
    </section>
  )
}
