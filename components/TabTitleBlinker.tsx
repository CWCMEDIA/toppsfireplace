'use client'

import { useEffect, useRef } from 'react'

const ORIGINAL_TITLE = 'Tops Fireplaces - Premium Fireplaces for Southend & Essex'
const ALERT_TITLE = 'Checkout Now Before Its Too Late'

export default function TabTitleBlinker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isBlinkingRef = useRef(false)
  const hasItemsRef = useRef(false)

  const startBlinking = () => {
    if (isBlinkingRef.current) return
    
    isBlinkingRef.current = true
    let showOriginal = true

    intervalRef.current = setInterval(() => {
      document.title = showOriginal ? ORIGINAL_TITLE : ALERT_TITLE
      showOriginal = !showOriginal
    }, 2000) // Switch every 2 seconds
  }

  const stopBlinking = () => {
    if (!isBlinkingRef.current) return
    
    isBlinkingRef.current = false
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    document.title = ORIGINAL_TITLE
  }

  const checkCart = () => {
    if (typeof window === 'undefined') return false
    
    const cart = localStorage.getItem('cart')
    const hasItems = cart && JSON.parse(cart).length > 0
    hasItemsRef.current = hasItems
    
    return hasItems
  }

  useEffect(() => {
    // Check cart on mount
    checkCart()

    // Handle visibility change (tab becomes hidden/visible)
    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      const hasItems = checkCart()

      if (isHidden && hasItems) {
        // Tab is hidden and cart has items - start blinking
        startBlinking()
      } else {
        // Tab is visible - stop blinking and restore title
        stopBlinking()
      }
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const hasItems = checkCart()
      
      // Only start blinking if tab is hidden and items were just added
      if (document.hidden && hasItems && !isBlinkingRef.current) {
        startBlinking()
      } else if (!hasItems && isBlinkingRef.current) {
        // Stop if cart becomes empty
        stopBlinking()
      }
    }

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        const hasItems = checkCart()
        
        // Only start blinking if tab is hidden and items exist
        if (document.hidden && hasItems && !isBlinkingRef.current) {
          startBlinking()
        } else if (!hasItems && isBlinkingRef.current) {
          stopBlinking()
        }
      }
    }

    // Listen to visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleStorageChange)

    // Check on initial load if tab is already hidden
    if (document.hidden && checkCart()) {
      startBlinking()
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
      stopBlinking()
    }
  }, [])

  return null
}

