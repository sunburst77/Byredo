'use client'

import { useState, useEffect } from 'react'
import styles from './HeroCarousel.module.css'

const leftImages = [
  '/assets/main/visual/main_1_2.jpg',
  '/assets/main/visual/main_2_2.jpg',
  '/assets/main/visual/main_3_2.jpg',
]

const rightImages = [
  '/assets/main/visual/main1_1.jpg',
  '/assets/main/visual/main_2_1.jpg',
  '/assets/main/visual/main_3_1.jpg',
]

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % leftImages.length)
    }, 3000) // 3초마다 전환

    return () => clearInterval(interval)
  }, [])

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Left Side - 아래에서 위로 슬라이드 */}
        <div className={styles.heroLeft}>
          <div className={styles.heroLeftBg} aria-hidden="true" />
          <div className={styles.heroLeftImage} aria-hidden="true">
            {leftImages.map((src, index) => {
              const isActive = index === currentIndex
              const isNext = index === (currentIndex + 1) % leftImages.length
              const isPrev = index === (currentIndex - 1 + leftImages.length) % leftImages.length

              // 왼쪽: 아래->위 슬라이드
              let transform = 'translateY(100%)' // 기본: 화면 아래에 위치
              if (isActive) {
                transform = 'translateY(0)' // 현재: 화면 중앙
              } else if (isPrev) {
                transform = 'translateY(-100%)' // 이전: 화면 위로 나감
              } else if (isNext) {
                transform = 'translateY(100%)' // 다음: 화면 아래에서 대기
              }

              return (
                <img
                  key={`left-${src}-${index}`}
                  src={src}
                  alt=""
                  className={styles.carouselImage}
                  style={{
                    position: 'absolute',
                    top: '-25.62%',
                    left: 0,
                    width: '100%',
                    height: '132.54%',
                    objectFit: 'cover',
                    transform,
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: isActive ? 2 : isNext ? 1 : 0,
                    pointerEvents: 'none',
                  }}
                />
              )
            })}
          </div>
          <div className={styles.heroLeftText}>
            <p>LA COLLECTION</p>
          </div>
        </div>

        {/* Right Side - 위에서 아래로 슬라이드 */}
        <div className={styles.heroRight}>
          <div className={styles.heroRightBg} aria-hidden="true" />
          <div className={styles.heroRightImage} aria-hidden="true">
            {rightImages.map((src, index) => {
              const isActive = index === currentIndex
              const isNext = index === (currentIndex + 1) % rightImages.length
              const isPrev = index === (currentIndex - 1 + rightImages.length) % rightImages.length

              // 오른쪽: 위->아래 슬라이드
              let transform = 'translateY(-100%)' // 기본: 화면 위에 위치
              if (isActive) {
                transform = 'translateY(0)' // 현재: 화면 중앙
              } else if (isPrev) {
                transform = 'translateY(100%)' // 이전: 화면 아래로 나감
              } else if (isNext) {
                transform = 'translateY(-100%)' // 다음: 화면 위에서 대기
              }

              return (
                <img
                  key={`right-${src}-${index}`}
                  src={src}
                  alt=""
                  className={styles.carouselImage}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform,
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: isActive ? 2 : isNext ? 1 : 0,
                    pointerEvents: 'none',
                  }}
                />
              )
            })}
          </div>
          <div className={styles.heroRightText}>
            <p>LA MASON</p>
          </div>
        </div>
      </div>
      <div className={styles.heroCenter}>
        <p className={styles.heroCenterTitle}>BYREDO</p>
        <p className={styles.heroCenterSubtitle}>PARFUMS</p>
      </div>
    </section>
  )
}
