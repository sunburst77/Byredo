type IconProps = {
  className?: string
}

function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h4v7H4v-7Zm6 0h10v7H10v-7Z" />
    </svg>
  )
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M9 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm6 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3ZM2 20a7 7 0 0 1 14 0Zm13 0a5 5 0 0 1 7 0Z" />
    </svg>
  )
}

function ProductIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="m12 2 8 4v12l-8 4-8-4V6l8-4Zm0 2.2L6.4 7 12 9.8 17.6 7 12 4.2Zm-6 4.5v8l5 2.5v-8Zm7 10.5 5-2.5v-8l-5 2.5v8Z" />
    </svg>
  )
}

function OrderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="M7 3h10l1 2h3v2h-1l-1.2 9.1A3 3 0 0 1 15.83 19H8.17a3 3 0 0 1-2.97-2.9L4 7H3V5h3l1-2Zm1.24 2h7.52l-.5-1H8.74l-.5 1ZM6.02 7l1.17 8.78a1 1 0 0 0 .98.97h7.66a1 1 0 0 0 .98-.97L17.98 7H6.02Z" />
    </svg>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="currentColor" d="m19.14 12.94.04-.94-.04-.94 2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.53 7.53 0 0 0-1.62-.94L14.4 2.8a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4L9.24 5.3c-.57.22-1.11.53-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.82a.5.5 0 0 0 .12.64l2.03 1.58-.04.94.04.94-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.41 1.05.72 1.62.94l.36 2.5a.5.5 0 0 0 .5.4h3.8a.5.5 0 0 0 .5-.4l.36-2.5c.57-.22 1.11-.53 1.62-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
    </svg>
  )
}

export const adminNavigation = [
  { label: '대시보드', href: '/admin/dashboard', icon: DashboardIcon },
  { label: '회원관리', href: '/admin/members', icon: UsersIcon },
  { label: '상품관리', href: '/admin/products', icon: ProductIcon },
  { label: '주문/결제관리', href: '/admin/orders', icon: OrderIcon },
  { label: '설정', href: '/admin/settings', icon: SettingsIcon },
]
