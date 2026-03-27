import dynamic from 'next/dynamic'

const JournalView = dynamic(() => import('./JournalView'), { ssr: false })

export default function JournalPage() {
  return <JournalView />
}
