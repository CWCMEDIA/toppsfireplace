'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check } from 'lucide-react'

interface TourStep {
  id: string
  targetSelector: string
  title: string
  description: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    id: 'orders-tab',
    targetSelector: '[data-tour="orders-tab"]',
    title: 'Your Orders',
    description: 'Welcome to your new Orders management tab! Here you can view and manage all customer orders.',
    position: 'bottom'
  },
  {
    id: 'search-bar',
    targetSelector: '[data-tour="search-bar"]',
    title: 'Search Orders',
    description: 'Here you can search by customer information, Purchase ID, or product name.',
    position: 'bottom'
  },
  {
    id: 'sorting',
    targetSelector: '[data-tour="sorting"]',
    title: 'Sort Orders',
    description: 'You can sort by product, date, customer name, payment status, and order status.',
    position: 'bottom'
  },
  {
    id: 'refresh',
    targetSelector: '[data-tour="refresh"]',
    title: 'Refresh Orders',
    description: 'Press here to live refresh orders and see the latest updates.',
    position: 'bottom'
  },
  {
    id: 'backfill',
    targetSelector: '[data-tour="backfill"]',
    title: 'Backfill Fees',
    description: 'This is a backup button. If the net price does not display, please press this to show your net price after fees.',
    position: 'top'
  }
]

interface AdminOrdersTourProps {
  onComplete: () => void
  onSwitchToOrders?: () => void
}

export default function AdminOrdersTour({ onComplete, onSwitchToOrders }: AdminOrdersTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStep < tourSteps.length) {
      const step = tourSteps[currentStep]
      
      // Small delay to ensure DOM is ready, longer delay if switching tabs
      const delay = currentStep === 1 ? 500 : 100
      const timer = setTimeout(() => {
        const element = document.querySelector(step.targetSelector) as HTMLElement
        
        if (element) {
          setTargetElement(element)
          const rect = element.getBoundingClientRect()
          setTargetRect(rect)
          
          // Scroll element into view if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
          
          // Update rect again after scroll completes
          setTimeout(() => {
            const updatedRect = element.getBoundingClientRect()
            setTargetRect(updatedRect)
          }, 300)
        } else {
          console.warn(`Tour element not found: ${step.targetSelector}`)
          // Retry after a longer delay
          setTimeout(() => {
            const retryElement = document.querySelector(step.targetSelector) as HTMLElement
            if (retryElement) {
              setTargetElement(retryElement)
              const rect = retryElement.getBoundingClientRect()
              setTargetRect(rect)
            }
          }, 500)
        }
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [currentStep])

  const handleNext = () => {
    // If on first step (orders-tab), switch to orders tab first
    if (currentStep === 0 && onSwitchToOrders) {
      onSwitchToOrders()
      // Wait a bit for tab switch, then move to next step
      setTimeout(() => {
        setCurrentStep(1)
      }, 300)
    } else if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    try {
      const response = await fetch('/api/admin/tour-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Ensure cookies are sent for authentication
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Wait a moment to ensure database write completes
          await new Promise(resolve => setTimeout(resolve, 100))
          onComplete()
        } else {
          // Still close the tour even if API call fails
          onComplete()
        }
      } else {
        // Still close the tour even if API call fails
        onComplete()
      }
    } catch (error) {
      // Still close the tour even if API call fails
      onComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  // Update target rect on scroll/resize
  useEffect(() => {
    const updateRect = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setTargetRect(rect)
      }
    }

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [targetElement])

  if (currentStep >= tourSteps.length || !targetElement || !targetRect) {
    return null
  }

  const step = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1

  // Calculate tooltip position with viewport constraints
  const tooltipStyle: React.CSSProperties = {}
  const arrowStyle: React.CSSProperties = {}
  const tooltipWidth = 384 // max-w-sm = 384px
  const tooltipHeight = 250 // approximate height
  const padding = 20

  switch (step.position) {
    case 'top':
      {
        const left = targetRect.left + targetRect.width / 2
        const bottom = window.innerHeight - targetRect.top + padding
        
        // Ensure tooltip stays in viewport
        const constrainedLeft = Math.max(
          padding,
          Math.min(left, window.innerWidth - tooltipWidth - padding)
        )
        
        tooltipStyle.bottom = bottom
        tooltipStyle.left = constrainedLeft
        tooltipStyle.transform = 'translateX(-50%)'
        tooltipStyle.maxWidth = `${tooltipWidth}px`
        
        arrowStyle.bottom = window.innerHeight - targetRect.top + padding - 12
        arrowStyle.left = left
        arrowStyle.transform = 'translateX(-50%) rotate(180deg)'
      }
      break
    case 'bottom':
    default:
      {
        const left = targetRect.left + targetRect.width / 2
        const top = targetRect.bottom + padding
        
        // Ensure tooltip stays in viewport horizontally
        const constrainedLeft = Math.max(
          padding,
          Math.min(left, window.innerWidth - tooltipWidth - padding)
        )
        
        // If tooltip would go off bottom, position above instead
        const wouldGoOffBottom = top + tooltipHeight > window.innerHeight - padding
        const finalTop = wouldGoOffBottom 
          ? targetRect.top - tooltipHeight - padding
          : top
        
        tooltipStyle.top = finalTop
        tooltipStyle.left = constrainedLeft
        tooltipStyle.transform = 'translateX(-50%)'
        tooltipStyle.maxWidth = `${tooltipWidth}px`
        
        if (wouldGoOffBottom) {
          arrowStyle.top = targetRect.top - padding + 12
          arrowStyle.transform = 'translateX(-50%)'
        } else {
          arrowStyle.top = targetRect.bottom + padding - 12
          arrowStyle.transform = 'translateX(-50%)'
        }
        arrowStyle.left = left
      }
      break
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Dark overlay with cutout for highlighted element */}
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          style={{
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${targetRect.left - 4}px 100%, 
              ${targetRect.left - 4}px ${targetRect.top - 4}px, 
              ${targetRect.right + 4}px ${targetRect.top - 4}px, 
              ${targetRect.right + 4}px ${targetRect.bottom + 4}px, 
              ${targetRect.left - 4}px ${targetRect.bottom + 4}px, 
              ${targetRect.left - 4}px 100%, 
              100% 100%, 
              100% 0%
            )`
          }}
          // Prevent closing on click - users must use Skip or Next buttons
        />

        {/* Highlighted element with neon glow line - above overlay, fully visible */}
        <motion.div
          className="absolute z-30 pointer-events-none"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            filter: 'none', // Ensure no blur on highlighted element
          }}
        >
          {/* Neon glow border effect */}
          <motion.div 
            className="absolute inset-0 rounded-lg neon-tour-border"
            animate={{
              boxShadow: [
                '0 0 10px #FCD34D, 0 0 20px #FCD34D, 0 0 30px #FCD34D, inset 0 0 10px rgba(252, 211, 77, 0.2)',
                '0 0 15px #FBBF24, 0 0 30px #FBBF24, 0 0 45px #FBBF24, inset 0 0 15px rgba(251, 191, 36, 0.3)',
                '0 0 10px #FCD34D, 0 0 20px #FCD34D, 0 0 30px #FCD34D, inset 0 0 10px rgba(252, 211, 77, 0.2)'
              ],
              borderColor: ['#FCD34D', '#FBBF24', '#FCD34D']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              border: '2px solid #FCD34D'
            }}
          />
        </motion.div>

        {/* Tooltip */}
        <motion.div
          className="absolute z-40 bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto"
          style={tooltipStyle}
          initial={{ opacity: 0, y: step.position === 'top' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: step.position === 'top' ? 20 : -20 }}
        >
          {/* Arrow */}
          <div
            className="absolute w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent border-t-white"
            style={arrowStyle}
          />

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 p-1 hover:bg-secondary-100 rounded-full transition-colors"
            aria-label="Skip tour"
          >
            <X className="w-4 h-4 text-secondary-600" />
          </button>

          {/* Content */}
          <div className="pr-6">
            <h3 className="text-lg font-bold text-secondary-900 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              {step.description}
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index <= currentStep
                        ? 'bg-primary-500 w-6'
                        : 'bg-secondary-200 w-1.5'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-secondary-500">
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-secondary-600 hover:text-secondary-800 transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="btn-primary flex items-center space-x-2 text-sm"
              >
                <span>{isLastStep ? 'Done' : 'Next'}</span>
                {isLastStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

