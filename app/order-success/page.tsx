'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Mail, Phone, ArrowLeft, Home, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { clearCart } from '@/lib/cart'

interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
}

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    // Clear cart when order success page loads (in case it wasn't cleared during checkout)
    clearCart()

    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    // Fetch order details
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (response.ok) {
          const data = await response.json()
          const orderData = data.order
          
          // Check if order is older than 10 minutes
          const orderDate = new Date(orderData.created_at)
          const now = new Date()
          const minutesSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60)
          
          if (minutesSinceOrder > 10) {
            setIsExpired(true)
            setError('expired')
            setLoading(false)
            return
          }
          
          setOrder(orderData)
          
          // Calculate time remaining (10 minutes from order creation)
          const expirationTime = orderDate.getTime() + (10 * 60 * 1000) // 10 minutes in milliseconds
          const remaining = expirationTime - now.getTime()
          
          if (remaining > 0) {
            setTimeRemaining(Math.floor(remaining / 1000)) // Convert to seconds
          } else {
            setIsExpired(true)
            setError('expired')
          }
        } else {
          setError('Order not found')
        }
      } catch (err) {
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0) {
        setIsExpired(true)
        setError('expired')
      }
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setIsExpired(true)
          setError('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (error === 'expired' || isExpired) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-4">Page Removed for Your Security</h1>
            <p className="text-secondary-600 mb-6">
              For your security, this order confirmation page has been automatically removed after 10 minutes.
            </p>
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <p className="text-secondary-700 text-sm mb-3">
                <strong>What to do next:</strong>
              </p>
              <ul className="text-left text-secondary-600 text-sm space-y-2">
                <li className="flex items-start space-x-2">
                  <Mail className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Check your email inbox for your order confirmation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Phone className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>Contact us if you need assistance with your order</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <a
                href="tel:01702510222"
                className="btn-primary block flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Us: 01702 510222</span>
              </a>
              <a
                href="mailto:topsonlineshop@outlook.com"
                className="btn-secondary block flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email: topsonlineshop@outlook.com</span>
              </a>
              <Link href="/products" className="block text-primary-600 hover:text-primary-700 text-sm mt-4">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Order Not Found</h1>
          <p className="text-secondary-600 mb-6">{error || 'We couldn\'t find your order.'}</p>
          <div className="space-y-3">
            <Link href="/products" className="btn-primary block">
              Continue Shopping
            </Link>
            <Link href="/contact" className="btn-secondary block">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          {/* Security Timer Banner */}
          {timeRemaining !== null && timeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary-600 text-white rounded-lg p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5" />
                <span className="font-medium">For your security, this page will be removed in:</span>
              </div>
              <div className="text-2xl font-bold font-mono">
                {formatTime(timeRemaining)}
              </div>
            </motion.div>
          )}

          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-secondary-800 mb-2">Order Confirmed!</h1>
            <p className="text-lg text-secondary-600">
              Thank you for your order. We've received your payment and will process it shortly.
            </p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-secondary-600">Order Number</span>
                <span className="font-medium text-secondary-800">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Order Date</span>
                <span className="font-medium text-secondary-800">
                  {new Date(order.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Total Amount</span>
                <span className="font-bold text-primary-600 text-lg">
                  £{parseFloat(order.total_amount.toString()).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Payment Status</span>
                <span className={`font-medium ${
                  order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Order Status</span>
                <span className="font-medium text-secondary-800 capitalize">
                  {order.status}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Customer Information</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-secondary-500" />
                <span className="text-secondary-600">{order.customer_email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-secondary-500" />
                <span className="text-secondary-600">{order.customer_name}</span>
              </div>
              {order.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-600">{order.customer_phone}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-primary-50 rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">What's Next?</h2>
            <ul className="space-y-2 text-secondary-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>You'll receive an email confirmation at <strong>{order.customer_email}</strong></span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>We'll process your order and contact you to arrange delivery</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span>Free delivery within 20 miles. Out of area delivery available - we'll contact you</span>
              </li>
            </ul>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
          >
            <h2 className="text-xl font-semibold text-secondary-800 mb-4">Need Help?</h2>
            <p className="text-secondary-600 mb-4">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            <div className="space-y-2">
              <a
                href="tel:01702510222"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Phone className="w-4 h-4" />
                <span>01702 510222</span>
              </a>
              <a
                href="mailto:topsonlineshop@outlook.com"
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Mail className="w-4 h-4" />
                <span>topsonlineshop@outlook.com</span>
              </a>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/products" className="btn-primary flex-1 flex items-center justify-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link href="/contact" className="btn-secondary flex-1 flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Contact Us</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

