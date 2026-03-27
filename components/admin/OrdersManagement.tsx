'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminOrderRow, AdminOrderStatus, AdminPaymentRow, AdminPaymentStatus } from '@/lib/admin/data'
import styles from './OrdersManagement.module.css'

type OrdersManagementProps = {
  initialOrders: AdminOrderRow[]
  initialPayments: AdminPaymentRow[]
  initialQuery?: string
  onUpdateOrderStatusAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
  onUpdatePaymentStatusAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
}

const ORDER_STATUS_OPTIONS: AdminOrderStatus[] = ['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAYMENT_STATUS_OPTIONS: AdminPaymentStatus[] = ['pending', 'paid', 'failed', 'cancelled', 'refunded']

function formatNow() {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function OrdersManagement({
  initialOrders,
  initialPayments,
  initialQuery = '',
  onUpdateOrderStatusAction,
  onUpdatePaymentStatusAction,
}: OrdersManagementProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)
  const [payments, setPayments] = useState(initialPayments)
  const [query, setQuery] = useState(initialQuery)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<AdminOrderStatus>('pending')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<AdminPaymentStatus>('pending')
  const [orderMessage, setOrderMessage] = useState('')
  const [paymentMessage, setPaymentMessage] = useState('')
  const [orderError, setOrderError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [isOrderPending, startOrderTransition] = useTransition()
  const [isPaymentPending, startPaymentTransition] = useTransition()

  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredOrders = useMemo(() => {
    if (!normalizedQuery) {
      return orders
    }

    return orders.filter((order) =>
      [order.orderNo, order.customer, order.paymentKey, order.paymentProvider].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [normalizedQuery, orders])
  const filteredPayments = useMemo(() => {
    if (!normalizedQuery) {
      return payments
    }

    return payments.filter((payment) =>
      [payment.paymentKey, payment.orderNo, payment.customer, payment.provider, payment.method].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [normalizedQuery, payments])

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId])
  const selectedPayment = useMemo(() => payments.find((payment) => payment.id === selectedPaymentId) ?? null, [payments, selectedPaymentId])

  useEffect(() => {
    if (selectedOrder) {
      setSelectedOrderStatus(selectedOrder.orderStatus)
      setOrderMessage('')
      setOrderError('')
    }
  }, [selectedOrder])

  useEffect(() => {
    if (selectedPayment) {
      setSelectedPaymentStatus(selectedPayment.paymentStatus)
      setPaymentMessage('')
      setPaymentError('')
    }
  }, [selectedPayment])

  const pendingCount = filteredOrders.filter((order) => order.orderStatus === 'pending').length
  const inProgressCount = filteredOrders.filter((order) => ['paid', 'preparing', 'shipped'].includes(order.orderStatus)).length
  const doneCount = filteredOrders.filter((order) => order.orderStatus === 'delivered').length
  const issueCount = filteredOrders.filter((order) => ['cancelled', 'refunded'].includes(order.orderStatus)).length
  const paidCount = filteredPayments.filter((payment) => payment.paymentStatus === 'paid').length

  function handleUpdateOrderStatus() {
    if (!selectedOrder) {
      return
    }

    setOrderMessage('')
    setOrderError('')

    const formData = new FormData()
    formData.set('orderId', selectedOrder.id)
    formData.set('status', selectedOrderStatus)

    startOrderTransition(async () => {
      try {
        const result = await onUpdateOrderStatusAction(formData)
        setOrders((current) =>
          current.map((order) =>
            order.id === selectedOrder.id
              ? {
                  ...order,
                  orderStatus: selectedOrderStatus,
                }
              : order
          )
        )
        setPayments((current) =>
          current.map((payment) =>
            payment.orderId === selectedOrder.id
              ? {
                  ...payment,
                  orderStatus: selectedOrderStatus,
                }
              : payment
          )
        )
        setOrderMessage(result.message)
        router.refresh()
      } catch (actionError) {
        setOrderError(actionError instanceof Error ? actionError.message : '주문 상태 변경 중 오류가 발생했습니다.')
      }
    })
  }

  function handleUpdatePaymentStatus() {
    if (!selectedPayment) {
      return
    }

    setPaymentMessage('')
    setPaymentError('')

    const formData = new FormData()
    formData.set('paymentId', selectedPayment.id)
    formData.set('status', selectedPaymentStatus)

    startPaymentTransition(async () => {
      try {
        const result = await onUpdatePaymentStatusAction(formData)
        setPayments((current) =>
          current.map((payment) =>
            payment.id === selectedPayment.id
              ? {
                  ...payment,
                  paymentStatus: selectedPaymentStatus,
                  approvedAt: selectedPaymentStatus === 'paid' ? formatNow() : payment.approvedAt,
                }
              : payment
          )
        )
        setOrders((current) =>
          current.map((order) =>
            order.id === selectedPayment.orderId
              ? {
                  ...order,
                  paymentStatus: selectedPaymentStatus,
                }
              : order
          )
        )
        setPaymentMessage(result.message)
        router.refresh()
      } catch (actionError) {
        setPaymentError(actionError instanceof Error ? actionError.message : '결제 상태 변경 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Orders & Payments</p>
          <h1 className={styles.title}>주문/결제관리</h1>
          <p className={styles.description}>
            주문과 결제를 분리하지 않고 같은 흐름에서 관리합니다. 주문 목록과 결제 목록을 함께 보고 상세 모달에서 상태를 수동 보정할 수 있습니다.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>주문 {filteredOrders.length}건</span>
          <span className={styles.metaChip}>결제 {filteredPayments.length}건</span>
          <span className={styles.metaChip}>승인 {paidCount}건</span>
        </div>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pending</p>
          <p className={styles.metricValue}>{pendingCount}</p>
          <p className={styles.metricMeta}>입금 또는 접수 대기</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Processing</p>
          <p className={styles.metricValue}>{inProgressCount}</p>
          <p className={styles.metricMeta}>결제완료 이후 진행 중</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Delivered</p>
          <p className={styles.metricValue}>{doneCount}</p>
          <p className={styles.metricMeta}>배송 완료 주문</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Issue</p>
          <p className={styles.metricValue}>{issueCount}</p>
          <p className={styles.metricMeta}>취소, 환불, 실패 처리</p>
        </article>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Orders</p>
            <h2 className={styles.sectionTitle}>주문 목록</h2>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <div className={`${styles.tableRow} ${styles.tableHead}`}>
            <span>주문번호</span>
            <span>회원명</span>
            <span>주문금액</span>
            <span>주문상태</span>
            <span>결제상태</span>
            <span>주문일</span>
            <span>상세</span>
          </div>
          {filteredOrders.length === 0 ? (
            <div className={styles.empty}>검색 결과가 없습니다.</div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <div>
                  <p className={styles.primaryCell}>{order.orderNo}</p>
                  <p className={styles.secondaryCell}>{order.itemsSummary}</p>
                </div>
                <span>{order.customer}</span>
                <span className={styles.primaryCell}>{order.amount}</span>
                <span><StatusBadge status={order.orderStatus} /></span>
                <span><StatusBadge status={order.paymentStatus} /></span>
                <span>{order.orderedAt}</span>
                <span>
                  <button type="button" className={styles.secondaryButton} onClick={() => setSelectedOrderId(order.id)}>
                    상세 보기
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Payments</p>
            <h2 className={styles.sectionTitle}>결제 목록</h2>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <div className={`${styles.paymentRow} ${styles.tableHead}`}>
            <span>결제키</span>
            <span>주문번호</span>
            <span>회원명</span>
            <span>provider</span>
            <span>승인시간</span>
            <span>주문상태</span>
            <span>결제상태</span>
            <span>상세</span>
          </div>
          {filteredPayments.length === 0 ? (
            <div className={styles.empty}>검색 결과가 없습니다.</div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className={styles.paymentRow}>
                <div>
                  <p className={styles.primaryCell}>{payment.paymentKey}</p>
                  <p className={styles.secondaryCell}>{payment.amount}</p>
                </div>
                <span>{payment.orderNo}</span>
                <span>{payment.customer}</span>
                <span><StatusBadge status={payment.provider} /></span>
                <span>{payment.approvedAt}</span>
                <span><StatusBadge status={payment.orderStatus} /></span>
                <span><StatusBadge status={payment.paymentStatus} /></span>
                <span>
                  <button type="button" className={styles.secondaryButton} onClick={() => setSelectedPaymentId(payment.id)}>
                    상세 보기
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.logCard}>
        <div>
          <p className={styles.eyebrow}>Status Log Proposal</p>
          <h2 className={styles.sectionTitle}>상태 변경 이력 로그 구조 제안</h2>
        </div>
        <div className={styles.logGrid}>
          <div className={styles.logBox}>
            <p className={styles.primaryCell}>권장 테이블</p>
            <p className={styles.secondaryCell}>`admin_status_logs` 단일 테이블로 주문/결제 상태 변경을 함께 관리</p>
          </div>
          <div className={styles.logBox}>
            <p className={styles.primaryCell}>핵심 컬럼</p>
            <p className={styles.secondaryCell}>entity_type, entity_id, from_status, to_status, changed_by, reason, snapshot, created_at</p>
          </div>
          <div className={styles.logBox}>
            <p className={styles.primaryCell}>운영 포인트</p>
            <p className={styles.secondaryCell}>상태 변경 액션 직후 insert 하고, 주문 상세와 결제 상세 모두 같은 로그 스트림을 공유하는 구조가 가장 단순합니다.</p>
          </div>
        </div>
      </section>

      {selectedOrder ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Order Detail</p>
                <h2 className={styles.sectionTitle}>{selectedOrder.orderNo}</h2>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={() => setSelectedOrderId(null)}>
                닫기
              </button>
            </div>

            <div className={styles.detailGrid}>
              <article className={styles.detailPanel}>
                <p className={styles.fieldLabel}>주문 정보</p>
                <div className={styles.detailList}>
                  <div><strong>회원명</strong><span>{selectedOrder.customer}</span></div>
                  <div><strong>주문일</strong><span>{selectedOrder.orderedAt}</span></div>
                  <div><strong>결제 provider</strong><span>{selectedOrder.paymentProvider}</span></div>
                  <div><strong>결제키</strong><span>{selectedOrder.paymentKey}</span></div>
                  <div><strong>주문금액</strong><span>{selectedOrder.amount}</span></div>
                </div>
              </article>

              <article className={styles.detailPanel}>
                <p className={styles.fieldLabel}>주문 상태 변경</p>
                <div className={styles.statusEditor}>
                  <div className={styles.statusPair}>
                    <span>현재 주문상태</span>
                    <StatusBadge status={selectedOrder.orderStatus} />
                  </div>
                  <div className={styles.statusPair}>
                    <span>현재 결제상태</span>
                    <StatusBadge status={selectedOrder.paymentStatus} />
                  </div>
                  <select className={styles.select} value={selectedOrderStatus} onChange={(event) => setSelectedOrderStatus(event.target.value as AdminOrderStatus)}>
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button type="button" className={styles.primaryButton} onClick={handleUpdateOrderStatus} disabled={isOrderPending}>
                    {isOrderPending ? '저장 중...' : '주문상태 저장'}
                  </button>
                </div>
              </article>
            </div>

            <div className={styles.itemsTable}>
              <div className={`${styles.itemRow} ${styles.itemHead}`}>
                <span>상품명</span>
                <span>SKU</span>
                <span>단가</span>
                <span>수량</span>
                <span>합계</span>
              </div>
              {selectedOrder.orderItems.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <span className={styles.primaryCell}>{item.productName}</span>
                  <span>{item.productSku}</span>
                  <span>{item.unitPrice}</span>
                  <span>{item.quantity}</span>
                  <span>{item.lineTotal}</span>
                </div>
              ))}
            </div>

            {orderMessage ? <p className={styles.successText}>{orderMessage}</p> : null}
            {orderError ? <p className={styles.errorText}>{orderError}</p> : null}
          </div>
        </div>
      ) : null}

      {selectedPayment ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>Payment Detail</p>
                <h2 className={styles.sectionTitle}>{selectedPayment.paymentKey}</h2>
              </div>
              <button type="button" className={styles.secondaryButton} onClick={() => setSelectedPaymentId(null)}>
                닫기
              </button>
            </div>

            <div className={styles.detailGrid}>
              <article className={styles.detailPanel}>
                <p className={styles.fieldLabel}>결제 정보</p>
                <div className={styles.detailList}>
                  <div><strong>주문번호</strong><span>{selectedPayment.orderNo}</span></div>
                  <div><strong>회원명</strong><span>{selectedPayment.customer}</span></div>
                  <div><strong>결제 provider</strong><span>{selectedPayment.provider}</span></div>
                  <div><strong>결제 method</strong><span>{selectedPayment.method}</span></div>
                  <div><strong>승인시간</strong><span>{selectedPayment.approvedAt}</span></div>
                  <div><strong>결제금액</strong><span>{selectedPayment.amount}</span></div>
                </div>
              </article>

              <article className={styles.detailPanel}>
                <p className={styles.fieldLabel}>결제 상태 변경</p>
                <div className={styles.statusEditor}>
                  <div className={styles.statusPair}>
                    <span>주문상태</span>
                    <StatusBadge status={selectedPayment.orderStatus} />
                  </div>
                  <div className={styles.statusPair}>
                    <span>현재 결제상태</span>
                    <StatusBadge status={selectedPayment.paymentStatus} />
                  </div>
                  <select className={styles.select} value={selectedPaymentStatus} onChange={(event) => setSelectedPaymentStatus(event.target.value as AdminPaymentStatus)}>
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button type="button" className={styles.primaryButton} onClick={handleUpdatePaymentStatus} disabled={isPaymentPending}>
                    {isPaymentPending ? '저장 중...' : '결제상태 저장'}
                  </button>
                </div>
              </article>
            </div>

            {paymentMessage ? <p className={styles.successText}>{paymentMessage}</p> : null}
            {paymentError ? <p className={styles.errorText}>{paymentError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
