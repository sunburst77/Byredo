import 'server-only'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import styles from './page.module.css'

type TossPaymentConfirmResponse = {
  paymentKey: string
  orderId: string
  orderName: string
  status: string
  method: string
  totalAmount: number
  approvedAt: string
  card?: { number?: string; issuerCode?: string }
  [key: string]: unknown
}

type TossErrorResponse = {
  code: string
  message: string
}

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm'
const GUEST_EMAIL = 'guest@byredo.com'

async function confirmTossPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<{ ok: true; data: TossPaymentConfirmResponse } | { ok: false; error: TossErrorResponse }> {
  const secretKey = process.env.TOSS_SECRET_KEY ?? ''
  const credentials = Buffer.from(`${secretKey}:`).toString('base64')

  const res = await fetch(TOSS_CONFIRM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
    cache: 'no-store',
  })

  const json = await res.json()

  if (!res.ok) {
    return { ok: false, error: json as TossErrorResponse }
  }

  return { ok: true, data: json as TossPaymentConfirmResponse }
}

async function getOrCreateGuestUserId(supabase: ReturnType<typeof createSupabaseAdminClient>): Promise<string> {
  // 이미 존재하는 게스트 프로필 조회
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', GUEST_EMAIL)
    .maybeSingle()

  if (existing?.id) {
    return existing.id as string
  }

  // auth.users에 게스트 유저 생성 (profiles 트리거가 자동으로 row 생성)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: GUEST_EMAIL,
    password: `guest-${crypto.randomUUID()}`,
    email_confirm: true,
    user_metadata: { full_name: 'Guest' },
  })

  if (authError || !authData.user) {
    throw new Error('게스트 유저 생성에 실패했습니다.')
  }

  return authData.user.id
}

async function savePaymentToDatabase(payment: TossPaymentConfirmResponse) {
  const supabase = createSupabaseAdminClient()

  const userId = await getOrCreateGuestUserId(supabase)

  // orders 테이블에 주문 생성
  const orderNumber = `ORD-${payment.orderId.slice(-12).toUpperCase()}`
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId,
      status: 'paid',
      subtotal_amount: payment.totalAmount,
      shipping_amount: 0,
      discount_amount: 0,
      total_amount: payment.totalAmount,
      receiver_name: 'Guest',
      shipping_address1: '-',
      paid_at: payment.approvedAt,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[savePaymentToDatabase] order insert error:', orderError)
    throw new Error('주문 저장에 실패했습니다.')
  }

  const orderId = order.id as string

  // order_items 테이블에 상품 항목 저장
  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: orderId,
    product_name: payment.orderName,
    product_sku: null,
    unit_price: payment.totalAmount,
    quantity: 1,
    line_total: payment.totalAmount,
  })

  if (itemError) {
    console.error('[savePaymentToDatabase] order_items insert error:', itemError)
  }

  // payments 테이블에 결제 정보 저장
  const { error: paymentError } = await supabase.from('payments').insert({
    order_id: orderId,
    user_id: userId,
    payment_key: payment.paymentKey,
    method: 'card',
    status: 'paid',
    amount: payment.totalAmount,
    provider: 'toss-payments',
    provider_transaction_id: payment.paymentKey,
    approved_at: payment.approvedAt,
  })

  if (paymentError) {
    console.error('[savePaymentToDatabase] payment insert error:', paymentError)
    throw new Error('결제 정보 저장에 실패했습니다.')
  }

  return { orderId, orderNumber }
}

type SuccessPageProps = {
  searchParams?: Promise<{
    paymentKey?: string
    orderId?: string
    amount?: string
  }>
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : {}
  const { paymentKey, orderId, amount } = params

  if (!paymentKey || !orderId || !amount) {
    redirect('/checkout')
  }

  const result = await confirmTossPayment(paymentKey, orderId, Number(amount))

  if (!result.ok) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <p className={styles.eyebrow}>Payment Failed</p>
            <h1 className={styles.title}>Error</h1>
            <p className={styles.errorMessage}>{result.error.message}</p>
            <Link href="/" className={styles.homeButton}>
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const payment = result.data
  let savedOrder: { orderId: string; orderNumber: string } | null = null
  let saveError: string | null = null

  try {
    savedOrder = await savePaymentToDatabase(payment)
  } catch (err) {
    saveError = err instanceof Error ? err.message : '주문 저장 중 오류가 발생했습니다.'
    console.error('[PaymentSuccessPage] savePaymentToDatabase error:', err)
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Payment Complete</p>
          <h1 className={styles.title}>Thank You</h1>
          <ul className={styles.detail}>
            <li>
              <span className={styles.label}>Order No.</span>
              <span className={styles.value}>{savedOrder?.orderNumber ?? orderId}</span>
            </li>
            <li>
              <span className={styles.label}>Product</span>
              <span className={styles.value}>{payment.orderName}</span>
            </li>
            <li>
              <span className={styles.label}>Amount</span>
              <span className={styles.value}>
                {payment.totalAmount.toLocaleString('ko-KR')} KRW
              </span>
            </li>
            <li>
              <span className={styles.label}>Method</span>
              <span className={styles.value}>{payment.method}</span>
            </li>
            <li>
              <span className={styles.label}>Approved At</span>
              <span className={styles.value}>
                {new Intl.DateTimeFormat('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(payment.approvedAt))}
              </span>
            </li>
          </ul>
          {saveError && (
            <p className={styles.errorMessage} role="alert">
              ⚠ 주문 저장 중 오류: {saveError}
            </p>
          )}
          <Link href="/" className={styles.homeButton}>
            Back to Shop
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
