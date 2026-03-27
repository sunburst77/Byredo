import dynamic from 'next/dynamic'

const DetailContent = dynamic(() => import('./DetailContent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
      aria-hidden="true"
    />
  ),
})

export default function OfflineStoreDetailPage() {
  return <DetailContent />
}
