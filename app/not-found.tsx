'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  const pathname = usePathname()
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl w-full"
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-6" style={{ color: '#FF6B35' }}>
          Page not found!
        </h1>
        
        <div className="mb-8">
          <p className="text-secondary-700 text-lg mb-2">The page you're looking for doesn't exist.</p>
          <p className="text-secondary-600 text-sm font-mono bg-secondary-100 px-4 py-2 rounded inline-block">
            {url || pathname}
          </p>
        </div>

        <Link 
          href="/"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
        >
          Go Back Home
        </Link>
      </motion.div>
    </div>
  )
}

