import { updateOrderStatusAction, updatePaymentStatusAction } from '@/app/admin/actions'
import { OrdersManagement } from '@/components/admin/OrdersManagement'
import { getAdminOrders, getAdminPayments } from '@/lib/admin/data'

type OrdersPageProps = {
  searchParams?: {
    q?: string
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const [orders, payments] = await Promise.all([getAdminOrders(), getAdminPayments()])

  return (
    <OrdersManagement
      initialOrders={orders}
      initialPayments={payments}
      initialQuery={searchParams?.q ?? ''}
      onUpdateOrderStatusAction={updateOrderStatusAction}
      onUpdatePaymentStatusAction={updatePaymentStatusAction}
    />
  )
}
