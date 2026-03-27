'use client'

import { useState } from 'react'
import styles from './page.module.css'

type CopyAddressButtonProps = {
  address: string
}

export default function CopyAddressButton({ address }: CopyAddressButtonProps) {
  const [buttonText, setButtonText] = useState('COPY ADDRESS')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setButtonText('COPIED')
      
      setTimeout(() => {
        setButtonText('COPY ADDRESS')
      }, 1500)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = address
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        setButtonText('COPIED')
        
        setTimeout(() => {
          setButtonText('COPY ADDRESS')
        }, 1500)
      } catch (fallbackError) {
        console.error('Failed to copy address:', fallbackError)
      } finally {
        document.body.removeChild(textArea)
      }
    }
  }

  return (
    <button 
      className={styles.copyButton}
      onClick={handleCopy}
      type="button"
      aria-label="Copy store address to clipboard"
    >
      {buttonText}
    </button>
  )
}
