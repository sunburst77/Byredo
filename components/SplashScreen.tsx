'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const LOGO_PATH =
  'M0 0H79.7643V394.157L0 472.988V0ZM159.529 394.157C204.222 394.157 240.087 358.682 240.087 315.325C240.087 271.975 204.186 236.5 159.529 236.5V157.663C181.857 157.663 199.411 140.315 199.411 118.28C199.411 96.2082 181.863 78.8609 159.529 78.8609V0C225.72 0 279.199 52.7986 279.199 118.25C279.199 145.04 270.413 169.47 255.283 189.176C293.571 217.574 319.087 264.076 319.087 315.296C319.087 402.032 248.115 472.959 159.559 472.959V394.157H159.529ZM359.095 157.663V0H438.859V157.633H518.623L438.859 236.494L359.095 157.663ZM518.594 236.5L598.358 157.669V0H678.122V157.633L598.358 236.465V394.127L518.594 472.959V236.5ZM758.072 0H837.836V394.157L758.072 472.988V0ZM917.564 236.5C961.463 236.5 997.329 201.013 997.329 157.663C997.329 114.312 961.434 78.8314 917.564 78.8314V0C1005.33 0 1077.09 70.9323 1077.09 157.633C1077.09 244.37 1005.33 315.296 917.564 315.296V236.5ZM997.359 315.325L1077.12 394.157V472.988H997.359V315.325ZM1157.03 0H1236.79V394.157L1157.03 472.988V0ZM1316.53 0H1476.06V78.8314H1316.53V0ZM1316.53 157.663H1476.06V236.5H1316.53V157.663ZM1316.53 394.163H1476.06V472.988H1316.53V394.163ZM1556.01 0H1635.77V394.157L1556.01 472.988V0ZM1715.51 394.157C1759.4 394.157 1795.27 358.682 1795.27 315.325V157.663C1795.27 114.312 1759.37 78.8314 1715.51 78.8314V0C1804.06 0 1875.03 70.9323 1875.03 157.633V315.296C1875.03 402.032 1804.06 472.959 1715.51 472.959V394.157ZM1954.94 157.675C1954.94 70.9736 2026.71 0.0413875 2114.44 0.0413875C2203 0.0413875 2273.97 70.9736 2273.97 157.669L2194.21 236.506V157.675C2194.23 147.3 2192.18 137.024 2188.18 127.437C2184.18 117.85 2178.3 109.142 2170.88 101.815C2163.47 94.4878 2154.67 88.6858 2144.98 84.7433C2135.29 80.8008 2124.91 78.7956 2114.44 78.8432C2070.58 78.8432 2034.68 114.318 2034.68 157.675L1954.91 236.5V157.675H1954.94ZM1954.94 315.337L2034.71 236.506V315.337C2034.71 358.688 2070.61 394.169 2114.47 394.169C2124.94 394.219 2135.32 392.215 2145.01 388.273C2154.7 384.332 2163.51 378.53 2170.92 371.202C2178.33 363.874 2184.21 355.166 2188.21 345.578C2192.21 335.99 2194.26 325.712 2194.24 315.337L2274 236.506V315.337C2274 402.074 2203.03 473 2114.47 473C2026.74 473 1954.94 402.068 1954.94 315.337Z'

function runSplash() {
  const DRAW_DURATION = 3000
  const FILL_DURATION = 1500
  const svgNS = 'http://www.w3.org/2000/svg'

  document.documentElement.classList.add('splash-active')

  const root = document.createElement('div')
  root.id = 'splash-root'
  root.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:9999',
    'pointer-events:all',
    'user-select:none',
  ].join(';')

  const panel = document.createElement('div')
  panel.style.cssText = [
    'position:absolute',
    'inset:0',
    'background:#000',
    'display:flex',
    'align-items:center',
    'justify-content:center',
  ].join(';')

  const svg = document.createElementNS(svgNS, 'svg')
  svg.setAttribute('viewBox', '0 0 2274 473')
  svg.setAttribute('aria-label', 'BYREDO')
  svg.setAttribute('role', 'img')
  svg.style.cssText = 'width:250px;height:auto;display:block;overflow:visible'

  const path = document.createElementNS(svgNS, 'path')
  path.setAttribute('d', LOGO_PATH)
  svg.appendChild(path)
  panel.appendChild(svg)
  root.appendChild(panel)
  document.body.appendChild(root)

  document.getElementById('splash-overlay-initial')?.remove()

  const length = path.getTotalLength()
  path.style.strokeDasharray = `${length}`
  path.style.strokeDashoffset = `${length}`
  path.style.stroke = '#fff'
  path.style.strokeWidth = '8'
  path.style.fill = '#fff'
  path.style.fillOpacity = '0'
  path.style.strokeOpacity = '1'


  let rafId: number
  let startTime: number | null = null

  const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  const tick = (now: number) => {
    if (startTime === null) startTime = now
    const elapsed = now - startTime

    if (elapsed < DRAW_DURATION) {
      path.style.strokeDashoffset = String(length * (1 - easeInOut(elapsed / DRAW_DURATION)))
      rafId = requestAnimationFrame(tick)
    } else {
      const t = Math.min((elapsed - DRAW_DURATION) / FILL_DURATION, 1)
      const e = easeInOut(t)
      path.style.strokeDashoffset = '0'
      path.style.fillOpacity = String(e)
      path.style.strokeOpacity = String(1 - e)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
  }

  rafId = requestAnimationFrame(tick)

  const safeRemove = (el: HTMLElement) => {
    try { el.remove() } catch (_) { /* 이미 제거된 경우 무시 */ }
  }

  setTimeout(() => {
    // 아래에서 위로 올라가며 사라지는 애니메이션
    panel.style.transition = 'transform 0.8s cubic-bezier(0.76,0,0.24,1)'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.style.transform = 'translateY(-100%)'
      })
    })
  }, 4500)

  // wipe-out 0.8s + 여유 0.2s
  setTimeout(() => {
    cancelAnimationFrame(rafId)
    document.documentElement.classList.remove('splash-active')
    try { sessionStorage.setItem('splash_gate_done', '1') } catch (_) {}
    safeRemove(root)
  }, 5500)
}

// 모듈 로드(페이지 새로고침) 시 초기화 — SPA 이동 시에는 유지
let splashPlayed = false

export default function SplashScreen() {
  const pathname = usePathname()
  const initialPathnameRef = useRef<string | null>(null)
  if (initialPathnameRef.current === null) initialPathnameRef.current = pathname

  useEffect(() => {
    // 메인 페이지가 아니면 초기 오버레이 제거 후 스킵 (다른 페이지에서 /로 네비게이션한 경우)
    if (pathname !== '/') {
      document.getElementById('splash-overlay-initial')?.remove()
      return
    }
    // 다른 페이지에서 메인으로 클라이언트 네비게이션한 경우 스킵 (최초 진입이 /일 때만 스플래시)
    if (initialPathnameRef.current !== '/') {
      document.getElementById('splash-overlay-initial')?.remove()
      return
    }
    // 이미 실행 중이면 스킵
    if (document.getElementById('splash-root')) return
    // 이번 페이지 로드에서 이미 재생했으면 스킵
    if (splashPlayed) return

    splashPlayed = true

    // Lenis 즉시 정지 (이미 초기화된 경우)
    window.__lenis?.stop()

    // Lenis가 아직 초기화 안 됐을 경우 대비해 폴링으로 대기 후 stop
    const lenisStopInterval = setInterval(() => {
      if (window.__lenis) {
        window.__lenis.stop()
        clearInterval(lenisStopInterval)
      }
    }, 50)

    // 키보드 스크롤 차단
    const SCROLL_KEYS = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', ' ',
    ])
    const preventKeyScroll = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
    }
    window.addEventListener('keydown', preventKeyScroll)

    runSplash()

    const cleanup = () => {
      clearInterval(lenisStopInterval)
      window.__lenis?.start()
      window.removeEventListener('keydown', preventKeyScroll)
    }

    // 스플래시 완료 시점에 맞춰 복원
    const cleanupTimer = setTimeout(cleanup, 5500)

    return () => {
      clearTimeout(cleanupTimer)
      cleanup()
    }
  }, [pathname])

  return null
}
