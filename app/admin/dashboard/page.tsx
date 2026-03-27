import Link from 'next/link'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { getAdminDashboardData } from '@/lib/admin/data'
import styles from './dashboard.module.css'

export default async function AdminDashboardPage() {
  const { dashboardMetrics, recentOrders, lowStockProducts } = await getAdminDashboardData()

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h1 className={styles.title}>운영 현황</h1>
          <p className={styles.description}>회원, 상품, 주문, 결제 핵심 수치를 빠르게 보고 최근 주문과 품절 임박 재고를 한 화면에서 확인합니다.</p>
        </div>
        <div className={styles.heroActions}>
          <Link href="/admin/orders" className={styles.heroLink}>주문 관리</Link>
          <Link href="/admin/products" className={styles.heroLink}>상품 관리</Link>
        </div>
      </section>

      <section className={styles.metricGrid}>
        {dashboardMetrics.map((metric) => (
          <Link key={metric.label} href={metric.href} className={styles.metricCard}>
            <p className={styles.metricLabel}>{metric.label}</p>
            <p className={styles.metricValue}>{metric.value}</p>
            <p className={styles.metricMeta}>{metric.change}</p>
          </Link>
        ))}
      </section>

      <section className={styles.tableGrid}>
        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Orders</p>
              <h2 className={styles.cardTitle}>최근 주문 5개</h2>
            </div>
            <Link href="/admin/orders" className={styles.cardAction}>전체 보기</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className={styles.empty}>주문 데이터가 없습니다.</div>
          ) : (
            <div className={styles.tableWrap}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>주문번호</span>
                <span>고객</span>
                <span>상품</span>
                <span>상태</span>
                <span>금액</span>
                <span>일시</span>
              </div>
              {recentOrders.map((order) => (
                <div key={order.id} className={styles.tableRow}>
                  <span className={styles.primaryCell}>{order.orderNo}</span>
                  <span>{order.customer}</span>
                  <span>{order.product}</span>
                  <span><StatusBadge status={order.status} /></span>
                  <span>{order.amount}</span>
                  <span>{order.createdAt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardEyebrow}>Stock</p>
              <h2 className={styles.cardTitle}>품절 임박 상품 5개</h2>
            </div>
            <Link href="/admin/products" className={styles.cardAction}>상품 보기</Link>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className={styles.empty}>상품 데이터가 없습니다.</div>
          ) : (
            <div className={styles.tableWrap}>
              <div className={`${styles.tableRow} ${styles.tableHead}`}>
                <span>상품명</span>
                <span>SKU</span>
                <span>카테고리</span>
                <span>재고</span>
                <span>상태</span>
              </div>
              {lowStockProducts.map((product) => (
                <div key={product.id} className={styles.tableRowCompact}>
                  <span className={styles.primaryCell}>{product.name}</span>
                  <span>{product.sku}</span>
                  <span>{product.category}</span>
                  <span className={styles.stockCell}>{product.stock}</span>
                  <span><StatusBadge status={product.status} /></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
