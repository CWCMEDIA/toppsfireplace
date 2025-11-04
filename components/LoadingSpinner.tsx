'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  showLogo?: boolean
}

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  showLogo = true 
}: LoadingSpinnerProps) => {
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center space-y-4 z-50" style={{ backgroundColor: '#de5f1b' }}>
      {showLogo && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-4"
        >
          {/* Company Logo */}
          <div className="w-16 h-16 relative">
            <Image
              src="/tops.png"
              alt="Tops Fireplaces"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      )}
      
      {/* Small Fire Animation */}
      <div className="fire-small">
        <div className="flames-small">
          <div className="flame-small"></div>
          <div className="flame-small"></div>
          <div className="flame-small"></div>
          <div className="flame-small"></div>
        </div>
        <div className="logs-small"></div>
      </div>
      
      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`${textSizeClasses[size]} text-white font-medium`}
      >
        {text}
      </motion.p>
    </div>
  )
}

export default LoadingSpinner
