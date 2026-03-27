'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ShopPinHeader from '@/components/ShopPinHeader'
import Footer from '@/components/Footer'
import CheckoutModal from '@/components/checkout/CheckoutModal'
import RelatedProducts from '@/components/sections/RelatedProducts'
import { formatPrice, type Product } from '@/lib/shop/products'
import styles from './page.module.css'

gsap.registerPlugin(ScrollTrigger)

const PerfumeViewer = dynamic(() => import('@/components/sections/PerfumeViewer'), {
  ssr: false,
  loading: () => <div className={styles.leftPanel} />,
})

type PinStep = {
  title: string
  description: string
}

type ProductDetailClientProps = {
  product: Product
  products: Product[]
}

const PIN_STEPS: PinStep[] = [
  {
    title: 'CHAOTIC PASSION',
    description:
      'A symphony of saffron and plum opens the composition, creating an intense and chaotic harmony. The vibrant top notes clash beautifully with the deeper undertones, setting the stage for a fragrance that refuses to be defined by convention.',
  },
  {
    title: 'DEEP RED INTENSITY',
    description:
      'The heart reveals a richness of praline and patchouli, unveiling a dark, sophisticated allure. This deep red intensity speaks of passion and mystery, wrapping the wearer in a luxurious veil that is both bold and intimately personal.',
  },
  {
    title: 'UNVEILED ESSENCE',
    description:
      'At its core lies a hidden strength of papyrus and oakmoss, grounding the initial chaos in an earthy warmth. This unveiled essence provides a sturdy foundation, balancing the wilder notes with a sense of timeless elegance.',
  },
  {
    title: 'PURE CONCENTRATION',
    description:
      'Crafted as an Extrait de Parfum, Rouge Chaotique offers a pure concentration of scent that lingers like a second soul. Its potency ensures that even a single drop leaves a lasting trail, evolving uniquely with your body\'s chemistry.',
  },
  {
    title: 'THE FINAL NOTE',
    description:
      'The journey concludes with a lasting impression of elegance and rebellion, captured within a single bottle. It is a fragrance for those who embrace their contradictions, leaving a final note that is as unforgettable as it is unpredictable.',
  },
]

function toSentenceCase(str: string) {
  const lower = str.toLowerCase().trim()
  if (!lower) return str
  const first = lower.charAt(0).toUpperCase() + lower.slice(1)
  return first.replace(/(\.\s+)(.)/g, (_, periodAndSpace, c) => periodAndSpace + c.toUpperCase())
}

export default function ProductDetailClient({ product, products }: ProductDetailClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPinReleased, setIsPinReleased] = useState(false)
  const [scrollerElement, setScrollerElement] = useState<HTMLElement | undefined>(undefined)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const pinSpacerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<number>(0)
  const isCheckoutOpen = searchParams.get('checkout') === 'true'
  const modalQuantity = Number.parseInt(searchParams.get('quantity') ?? '1', 10)
  const initialQuantity = Number.isNaN(modalQuantity) || modalQuantity < 1 ? 1 : modalQuantity

  useEffect(() => {
    if (scrollContainerRef.current) {
      setScrollerElement(scrollContainerRef.current)
    }
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    ScrollTrigger.scrollerProxy(scrollContainer, {
      scrollTop(value) {
        if (typeof value === 'number') {
          scrollContainer.scrollTop = value
        }
        return scrollContainer.scrollTop
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: scrollContainer.clientWidth,
          height: scrollContainer.clientHeight,
        }
      },
      scrollHeight() {
        return scrollContainer.scrollHeight
      },
    })

    const handleScroll = () => {
      ScrollTrigger.update()
      const spacer = pinSpacerRef.current
      if (!spacer) return
      const sectionTop = spacer.offsetTop
      const scrollableHeight = spacer.offsetHeight - scrollContainer.clientHeight
      if (scrollableHeight <= 0) return
      const rawProgress = (scrollContainer.scrollTop - sectionTop) / scrollableHeight
      const progress = Math.max(0, Math.min(1, rawProgress))
      const step = Math.min(5, Math.floor(progress * 6))
      progressRef.current = progress
      setCurrentStep(step)
      setIsPinReleased(rawProgress >= 1)
    }

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll)
      ScrollTrigger.scrollerProxy(scrollContainer, {})
    }
  }, [])

  useLayoutEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.scroller === scrollContainerRef.current) {
          trigger.kill()
        }
      })
      ScrollTrigger.clearScrollMemory()
    }
  }, [])

  const scrollToStep = (step: number) => {
    const scrollContainer = scrollContainerRef.current
    const spacer = pinSpacerRef.current
    if (!scrollContainer || !spacer) return
    const sectionTop = spacer.offsetTop
    const scrollableHeight = spacer.offsetHeight - scrollContainer.clientHeight
    if (scrollableHeight <= 0) return
    const targetY = sectionTop + ((step + 0.5) / 6) * scrollableHeight
    scrollContainer.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  const openCheckout = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('checkout', 'true')
    params.set('quantity', '1')
    params.set('product', product.slug)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const closeCheckout = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('checkout')
    params.delete('quantity')
    const nextQuery = params.toString()
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }

  return (
    <div ref={scrollContainerRef} className={styles.scrollContainer} data-lenis-prevent>
      <div className={styles.pageWrapper}>
        <div className={`${styles.headerLayer} ${currentStep === 0 || isPinReleased ? styles.headerLayerVisible : styles.headerLayerHidden}`}>
        </div>
        <div className={`${styles.headerLayer} ${currentStep > 0 && !isPinReleased ? styles.headerLayerVisible : styles.headerLayerHidden}`}>
          <ShopPinHeader onPurchase={openCheckout} />
        </div>

        <div ref={pinSpacerRef} className={styles.pinSpacer}>
          <div className={styles.stickyInner}>
            <div className={styles.layout}>
              <div className={styles.leftPanel}>
                <PerfumeViewer progressRef={progressRef} />
              </div>
              <div className={styles.rightPanel}>
                <div className={styles.infoBlock}>
                  <div className={styles.infoStack}>
                    <div className={`${styles.infoSlide} ${currentStep === 0 ? styles.infoSlideActive : ''}`} aria-hidden={currentStep !== 0}>
                      <h1 className={styles.productName}>{product.name}</h1>
                      <p className={styles.description}>{toSentenceCase(product.description)}</p>
                      <div className={styles.priceRow}>
                        <span className={styles.price}>{formatPrice(product.price, product.currency)}</span>
                        <button className={`${styles.heartBtn} ${isBookmarked ? styles.heartActive : ''}`} onClick={() => setIsBookmarked(!isBookmarked)} aria-label={isBookmarked ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={isBookmarked}>
                          <svg width="20" height="18" viewBox="0 0 20 18" fill={isBookmarked ? '#000' : 'none'} stroke="#000" strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M10 16.5C10 16.5 1.5 11 1.5 5.5C1.5 3.015 3.515 1 6 1C7.572 1 8.964 1.814 9.75 3.049C9.887 3.262 10.113 3.262 10.25 3.049C11.036 1.814 12.428 1 14 1C16.485 1 18.5 3.015 18.5 5.5C18.5 11 10 16.5 10 16.5Z" />
                          </svg>
                        </button>
                      </div>
                      <button type="button" onClick={openCheckout} className={styles.purchaseBtn}>PURCHASE</button>
                    </div>
                    {PIN_STEPS.map((step, index) => (
                      <div key={step.title} className={`${styles.infoSlide} ${currentStep === index + 1 ? styles.infoSlideActive : ''}`} aria-hidden={currentStep !== index + 1}>
                        <h2 className={styles.pinTitle}>{step.title}</h2>
                        <p className={styles.pinDescription}>{toSentenceCase(step.description)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <nav className={styles.dotNav} aria-label="Product story steps">
                  {Array.from({ length: 6 }, (_, index) => (
                    <button key={index} className={`${styles.dot} ${index === currentStep ? styles.dotActive : ''}`} onClick={() => scrollToStep(index)} aria-label={`Go to step ${index + 1}${index === currentStep ? ' current' : ''}`} aria-current={index === currentStep ? 'step' : undefined} />
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts products={products} currentProductId={product.id} scroller={scrollerElement} />
        <Footer scroller={scrollerElement} />
      </div>
      {isCheckoutOpen ? <CheckoutModal product={product} defaultQuantity={initialQuantity} onClose={closeCheckout} /> : null}
    </div>
  )
}
