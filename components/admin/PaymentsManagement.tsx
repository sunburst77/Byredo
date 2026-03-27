'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/StatusBadge'
import type { AdminPaymentRow, AdminPaymentStatus } from '@/lib/admin/data'
import styles from './OrdersManagement.module.css'

type PaymentsManagementProps = {
  initialPayments: AdminPaymentRow[]
  onUpdatePaymentStatusAction: (formData: FormData) => Promise<{ ok: boolean; message: string }>
}

const PAYMENT_STATUS_OPTIONS: AdminPaymentStatus[] = ['pending', 'paid', 'failed', 'cancelled', 'refunded']

export function PaymentsManagement({ initialPayments, onUpdatePaymentStatusAction }: PaymentsManagementProps) {
  const router = useRouter()
  const [payments, setPayments] = useState(initialPayments)
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<AdminPaymentStatus>('pending')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setPayments(initialPayments)
  }, [initialPayments])

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.id === selectedPaymentId) ?? null,
    [payments, selectedPaymentId]
  )

  useEffect(() => {
    if (selectedPayment) {
      setSelectedStatus(selectedPayment.paymentStatus)
      setMessage('')
      setError('')
    }
  }, [selectedPayment])

  const paidCount = payments.filter((payment) => payment.paymentStatus === 'paid').length
  const pendingCount = payments.filter((payment) => payment.paymentStatus === 'pending').length
  const failedCount = payments.filter((payment) => payment.paymentStatus === 'failed').length
  const cancelledCount = payments.filter((payment) => ['cancelled', 'refunded'].includes(payment.paymentStatus)).length

  function handleUpdateStatus() {
    if (!selectedPayment) {
      return
    }

    setMessage('')
    setError('')

    const formData = new FormData()
    formData.set('paymentId', selectedPayment.id)
    formData.set('status', selectedStatus)

    startTransition(async () => {
      try {
        const result = await onUpdatePaymentStatusAction(formData)
        setPayments((current) =>
          current.map((payment) =>
            payment.id === selectedPayment.id
              ? {
                  ...payment,
                  paymentStatus: selectedStatus,
                  approvedAt:
                    selectedStatus === 'paid'
                      ? new Intl.DateTimeFormat('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(new Date())
                      : payment.approvedAt,
                }
              : payment
          )
        )
        setMessage(result.message)
        router.refresh()
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : '결제 상태 변경 중 오류가 발생했습니다.')
      }
    })
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Payments</p>
          <h1 className={styles.title}>결제관리</h1>
          <p className={styles.description}>
            결제 provider, 승인시간, 결제키를 기준으로 결제 흐름을 추적하고 주문 상태와 함께 수동 보정이 필요한 건을 관리합니다.
          </p>
        </div>
        <div className={styles.heroMeta}>
          <span className={styles.metaChip}>전체 {payments.length}건</span>
          <span className={styles.metaChip}>승인 {paidCount}건</span>
        </div>
      </section>

      <section className={styles.metricGrid}>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Paid</p>
          <p className={styles.metricValue}>{paidCount}</p>
          <p className={styles.metricMeta}>정상 승인 결제</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Pending</p>
          <p className={styles.metricValue}>{pendingCount}</p>
          <p className={styles.metricMeta}>승인 대기 또는 수기 확인</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Failed</p>
          <p className={styles.metricValue}>{failedCount}</p>
          <p className={styles.metricMeta}>실패 또는 재시도 필요</p>
        </article>
        <article className={styles.metricCard}>
          <p className={styles.metricLabel}>Cancelled</p>
          <p className={styles.metricValue}>{cancelledCount}</p>
          <p className={styles.metricMeta}>취소 또는 환불 처리</p>
        </article>
      </section>

      <section className={styles.tableCard}>
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
          {payments.length === 0 ? (
            <div className={styles.empty}>결제 데이터가 없습니다.</div>
          ) : (
            payments.map((payment) => (
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
                    상태 변경
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </section>

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
                <p className={styles.fieldLabel}>상태 변경</p>
                <div className={styles.statusEditor}>
                  <div className={styles.statusPair}>
                    <span>주문상태</span>
                    <StatusBadge status={selectedPayment.orderStatus} />
                  </div>
                  <div className={styles.statusPair}>
                    <span>현재 결제상태</span>
                    <StatusBadge status={selectedPayment.paymentStatus} />
                  </div>
                  <select className={styles.select} value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as AdminPaymentStatus)}>
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <button type="button" className={styles.primaryButton} onClick={handleUpdateStatus} disabled={isPending}>
                    {isPending ? '저장 중...' : '결제상태 저장'}
                  </button>
                </div>
              </article>
            </div>

            {message ? <p className={styles.successText}>{message}</p> : null}
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
