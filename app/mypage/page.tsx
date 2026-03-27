import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { formatPrice } from '@/lib/shop/products'
import { getMyPageData } from '@/lib/mypage/data'
import { updateMyPageProfileAction } from './actions'
import MyPageProfileForm from './MyPageProfileForm'
import styles from './page.module.css'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return '주문 접수'
    case 'paid':
      return '결제 완료'
    case 'preparing':
      return '상품 준비중'
    case 'shipped':
      return '배송중'
    case 'delivered':
      return '배송 완료'
    case 'cancelled':
      return '주문 취소'
    case 'refunded':
      return '환불 완료'
    default:
      return status
  }
}

export default async function MyPage() {
  const { profile, orders } = await getMyPageData()

  if (!profile) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <section className={styles.guestSection}>
            <p className={styles.eyebrow}>MY PAGE</p>
            <h1 className={styles.title}>로그인 후 주문 내역과 회원 정보를 확인할 수 있습니다.</h1>
            <p className={styles.description}>상단의 로그인 또는 회원가입을 통해 계정에 접속한 뒤 다시 확인해 주세요.</p>
            <div className={styles.guestActions}>
              <Link href="/shop" className={styles.primaryAction}>쇼핑 계속하기</Link>
              <Link href="/" className={styles.secondaryAction}>홈으로 이동</Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingOrders = orders.filter((order) => ['pending', 'paid', 'preparing', 'shipped'].includes(order.status)).length

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MY PAGE</p>
            <h1 className={styles.title}>{profile.fullName || profile.email}님의 계정</h1>
            <p className={styles.description}>회원 정보와 최근 주문 내역을 한 화면에서 확인할 수 있습니다.</p>
          </div>
          <div className={styles.heroMeta}>
            <span>가입일 {formatDate(profile.createdAt)}</span>
            <span>{profile.email}</span>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <p className={styles.summaryLabel}>총 주문 수</p>
            <strong className={styles.summaryValue}>{orders.length}</strong>
            <span className={styles.summaryText}>지금까지 접수된 전체 주문</span>
          </article>
          <article className={styles.summaryCard}>
            <p className={styles.summaryLabel}>진행 중 주문</p>
            <strong className={styles.summaryValue}>{pendingOrders}</strong>
            <span className={styles.summaryText}>배송 완료 전 상태의 주문</span>
          </article>
          <article className={styles.summaryCard}>
            <p className={styles.summaryLabel}>누적 주문 금액</p>
            <strong className={styles.summaryValue}>{formatPrice(totalSpent)}</strong>
            <span className={styles.summaryText}>취소/환불 포함 전체 기준</span>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <aside className={styles.profileCard}>
            <div className={styles.cardHeader}>
              <p className={styles.cardEyebrow}>PROFILE</p>
              <h2 className={styles.cardTitle}>회원 정보 수정</h2>
            </div>
            <MyPageProfileForm profile={profile} onSave={updateMyPageProfileAction} />
          </aside>

          <section className={styles.ordersSection}>
            <div className={styles.cardHeader}>
              <p className={styles.cardEyebrow}>ORDERS</p>
              <h2 className={styles.cardTitle}>주문 내역</h2>
            </div>

            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyTitle}>아직 주문 내역이 없습니다.</p>
                <p className={styles.emptyText}>상품을 둘러보고 첫 주문을 시작해 보세요.</p>
                <Link href="/shop" className={styles.primaryAction}>상품 보러가기</Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <p className={styles.orderNumber}>{order.orderNumber}</p>
                        <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                      </div>
                      <div className={styles.orderTopMeta}>
                        <span className={styles.statusBadge}>{getStatusLabel(order.status)}</span>
                        <strong className={styles.orderAmount}>{formatPrice(order.totalAmount)}</strong>
                      </div>
                    </div>

                    <div className={styles.itemList}>
                      {order.items.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <div>
                            <p className={styles.itemName}>{item.productName}</p>
                            <p className={styles.itemMeta}>수량 {item.quantity}개 · 단가 {formatPrice(item.unitPrice)}</p>
                          </div>
                          <strong className={styles.itemTotal}>{formatPrice(item.lineTotal)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className={styles.shippingBox}>
                      <p className={styles.shippingTitle}>배송 정보</p>
                      <p className={styles.shippingText}>{order.receiverName}{order.receiverPhone ? ` · ${order.receiverPhone}` : ''}</p>
                      <p className={styles.shippingText}>{order.shippingAddress1}{order.shippingAddress2 ? ` ${order.shippingAddress2}` : ''}</p>
                      {order.shippingMessage ? <p className={styles.shippingHint}>배송 메모: {order.shippingMessage}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
      <Footer />
    </div>
  )
}
