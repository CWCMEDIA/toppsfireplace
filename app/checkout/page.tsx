'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  in_stock?: boolean
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  totalAmount: number
  onOrderComplete: (orderId: string) => void
  hasOutOfStockItems?: boolean
}

function CheckoutForm({ cartItems, totalAmount, onOrderComplete, hasOutOfStockItems = false }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'GB'
    }
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return
    
    // Prevent checkout if any items are out of stock
    if (hasOutOfStockItems) {
      toast.error('Cannot checkout with out of stock items. Please remove them from your cart.')
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: cartItems,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name
        })
      })

      const { clientSecret, paymentIntentId } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address
          }
        }
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // Create order
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            shippingAddress: customerInfo.address,
            billingAddress: customerInfo.address,
            items: cartItems,
            subtotal: totalAmount,
            taxAmount: 0,
            shippingAmount: 0,
            discountAmount: 0,
            totalAmount: totalAmount,
            stripePaymentIntentId: paymentIntentId
          })
        })

        if (orderResponse.ok) {
          const { order } = await orderResponse.json()
          toast.success('Order placed successfully!')
          onOrderComplete(order.id)
        } else {
          toast.error('Failed to create order')
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Shipping Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address.line1}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, line1: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={customerInfo.address.line2}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, line2: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={customerInfo.address.city}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                State/County *
              </label>
              <input
                type="text"
                required
                value={customerInfo.address.state}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, state: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={customerInfo.address.postal_code}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Payment Information</h3>
        <div className="border border-secondary-300 rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cartItems.map((item) => {
            const isOutOfStock = item.in_stock === false
            return (
            <div key={item.id} className={`flex items-center justify-between ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-secondary-900'}`}>{item.name}</p>
                  <p className="text-sm text-secondary-500">Qty: {item.quantity}</p>
                  {isOutOfStock && (
                    <p className="text-sm font-medium text-red-600 mt-1">Out of stock. Call us for more info</p>
                  )}
                </div>
              </div>
              <p className="font-medium text-secondary-900">£{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          )})}
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold text-secondary-900">
              <span>Total</span>
              <span>£{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || hasOutOfStockItems}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Complete Order</span>
          </>
        )}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loadingStock, setLoadingStock] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartItems(cart)
      setTotalAmount(cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0))
      
      // Fetch stock status for each item
      const fetchStockStatus = async () => {
        setLoadingStock(true)
        try {
          const itemsWithStock = await Promise.all(
            cart.map(async (item: CartItem) => {
              try {
                const response = await fetch(`/api/products/${item.id}`)
                if (response.ok) {
                  const data = await response.json()
                  return { ...item, in_stock: data.product.in_stock }
                }
              } catch (error) {
                console.error(`Error fetching stock for ${item.id}:`, error)
              }
              return { ...item, in_stock: true } // Default to in stock if fetch fails
            })
          )
          setCartItems(itemsWithStock)
        } catch (error) {
          console.error('Error fetching stock status:', error)
        } finally {
          setLoadingStock(false)
        }
      }
      
      fetchStockStatus()
    } else {
      router.push('/products')
    }
  }, [router])

  const handleOrderComplete = (orderId: string) => {
    // Clear cart
    localStorage.removeItem('cart')
    // Redirect to success page
    router.push(`/order-success?orderId=${orderId}`)
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Your cart is empty</h1>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const hasOutOfStockItems = cartItems.some(item => item.in_stock === false)

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-800 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </button>
            <h1 className="text-3xl font-bold text-secondary-800">Checkout</h1>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-secondary-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2 text-secondary-600">
              <Truck className="w-5 h-5" />
              <span className="text-sm">Free Delivery (20mi)</span>
            </div>
            <div className="flex items-center space-x-2 text-secondary-600">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">SSL Encrypted</span>
            </div>
          </div>

          {/* Out of Stock Warning */}
          {hasOutOfStockItems && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium mb-2">
                Some items in your cart are out of stock. Please return to your cart to remove them or call us for more info.
              </p>
              <button
                onClick={() => router.push('/cart')}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Return to Cart
              </button>
            </div>
          )}

          {/* Checkout Form */}
          {!loadingStock && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                cartItems={cartItems}
                totalAmount={totalAmount}
                onOrderComplete={handleOrderComplete}
                hasOutOfStockItems={hasOutOfStockItems}
              />
            </Elements>
          )}
          
          {loadingStock && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-600">Checking stock availability...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
