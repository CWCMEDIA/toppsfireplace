'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function ExitIntentPopup() {
  const pathname = usePathname()
  const [showPopup, setShowPopup] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [shouldShake, setShouldShake] = useState(false)
  const [delayPassed, setDelayPassed] = useState(false)

  // Don't show popup on admin pages
  const isAdminPage = pathname?.startsWith('/admin')

  // Set up 2-second delay timer
  useEffect(() => {
    if (isAdminPage) {
      return
    }

    const timer = setTimeout(() => {
      setDelayPassed(true)
    }, 2000) // 2 seconds

    return () => clearTimeout(timer)
  }, [isAdminPage])

  // Add/remove class to body when popup is shown to darken header
  useEffect(() => {
    if (showPopup && !isAdminPage) {
      document.body.classList.add('exit-intent-popup-active')
    } else {
      document.body.classList.remove('exit-intent-popup-active')
    }
    
    return () => {
      document.body.classList.remove('exit-intent-popup-active')
    }
  }, [showPopup, isAdminPage])

  useEffect(() => {
    // Don't set up listeners on admin pages
    if (isAdminPage) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Only trigger if delay has passed (10 seconds) and hasn't been triggered yet
      if (!delayPassed || hasTriggered) {
        return
      }
      
      // Trigger when mouse moves to the very top of the viewport (clientY <= 5)
      // This catches when user moves mouse to address bar/bookmarks
      if (e.clientY <= 5 && e.clientX >= 0) {
        setHasTriggered(true)
        setShowPopup(true)
        // Trigger shake animation after 1 second
        setTimeout(() => {
          setShouldShake(true)
        }, 1000)
      }
    }

    // Also try mouseleave event (works in Chrome/Edge)
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if delay has passed (10 seconds) and hasn't been triggered yet
      if (!delayPassed || hasTriggered) {
        return
      }
      
      if (e.clientY <= 0) {
        setHasTriggered(true)
        setShowPopup(true)
        // Trigger shake animation after 1 second
        setTimeout(() => {
          setShouldShake(true)
        }, 1000)
      }
    }

    // Listen for mouse movement
    document.addEventListener('mousemove', handleMouseMove)
    // Also listen for mouseleave (works in some browsers)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasTriggered, isAdminPage, delayPassed])

  // If on admin page, don't render anything
  if (isAdminPage) {
    return null
  }

  const handleClose = () => {
    setShowPopup(false)
    setShouldShake(false)
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-75 z-50"
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h3 className="text-3xl font-bold text-secondary-800 mb-4">
                  Before You Go...
                </h3>
                <p className="text-lg text-secondary-600 mb-8">
                  Don't miss out on our premium fireplaces! Browse our collection or get in touch for expert advice.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.a
                    href="/products"
                    onClick={handleClose}
                    className="btn-primary text-center text-lg py-3 px-6"
                    animate={shouldShake ? {
                      x: [0, -10, 10, -10, 10, -5, 5, 0, 0],
                    } : {}}
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    Browse Products
                  </motion.a>
                  <a
                    href="/contact"
                    onClick={handleClose}
                    className="btn-secondary text-center text-lg py-3 px-6"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

