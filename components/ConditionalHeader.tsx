'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
  const pathname = usePathname()
  
  // Hide header on admin page
  if (pathname === '/admin') {
    return null
  }
  
  return <Header />
}

