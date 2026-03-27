export const dashboardMetrics = [
  { label: '오늘 주문', value: '128건', change: '+12.4% from yesterday', tone: 'blue' as const },
  { label: '신규 회원', value: '36명', change: '+5.1% from yesterday', tone: 'green' as const },
  { label: '결제 대기', value: '14건', change: '3건 즉시 확인 필요', tone: 'amber' as const },
  { label: '취소 요청', value: '8건', change: '-2.3% from yesterday', tone: 'rose' as const },
]

export const recentOrders = [
  { orderNo: 'ORD-240324-001', customer: '김민지', product: 'Bal d’Afrique 50ml', amount: '₩210,000', status: '완료' },
  { orderNo: 'ORD-240324-002', customer: '박서준', product: 'Mojave Ghost 100ml', amount: '₩320,000', status: '배송중' },
  { orderNo: 'ORD-240324-003', customer: '이수아', product: 'Gypsy Water Hand Cream', amount: '₩78,000', status: '대기' },
  { orderNo: 'ORD-240324-004', customer: '정하늘', product: 'Rose of No Man’s Land', amount: '₩198,000', status: '취소' },
]

export const memberRows = [
  { name: '김민지', email: 'minji@example.com', grade: 'VIP', joinedAt: '2026-03-10', orders: 14, status: '활성' },
  { name: '박서준', email: 'seojun@example.com', grade: 'Gold', joinedAt: '2026-03-01', orders: 9, status: '활성' },
  { name: '이수아', email: 'sua@example.com', grade: 'Silver', joinedAt: '2026-02-22', orders: 4, status: '대기' },
  { name: '정하늘', email: 'haneul@example.com', grade: 'Bronze', joinedAt: '2026-02-18', orders: 2, status: '정상' },
]

export const productRows = [
  { sku: 'PRD-1001', name: 'Bal d’Afrique 50ml', category: 'Perfume', price: '₩210,000', stock: 42, status: '판매중' },
  { sku: 'PRD-1002', name: 'Mojave Ghost 100ml', category: 'Perfume', price: '₩320,000', stock: 18, status: '판매중' },
  { sku: 'PRD-1003', name: 'Suede Hand Wash', category: 'Body Care', price: '₩84,000', stock: 0, status: '대기' },
  { sku: 'PRD-1004', name: 'Rose Candle', category: 'Home', price: '₩122,000', stock: 11, status: '정상' },
]

export const orderRows = [
  { orderNo: 'ORD-240324-001', customer: '김민지', items: '2개 상품', orderedAt: '2026-03-24 09:12', amount: '₩210,000', status: '완료' },
  { orderNo: 'ORD-240324-002', customer: '박서준', items: '1개 상품', orderedAt: '2026-03-24 10:03', amount: '₩320,000', status: '배송중' },
  { orderNo: 'ORD-240324-003', customer: '이수아', items: '3개 상품', orderedAt: '2026-03-24 11:24', amount: '₩412,000', status: '대기' },
  { orderNo: 'ORD-240324-004', customer: '정하늘', items: '1개 상품', orderedAt: '2026-03-24 13:41', amount: '₩198,000', status: '취소' },
]

export const paymentRows = [
  { paymentNo: 'PAY-993201', orderNo: 'ORD-240324-001', method: '신용카드', approvedAt: '2026-03-24 09:13', amount: '₩210,000', status: '정산완료' },
  { paymentNo: 'PAY-993202', orderNo: 'ORD-240324-002', method: '간편결제', approvedAt: '2026-03-24 10:04', amount: '₩320,000', status: '정산대기' },
  { paymentNo: 'PAY-993203', orderNo: 'ORD-240324-003', method: '무통장입금', approvedAt: '2026-03-24 11:25', amount: '₩412,000', status: '대기' },
  { paymentNo: 'PAY-993204', orderNo: 'ORD-240324-004', method: '신용카드', approvedAt: '2026-03-24 13:42', amount: '₩198,000', status: '취소' },
]
