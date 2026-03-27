'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function JournalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Journal route error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        background: '#f8f7f5',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: 18, fontWeight: 600 }}>Something went wrong</h1>
      <p style={{ color: '#666', fontSize: 14 }}>{error.message}</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '10px 20px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            background: 'transparent',
            color: '#000',
            border: '1px solid #000',
            borderRadius: 4,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
