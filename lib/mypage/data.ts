import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase/server'

export type MyPageOrderItem = {
  id: string
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type MyPageOrder = {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  receiverName: string
  receiverPhone: string | null
  shippingAddress1: string
  shippingAddress2: string | null
  shippingMessage: string | null
  items: MyPageOrderItem[]
}

export type MyPageProfile = {
  id: string
  email: string
  fullName: string | null
  phone: string | null
  createdAt: string
}

export type MyPageData = {
  profile: MyPageProfile | null
  orders: MyPageOrder[]
}

export async function getMyPageData(): Promise<MyPageData> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      profile: null,
      orders: [],
    }
  }

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, phone, created_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('orders')
      .select(
        'id, order_number, status, total_amount, created_at, receiver_name, receiver_phone, shipping_address1, shipping_address2, shipping_message, order_items(id, product_name, unit_price, quantity, line_total)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return {
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          createdAt: profile.created_at,
        }
      : {
          id: user.id,
          email: user.email ?? '',
          fullName: (user.user_metadata.full_name as string | undefined) ?? null,
          phone: null,
          createdAt: user.created_at,
        },
    orders: (orders ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      totalAmount: Number(order.total_amount ?? 0),
      createdAt: order.created_at,
      receiverName: order.receiver_name,
      receiverPhone: order.receiver_phone,
      shippingAddress1: order.shipping_address1,
      shippingAddress2: order.shipping_address2,
      shippingMessage: order.shipping_message,
      items: (order.order_items ?? []).map((item) => ({
        id: item.id,
        productName: item.product_name,
        unitPrice: Number(item.unit_price ?? 0),
        quantity: Number(item.quantity ?? 0),
        lineTotal: Number(item.line_total ?? 0),
      })),
    })),
  }
}
