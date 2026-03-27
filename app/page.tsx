import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroCarousel from '@/components/HeroCarousel'
import ProductSection from '@/components/ProductSection'
import CollectionsMarquee from '@/components/sections/CollectionsMarquee'
import { EditorialImageReveal, JournalSectionReveal } from '@/components/MainPageReveal'
import styles from './page.module.css'

export default function MainPage() {
  return (
    <div className={styles.container} data-page-container>
      {/* Header */}
      <Header />

      {/* Hero Section — 첫 번째 비주얼, reveal 제외 */}
      <div className={styles.heroWrapper}>
        <HeroCarousel />
      </div>

      {/* Product Section */}
      <ProductSection />

      {/* Editorial Section */}
      <section className={styles.editorialSection}>
        <div className={styles.editorialContent}>
          {/* 이미지: Client Component로 reveal 적용 */}
          <EditorialImageReveal />
          <div className={styles.editorialText}>
            <div>
              <p className={styles.editorialParagraph}>
                BYREDO represents a new olfactory perspective, one that challenges conventional perfumery. Each fragrance is a memory, a moment captured in time. We believe in the power of scent to evoke emotion, to transport you to places both real and imagined. Our creations are born from the intersection of art, design, and the most precious ingredients from around the world.
              </p>
            </div>
            <div className={styles.editorialLink}>
              <Link href="/editorial" className={styles.editorialLinkText}>
                Discover More{' '}
                <span className={styles.editorialLinkArrow}>→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.largeTitleSection}>
          <div className={styles.largeTitle2Group}>
            <div className={styles.largeTitle2Wrapper}>
              <h2 className={styles.largeTitle2}>BYREDO</h2>
            </div>
            <div className={styles.largeTitle2Wrapper}>
              <h2 className={styles.largeTitle2}>CREATES</h2>
            </div>
          </div>
          <div className={styles.largeTitleContainer}>
            <div className={styles.largeTitleGroup2}>
              <div className={styles.largeTitle3Wrapper}>
                <h2 className={styles.largeTitle3}>WITH A TASTE</h2>
              </div>
              <div className={styles.largeTitle4Wrapper}>
                <h2 className={styles.largeTitle4}>OF PERFUME</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <CollectionsMarquee
        bgWord="LOREM IPSUM DOLOR LOREM IPSUM"
        label="OUR PRODUCTS"
        viewAllText="VIEW ALL"
        viewAllHref="#"
      />

      {/* Journal Section — Client Component로 이미지 reveal 적용 */}
      <JournalSectionReveal />

      {/* Footer */}
      <Footer />
    </div>
  )
}
