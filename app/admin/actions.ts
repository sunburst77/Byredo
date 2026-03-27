'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { getCurrentAdminProfile } from '@/lib/admin/supabase-auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const roleOptions = new Set(['admin', 'staff', 'customer'])
const productStatusOptions = new Set(['draft', 'active', 'inactive', 'sold_out'])
const orderStatusOptions = new Set(['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'])
const paymentStatusOptions = new Set(['pending', 'paid', 'failed', 'cancelled', 'refunded'])
const PRODUCT_THUMBNAIL_BUCKET = 'product-thumbnails'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function makeProductSku(name: string) {
  const normalized = slugify(name).replace(/-/g, '').toUpperCase().slice(0, 6) || 'ITEM'
  return `PRD-${normalized}-${Date.now().toString().slice(-6)}`
}

async function requireAdminProfile() {
  const adminProfile = await getCurrentAdminProfile()

  if (!adminProfile || adminProfile.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.')
  }

  return adminProfile
}

async function ensureProductThumbnailBucket() {
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()

  if (error) {
    throw new Error('스토리지 버킷 조회에 실패했습니다.')
  }

  const hasBucket = (buckets ?? []).some((bucket) => bucket.name === PRODUCT_THUMBNAIL_BUCKET)

  if (!hasBucket) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(PRODUCT_THUMBNAIL_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    })

    if (createError && !createError.message.toLowerCase().includes('already exists')) {
      throw new Error('썸네일 버킷 생성에 실패했습니다.')
    }
  }
}

async function uploadProductThumbnail(file: File) {
  if (!(file instanceof File) || file.size === 0) {
    return ''
  }

  await ensureProductThumbnailBucket()

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const path = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.storage.from(PRODUCT_THUMBNAIL_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error('썸네일 업로드에 실패했습니다.')
  }

  const { data } = supabaseAdmin.storage.from(PRODUCT_THUMBNAIL_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function revalidateProductRoutes() {
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/shop/[product]', 'page')
  revalidatePath('/checkout')
}

function revalidateOrderRoutes() {
  revalidatePath('/admin/orders')
  revalidatePath('/admin/payments')
  revalidatePath('/admin/dashboard')
}

function getProductPayload(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const categoryId = String(formData.get('categoryId') ?? '').trim()
  const price = Number(String(formData.get('price') ?? '0').replace(/,/g, '').trim())
  const stock = Number(String(formData.get('stock') ?? '0').trim())
  const status = String(formData.get('status') ?? '').trim() as 'draft' | 'active' | 'inactive' | 'sold_out'
  const currentThumbnailUrl = String(formData.get('currentThumbnailUrl') ?? '').trim()
  const file = formData.get('thumbnail')

  if (!name || !categoryId) {
    throw new Error('상품명과 카테고리를 입력해 주세요.')
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('가격은 0 이상이어야 합니다.')
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('재고는 0 이상이어야 합니다.')
  }

  if (!productStatusOptions.has(status)) {
    throw new Error('유효하지 않은 노출 상태입니다.')
  }

  return {
    name,
    categoryId,
    price,
    stock,
    status,
    currentThumbnailUrl,
    file: file instanceof File ? file : null,
  }
}

export async function loginAdminAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    redirect('/admin/login?error=required')
  }

  if (!emailPattern.test(email)) {
    redirect('/admin/login?error=email')
  }

  if (password.length < 6) {
    redirect('/admin/login?error=password')
  }

  const supabase = await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    redirect('/admin/login?error=invalid')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login?error=invalid')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: 'customer' | 'admin' }>()

  if (!profile || profile.role !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  redirect('/admin')
}

export async function logoutAdminAction() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function updateMemberRoleAction(formData: FormData) {
  const adminProfile = await requireAdminProfile()
  const memberId = String(formData.get('memberId') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim() as 'admin' | 'staff' | 'customer'

  if (!memberId || !roleOptions.has(role)) {
    throw new Error('유효하지 않은 요청입니다.')
  }

  if (memberId === adminProfile.id && role !== 'admin') {
    throw new Error('현재 로그인한 관리자 계정의 권한은 낮출 수 없습니다.')
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', memberId)

  if (error) {
    throw new Error('회원 권한 변경에 실패했습니다.')
  }

  revalidatePath('/admin/members')
}

export async function createMemberAccountAction(formData: FormData) {
  await requireAdminProfile()

  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const role = String(formData.get('role') ?? '').trim() as 'admin' | 'staff' | 'customer'

  if (!fullName || !email || !password) {
    throw new Error('이름, 이메일, 비밀번호를 모두 입력해 주세요.')
  }

  if (!emailPattern.test(email)) {
    throw new Error('올바른 이메일 형식이 아닙니다.')
  }

  if (password.length < 8) {
    throw new Error('비밀번호는 8자 이상이어야 합니다.')
  }

  if (!roleOptions.has(role)) {
    throw new Error('유효하지 않은 권한입니다.')
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
    },
  })

  if (error || !data.user) {
    throw new Error(error?.message || '계정 생성에 실패했습니다.')
  }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone: phone || null,
      role,
      is_active: true,
    })

  if (profileError) {
    throw new Error('프로필 생성에 실패했습니다.')
  }

  revalidatePath('/admin/members')

  return {
    ok: true,
    message: `${email} 계정이 생성되었습니다.`,
  }
}

export async function createProductAction(formData: FormData) {
  const adminProfile = await requireAdminProfile()
  const payload = getProductPayload(formData)
  const thumbnailUrl = payload.file ? await uploadProductThumbnail(payload.file) : payload.currentThumbnailUrl
  const slugBase = slugify(payload.name) || `product-${Date.now()}`
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`
  const sku = makeProductSku(payload.name)
  const supabaseAdmin = createSupabaseAdminClient()

  const { error } = await supabaseAdmin.from('products').insert({
    category_id: payload.categoryId,
    sku,
    name: payload.name,
    slug,
    short_description: null,
    description: null,
    price: payload.price,
    stock: payload.stock,
    status: payload.status,
    is_active: payload.status === 'active',
    thumbnail_url: thumbnailUrl || null,
    created_by: adminProfile.id,
    updated_by: adminProfile.id,
  })

  if (error) {
    throw new Error('상품 등록에 실패했습니다.')
  }

  revalidateProductRoutes()

  return {
    ok: true,
    message: `${payload.name} 상품이 등록되었습니다.`,
  }
}

export async function updateProductAction(formData: FormData) {
  const adminProfile = await requireAdminProfile()
  const productId = String(formData.get('productId') ?? '').trim()

  if (!productId) {
    throw new Error('수정할 상품 정보가 없습니다.')
  }

  const payload = getProductPayload(formData)
  const thumbnailUrl = payload.file ? await uploadProductThumbnail(payload.file) : payload.currentThumbnailUrl
  const supabaseAdmin = createSupabaseAdminClient()

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      category_id: payload.categoryId,
      name: payload.name,
      price: payload.price,
      stock: payload.stock,
      status: payload.status,
      is_active: payload.status === 'active',
      thumbnail_url: thumbnailUrl || null,
      updated_by: adminProfile.id,
      slug: `${slugify(payload.name) || 'product'}-${productId.slice(0, 6)}`,
    })
    .eq('id', productId)

  if (error) {
    throw new Error('상품 수정에 실패했습니다.')
  }

  revalidateProductRoutes()

  return {
    ok: true,
    message: `${payload.name} 상품이 수정되었습니다.`,
  }
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminProfile()
  const productId = String(formData.get('productId') ?? '').trim()

  if (!productId) {
    throw new Error('삭제할 상품 정보가 없습니다.')
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId)

  if (error) {
    throw new Error('상품 삭제에 실패했습니다.')
  }

  revalidateProductRoutes()

  return {
    ok: true,
    message: '상품이 삭제되었습니다.',
  }
}

export async function createCategoryAction(formData: FormData) {
  await requireAdminProfile()
  const name = String(formData.get('name') ?? '').trim()

  if (!name) {
    throw new Error('카테고리명을 입력해 주세요.')
  }

  const slugBase = slugify(name) || 'category'
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`
  const supabaseAdmin = createSupabaseAdminClient()
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name,
      slug,
      sort_order: 0,
      is_active: true,
    })
    .select('id, name, slug')
    .single()

  if (error || !data) {
    throw new Error('카테고리 생성에 실패했습니다.')
  }

  revalidateProductRoutes()

  return {
    ok: true,
    message: `${name} 카테고리가 생성되었습니다.`,
    category: data,
  }
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminProfile()
  const orderId = String(formData.get('orderId') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim() as
    | 'pending'
    | 'paid'
    | 'preparing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'

  if (!orderId || !orderStatusOptions.has(status)) {
    throw new Error('유효하지 않은 주문 상태 변경 요청입니다.')
  }

  const timestampFields: Record<string, string | null> = {
    paid_at: status === 'paid' ? new Date().toISOString() : null,
    cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
    delivered_at: status === 'delivered' ? new Date().toISOString() : null,
  }

  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status,
      ...timestampFields,
    })
    .eq('id', orderId)

  if (error) {
    throw new Error('주문 상태 변경에 실패했습니다.')
  }

  revalidateOrderRoutes()

  return {
    ok: true,
    message: '주문 상태가 변경되었습니다.',
  }
}

export async function updatePaymentStatusAction(formData: FormData) {
  await requireAdminProfile()
  const paymentId = String(formData.get('paymentId') ?? '').trim()
  const status = String(formData.get('status') ?? '').trim() as 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'

  if (!paymentId || !paymentStatusOptions.has(status)) {
    throw new Error('유효하지 않은 결제 상태 변경 요청입니다.')
  }

  const now = new Date().toISOString()
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from('payments')
    .update({
      status,
      approved_at: status === 'paid' ? now : null,
      failed_at: status === 'failed' ? now : null,
      refunded_at: status === 'refunded' ? now : null,
    })
    .eq('id', paymentId)

  if (error) {
    throw new Error('결제 상태 변경에 실패했습니다.')
  }

  revalidateOrderRoutes()

  return {
    ok: true,
    message: '결제 상태가 변경되었습니다.',
  }
}
