'use client'

import { useEffect, useState, useCallback } from 'react'

const HOVER_SELECTORS = 'a, button, [role="button"], [data-cursor-hover]'

function isInteractiveElement(el: Element | null): boolean {
  if (!el) return false
  return el.matches(HOVER_SELECTORS) || !!el.closest(HOVER_SELECTORS)
}

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY })
    if (!isVisible) setIsVisible(true)

    const target = document.elementFromPoint(e.clientX, e.clientY)
    setIsHovering(isInteractiveElement(target))
  }, [isVisible])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    document.body.addEventListener('mouseleave', handleMouseLeave)
    document.body.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.body.removeEventListener('mouseleave', handleMouseLeave)
      document.body.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [handleMouseMove, handleMouseLeave, handleMouseEnter])

  return (
    <div
      className="custom-cursor-dot"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: isHovering ? '#e00' : '#666',
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%) scale(${isHovering ? 2 : 1})`,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: 'transform 0.15s ease-out, background-color 0.2s ease-out, opacity 0.15s ease-out',
      }}
      aria-hidden
    />
  )
}
