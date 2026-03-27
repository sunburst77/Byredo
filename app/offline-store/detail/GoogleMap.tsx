'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

type GoogleMapProps = {
  address: string
}

export default function GoogleMap({ address }: GoogleMapProps) {
  const [mounted, setMounted] = useState(false)
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !address || address.trim() === '') return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    const zoom = 15
    let searchQuery = address.trim()

    if (!searchQuery.includes(',') && !searchQuery.toLowerCase().includes('paris')) {
      searchQuery = `${searchQuery}, Paris, France`
    }

    const url = apiKey
      ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(searchQuery)}&zoom=${zoom}`
      : `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}&output=embed&z=${zoom}`

    setEmbedUrl(url)
  }, [mounted, address])

  return (
    <div
      className={styles.grayBox}
      style={{
        width: '100%',
        position: 'relative' as const,
        overflow: 'hidden',
      }}
    >
      {mounted && embedUrl && (
        <iframe
          src={embedUrl}
          title={`Map showing ${address}`}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            display: 'block',
            filter: 'grayscale(100%)',
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label={`Map showing ${address}`}
        />
      )}
    </div>
  )
}
