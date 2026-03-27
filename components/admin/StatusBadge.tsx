type StatusBadgeProps = {
  status: string
}

const statusLabelMap: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  draft: '초안',
  sold_out: '품절',
  pending: '대기',
  paid: '결제완료',
  preparing: '준비중',
  shipped: '배송중',
  delivered: '배송완료',
  cancelled: '취소',
  refunded: '환불',
  failed: '실패',
  card: '카드',
  bank_transfer: '계좌이체',
  virtual_account: '가상계좌',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  toss_payments: '토스페이먼츠',
  manual: '수기처리',
  customer: '일반회원',
  staff: '스태프',
  admin: '관리자',
}

const darkStatuses = new Set(['결제완료', '배송완료', '관리자'])
const mutedStatuses = new Set(['대기', '초안', '준비중'])
const softStatuses = new Set(['활성', '배송중', '일반회원', '스태프'])
const faintStatuses = new Set(['취소', '환불', '비활성', '실패', '품절'])

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = statusLabelMap[status] ?? status
  let className = 'border border-black/15 bg-white text-slate-900'

  if (darkStatuses.has(label)) {
    className = 'border border-slate-950 bg-slate-950 text-white'
  } else if (mutedStatuses.has(label)) {
    className = 'border border-black/15 bg-[#e7e3db] text-slate-900'
  } else if (softStatuses.has(label)) {
    className = 'border border-black/15 bg-[#f2f0eb] text-slate-900'
  } else if (faintStatuses.has(label)) {
    className = 'border border-black/15 bg-[#d9d4cb] text-slate-900'
  }

  return (
    <span
      className={`inline-flex min-h-[30px] min-w-[68px] items-center justify-center whitespace-nowrap rounded-full px-3.5 py-[6px] text-xs font-semibold leading-none ${className}`}
    >
      {label}
    </span>
  )
}
