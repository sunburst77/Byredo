import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export type AdminMemberRow = {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'staff' | 'admin'
  joinedAt: string
  joinedAtRaw: string | null
  orders: number
  status: 'active' | 'inactive'
}

export type AdminCategoryOption = {
  id: string
  name: string
  slug: string
}

export type AdminProductRow = {
  id: string
  sku: string
  name: string
  slug: string
  categoryId: string
  category: string
  price: number
  priceLabel: string
  stock: number
  status: 'draft' | 'active' | 'inactive' | 'sold_out'
  thumbnailUrl: string
  createdAtRaw: string | null
}

export type AdminOrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type AdminPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

export type AdminOrderItemRow = {
  id: string
  productName: string
  productSku: string
  unitPrice: string
  quantity: number
  lineTotal: string
}

export type AdminOrderRow = {
  id: string
  orderNo: string
  customer: string
  amount: string
  orderStatus: AdminOrderStatus
  paymentStatus: AdminPaymentStatus | 'pending'
  orderedAt: string
  orderedAtRaw: string | null
  paymentProvider: string
  paymentKey: string
  itemsSummary: string
  orderItems: AdminOrderItemRow[]
}

export type AdminPaymentRow = {
  id: string
  paymentKey: string
  orderId: string
  orderNo: string
  customer: string
  amount: string
  paymentStatus: AdminPaymentStatus
  orderStatus: AdminOrderStatus
  provider: string
  method: string
  approvedAt: string
  approvedAtRaw: string | null
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value ?? 0)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : value ?? null
}

export async function getAdminDashboardData() {
  const supabase = await createSupabaseServerClient()

  const [
    { count: totalMembers },
    { count: totalProducts },
    { count: totalOrders },
    { count: paidOrders },
    { data: recentOrders },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    supabase
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, profiles!orders_user_id_fkey(full_name, email), order_items(product_name)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('products')
      .select('id, sku, name, stock, status, categories(name)')
      .order('stock', { ascending: true })
      .limit(5),
  ])

  return {
    dashboardMetrics: [
      { label: '총 회원 수', value: String(totalMembers ?? 0), change: 'profiles 기준 전체 계정', href: '/admin/members' },
      { label: '전체 상품 수', value: String(totalProducts ?? 0), change: '등록된 products 전체', href: '/admin/products' },
      { label: '전체 주문 수', value: String(totalOrders ?? 0), change: '누적 orders 건수', href: '/admin/orders' },
      { label: '결제 완료 주문 수', value: String(paidOrders ?? 0), change: 'payments.status = paid 기준', href: '/admin/payments' },
    ],
    recentOrders: (recentOrders ?? []).map((order) => {
      const profile = firstRelation(order.profiles) as { full_name?: string | null; email?: string | null } | null
      const orderItem = firstRelation(order.order_items) as { product_name?: string | null } | null

      return {
        id: order.id,
        orderNo: order.order_number,
        customer: profile?.full_name || profile?.email || '-',
        product: orderItem?.product_name || '-',
        amount: formatCurrency(order.total_amount),
        status: order.status,
        createdAt: formatDateTime(order.created_at),
      }
    }),
    lowStockProducts: (lowStockProducts ?? []).map((product) => {
      const category = firstRelation(product.categories) as { name?: string | null } | null
      return {
        id: product.id,
        sku: product.sku,
        name: product.name,
        category: category?.name ?? '-',
        stock: product.stock,
        status: product.status,
      }
    }),
  }
}

export async function getAdminProducts() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('products')
    .select('id, sku, slug, name, price, stock, status, thumbnail_url, created_at, category_id, categories(name)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((product) => {
    const category = firstRelation(product.categories) as { name?: string | null } | null

    return {
      id: product.id,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      categoryId: product.category_id,
      category: category?.name ?? '-',
      price: Number(product.price ?? 0),
      priceLabel: formatCurrency(product.price),
      stock: product.stock,
      status: product.status,
      thumbnailUrl: product.thumbnail_url ?? '',
      createdAtRaw: product.created_at,
    } satisfies AdminProductRow
  })
}

export async function getAdminCategories() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
  })) satisfies AdminCategoryOption[]
}

export async function getAdminOrders() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('orders')
    .select(
      'id, order_number, created_at, total_amount, status, profiles!orders_user_id_fkey(full_name, email), payments(id, status, provider, payment_key), order_items(id, product_name, product_sku, unit_price, quantity, line_total)'
    )
    .order('created_at', { ascending: false })

  return (data ?? []).map((order) => {
    const profile = firstRelation(order.profiles) as { full_name?: string | null; email?: string | null } | null
    const payment = firstRelation(order.payments) as
      | { id?: string | null; status?: AdminPaymentStatus | null; provider?: string | null; payment_key?: string | null }
      | null
    const orderItems = (order.order_items ?? []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      productSku: item.product_sku || '-',
      unitPrice: formatCurrency(item.unit_price),
      quantity: item.quantity,
      lineTotal: formatCurrency(item.line_total),
    })) satisfies AdminOrderItemRow[]

    return {
      id: order.id,
      orderNo: order.order_number,
      customer: profile?.full_name || profile?.email || '-',
      amount: formatCurrency(order.total_amount),
      orderStatus: order.status,
      paymentStatus: payment?.status ?? 'pending',
      orderedAt: formatDateTime(order.created_at),
      orderedAtRaw: order.created_at,
      paymentProvider: payment?.provider || '-',
      paymentKey: payment?.payment_key || '-',
      itemsSummary: `${orderItems.length}개 상품`,
      orderItems,
    } satisfies AdminOrderRow
  })
}

export async function getAdminPayments() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('payments')
    .select('id, payment_key, method, provider, approved_at, amount, status, profiles!payments_user_id_fkey(full_name, email), orders(id, order_number, status)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((payment) => {
    const order = firstRelation(payment.orders) as
      | { id?: string | null; order_number?: string | null; status?: AdminOrderStatus | null }
      | null
    const profile = firstRelation(payment.profiles) as { full_name?: string | null; email?: string | null } | null

    return {
      id: payment.id,
      paymentKey: payment.payment_key || payment.id,
      orderId: order?.id ?? '',
      orderNo: order?.order_number ?? '-',
      customer: profile?.full_name || profile?.email || '-',
      amount: formatCurrency(payment.amount),
      paymentStatus: payment.status,
      orderStatus: order?.status ?? 'pending',
      provider: payment.provider || payment.method,
      method: payment.method,
      approvedAt: formatDateTime(payment.approved_at),
      approvedAtRaw: payment.approved_at,
    } satisfies AdminPaymentRow
  })
}

export async function getAdminMembers() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, is_active, created_at, orders(count)')
    .order('created_at', { ascending: false })

  return (data ?? []).map((member) => {
    const orderCount = firstRelation(member.orders) as { count?: number | null } | null

    return {
      id: member.id,
      name: member.full_name || '-',
      email: member.email,
      phone: member.phone || '-',
      role: member.role,
      joinedAt: formatDate(member.created_at),
      joinedAtRaw: member.created_at,
      orders: orderCount?.count ?? 0,
      status: member.is_active ? 'active' : 'inactive',
    } satisfies AdminMemberRow
  })
}