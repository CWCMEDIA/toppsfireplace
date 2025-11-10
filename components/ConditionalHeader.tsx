'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on admin page and checkout page
  if (pathname === '/admin' || pathname === '/checkout') {
    return null
  }
  
  return <Header />
}

