'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Lenis 인스턴스만 초기화/정리. 렌더링 없음.
 * layout에서 ssr: false로 로드해 서버 번들에 Lenis가 포함되지 않도록 함.
 */
// 전역으로 Lenis 인스턴스 노출 — 외부에서 stop/start 제어 가능
declare global {
  interface Window { __lenis?: Lenis }
}

export function LenisInit() {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
      autoRaf: false,
    });

    // 전역 노출
    window.__lenis = lenis

    // 스플래시 진행 중이면 초기화 즉시 정지
    if (document.getElementById('splash-root')) {
      lenis.stop()
    }

    // Lenis 권장: GSAP ticker로 RAF 동기화
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // ScrollTrigger가 Lenis 스크롤 값을 사용하도록 scrollerProxy 설정
    // Lenis 기본 content: document.documentElement
    const scroller = document.scrollingElement ?? document.documentElement
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value) {
        if (typeof value === 'number') {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      scrollHeight() {
        return document.documentElement.scrollHeight
      },
      pinType: 'transform',
    })

    // Lenis 스크롤 시 ScrollTrigger 갱신
    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      gsap.ticker.remove(raf)
      ScrollTrigger.clearScrollMemory()
      lenis.destroy()
      delete window.__lenis
    }
  }, []);

  return null;
}

/**
 * Lenis 부드러운 스크롤을 전체 앱에 적용합니다.
 * - 휠/터치 스크롤을 부드럽게 처리
 * - requestAnimationFrame으로 매 프레임 업데이트 (화면이 그려질 때마다)
 * - 언마운트 시 인스턴스 정리(destroy)
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: true,
      autoRaf: true,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
