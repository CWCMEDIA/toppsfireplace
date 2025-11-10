'use client'

/// <reference path="../../types/google-maps.d.ts" />

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { getCart, clearCart } from '@/lib/cart'
import Script from 'next/script'
import { CHECKOUT_BLOCKED, CHECKOUT_BLOCK_MESSAGE } from '@/lib/checkout-config'

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
  onOrderComplete: (orderId: string) => void
  hasOutOfStockItems?: boolean
  clientSecret?: string
  paymentIntentId?: string | null
  validatedTotals?: {
    subtotal: number
    delivery: number
    total: number
  } | null
}

interface CheckoutFormWrapperProps {
  cartItems: CartItem[]
  onOrderComplete: (orderId: string) => void
  hasOutOfStockItems?: boolean
}

function CheckoutFormWrapper({ cartItems, onOrderComplete, hasOutOfStockItems = false }: CheckoutFormWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [validatedTotals, setValidatedTotals] = useState<{
    subtotal: number
    delivery: number
    total: number
  } | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [requiresDeliveryQuote, setRequiresDeliveryQuote] = useState(false)
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Create payment intent immediately when page loads (standard practice)
  // This allows PaymentElement to render right away - no waiting for customer info
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cartItems.length === 0 || hasOutOfStockItems) {
        setIsInitializing(false)
        setInitializationError('Cart is empty or contains out-of-stock items')
        return
      }

      // Don't recreate if we already have a clientSecret
      if (clientSecret) {
        setIsInitializing(false)
        return
      }

      setIsInitializing(true)
      setInitializationError(null)

      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Include cookies for origin validation
          body: JSON.stringify({
            items: cartItems.map(item => ({
              id: item.id,
              quantity: item.quantity
            })),
            // Customer info optional - will be added when confirming payment
            customerEmail: customerEmail || undefined,
            customerName: customerName || undefined,
            requiresDeliveryQuote
          })
        })

        if (!response.ok) {
          let errorMessage = 'Failed to initialize payment. Please try again.'
          try {
            const error = await response.json()
            errorMessage = error.error || errorMessage
            console.error('Failed to initialize payment:', error)
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError)
            errorMessage = `Server error (${response.status}). Please try again.`
          }
          setInitializationError(errorMessage)
          setIsInitializing(false)
          return
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setValidatedTotals({
          subtotal: data.subtotal,
          delivery: data.delivery,
          total: data.total
        })
        setIsInitializing(false)
      } catch (error: any) {
        console.error('Error creating payment intent:', error)
        setInitializationError('Network error. Please check your connection and try again.')
        setIsInitializing(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!clientSecret) {
        setInitializationError('Checkout initialization is taking longer than expected. Please refresh the page.')
        setIsInitializing(false)
      }
    }, 30000) // 30 second timeout

    createPaymentIntent()

    return () => {
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, hasOutOfStockItems]) // Only create once when cart loads (clientSecret check prevents recreation)

  // Update totals when delivery quote status changes (but keep same payment intent)
  useEffect(() => {
    if (!clientSecret || !paymentIntentId) return

    const updateTotals = async () => {
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({
              id: item.id,
              quantity: item.quantity
            })),
            customerEmail: customerEmail || undefined,
            customerName: customerName || undefined,
            requiresDeliveryQuote
          })
        })

        if (response.ok) {
          const data = await response.json()
          setValidatedTotals({
            subtotal: data.subtotal,
            delivery: data.delivery,
            total: data.total
          })
        }
      } catch (error) {
        console.error('Error updating totals:', error)
      }
    }

    updateTotals()
  }, [requiresDeliveryQuote, clientSecret, paymentIntentId, cartItems, customerEmail, customerName])

  // Always wrap in Elements (hooks need it)
  // Only render Elements when we have clientSecret (created immediately on page load)
  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        {isInitializing ? (
          <>
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-secondary-600">Initializing secure checkout...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <p className="text-secondary-800 font-semibold mb-2">Unable to initialize checkout</p>
            <p className="text-secondary-600 mb-4">{initializationError || 'An error occurred. Please try again.'}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#ed7c3a',
            colorBackground: '#ffffff',
            colorText: '#1D1D1D',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
          labels: 'floating'
        },
      }}
    >
      <CheckoutForm
        cartItems={cartItems}
        onOrderComplete={onOrderComplete}
        hasOutOfStockItems={hasOutOfStockItems}
        clientSecret={clientSecret || undefined}
        paymentIntentId={paymentIntentId}
        validatedTotals={validatedTotals}
        onEmailChange={setCustomerEmail}
        onNameChange={setCustomerName}
        onDeliveryQuoteChange={setRequiresDeliveryQuote}
      />
    </Elements>
  )
}

// Payment section component that uses Stripe hooks (only rendered inside Elements)
function PaymentSection({ clientSecret, customerInfo, onProcessingChange }: { 
  clientSecret: string
  customerInfo: any
  onProcessingChange: (processing: boolean) => void
}) {
  const stripe = useStripe()
  const elements = useElements()

  if (!clientSecret) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-secondary-600 text-sm">Initializing secure payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-secondary-800 mb-4">Payment Information</h3>
      <div className="border border-secondary-300 rounded-lg p-4">
        <PaymentElement
          options={{
            layout: 'accordion', // Use accordion layout since we only have card payments
            wallets: {
              applePay: 'never',
              googlePay: 'never'
            }, // Disable all wallet options including Stripe Link
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  country: 'auto',
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

function CheckoutForm({ cartItems, onOrderComplete, hasOutOfStockItems = false, clientSecret, paymentIntentId: propPaymentIntentId, validatedTotals: propValidatedTotals, onEmailChange, onNameChange, onDeliveryQuoteChange }: CheckoutFormProps & { onEmailChange?: (email: string) => void, onNameChange?: (name: string) => void, onDeliveryQuoteChange?: (requires: boolean) => void }) {
  // Stripe hooks - must be called unconditionally (React rules)
  // They will return null if not inside Elements provider, which is fine
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentElementReady, setPaymentElementReady] = useState(false)
  const [deliveryCheck, setDeliveryCheck] = useState<{
    distanceMiles: number
    withinRadius: boolean
    message: string
    checking: boolean
  } | null>(null)
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
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const addressLine1Ref = useRef<HTMLInputElement>(null)
  const postalCodeRef = useRef<HTMLInputElement>(null)
  const autocompleteLine1Ref = useRef<google.maps.places.Autocomplete | null>(null)
  const autocompletePostcodeRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Small delay after clientSecret is available to ensure Elements is initialized
  useEffect(() => {
    if (clientSecret) {
      const timer = setTimeout(() => {
        setPaymentElementReady(true)
      }, 100) // 100ms delay to ensure Elements has clientSecret
      return () => clearTimeout(timer)
    } else {
      setPaymentElementReady(false)
    }
  }, [clientSecret])

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
        setGoogleMapsLoaded(true)
      }
    }
    
    // Check immediately
    checkGoogleMaps()
    
    // Also check periodically in case script loads after component mounts
    const interval = setInterval(checkGoogleMaps, 500)
    
    return () => clearInterval(interval)
  }, [])

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!googleMapsLoaded || typeof window === 'undefined' || !window.google) {
      return
    }

    // Initialize autocomplete for Address Line 1
    if (addressLine1Ref.current && !autocompleteLine1Ref.current) {
      autocompleteLine1Ref.current = new window.google.maps.places.Autocomplete(
        addressLine1Ref.current,
        {
          componentRestrictions: { country: 'gb' },
          fields: ['address_components', 'formatted_address'],
          types: ['address']
        }
      )

      autocompleteLine1Ref.current.addListener('place_changed', () => {
        const place = autocompleteLine1Ref.current?.getPlace()
        if (!place || !place.address_components) return

        // Parse address components
        const addressComponents: { [key: string]: string } = {}
        place.address_components.forEach((component) => {
          const type = component.types[0]
          if (type === 'street_number' || type === 'route') {
            addressComponents[type] = component.long_name
          } else if (type === 'locality' || type === 'postal_town') {
            addressComponents.city = component.long_name
          } else if (type === 'administrative_area_level_1') {
            addressComponents.state = component.long_name
          } else if (type === 'postal_code') {
            addressComponents.postal_code = component.long_name
          }
        })

        // Update address state
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            line1: `${addressComponents.street_number || ''} ${addressComponents.route || ''}`.trim() || prev.address.line1,
            city: addressComponents.city || prev.address.city,
            state: addressComponents.state || prev.address.state,
            postal_code: addressComponents.postal_code || prev.address.postal_code
          }
        }))
      })
    }

    // Initialize autocomplete for Postal Code
    if (postalCodeRef.current && !autocompletePostcodeRef.current) {
      autocompletePostcodeRef.current = new window.google.maps.places.Autocomplete(
        postalCodeRef.current,
        {
          componentRestrictions: { country: 'gb' },
          fields: ['address_components', 'formatted_address'],
          types: ['postal_code']
        }
      )

      autocompletePostcodeRef.current.addListener('place_changed', () => {
        const place = autocompletePostcodeRef.current?.getPlace()
        if (!place || !place.address_components) return

        // Parse address components
        const addressComponents: { [key: string]: string } = {}
        place.address_components.forEach((component) => {
          const type = component.types[0]
          if (type === 'street_number' || type === 'route') {
            addressComponents[type] = component.long_name
          } else if (type === 'locality' || type === 'postal_town') {
            addressComponents.city = component.long_name
          } else if (type === 'administrative_area_level_1') {
            addressComponents.state = component.long_name
          } else if (type === 'postal_code') {
            addressComponents.postal_code = component.long_name
          }
        })

        // Update address state
        setCustomerInfo(prev => ({
          ...prev,
          address: {
            ...prev.address,
            line1: `${addressComponents.street_number || ''} ${addressComponents.route || ''}`.trim() || prev.address.line1,
            city: addressComponents.city || prev.address.city,
            state: addressComponents.state || prev.address.state,
            postal_code: addressComponents.postal_code || prev.address.postal_code
          }
        }))
      })
    }

    return () => {
      // Cleanup
      if (autocompleteLine1Ref.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteLine1Ref.current)
      }
      if (autocompletePostcodeRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompletePostcodeRef.current)
      }
    }
  }, [googleMapsLoaded])

  // Check delivery distance when address is complete
  useEffect(() => {
    const checkDelivery = async () => {
      // Only check if we have minimum required address fields
      if (!customerInfo.address.line1 || !customerInfo.address.city || !customerInfo.address.postal_code) {
        setDeliveryCheck(null)
        return
      }

      setDeliveryCheck(prev => prev ? { ...prev, checking: true } : null)

      try {
        const response = await fetch('/api/delivery/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: customerInfo.address
          })
        })

        if (response.ok) {
          const data = await response.json()
          const withinRadius = data.withinRadius
          setDeliveryCheck({
            distanceMiles: data.distanceMiles,
            withinRadius,
            message: data.message,
            checking: false
          })
          // Notify parent to update payment intent
          onDeliveryQuoteChange?.(!withinRadius)
        } else {
          setDeliveryCheck(null)
          onDeliveryQuoteChange?.(false)
        }
      } catch (error) {
        console.error('Error checking delivery:', error)
        setDeliveryCheck(null)
      }
    }

    // Debounce the check
    const timeoutId = setTimeout(checkDelivery, 1000)
    return () => clearTimeout(timeoutId)
  }, [customerInfo.address.line1, customerInfo.address.city, customerInfo.address.postal_code, customerInfo.address.state, onDeliveryQuoteChange])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // If we don't have clientSecret, we're not inside Elements yet
    // This shouldn't happen as the submit button should be disabled, but check anyway
    if (!clientSecret) {
      toast.error('Payment system not ready. Please wait a moment.')
      return
    }

    // If we're inside Elements, stripe and elements will be available
    // If not, they'll be null and we can't proceed
    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please wait a moment.')
      return
    }
    
    // Prevent checkout if any items are out of stock
    if (hasOutOfStockItems) {
      toast.error('Cannot checkout with out of stock items. Please remove them from your cart.')
      return
    }

    if (!propValidatedTotals) {
      toast.error('Please wait for payment to initialize.')
      return
    }

    setIsProcessing(true)

    try {
      // IMPORTANT: Must call elements.submit() first to validate the form
      // This is required by Stripe Payment Element before confirmPayment
      const { error: submitError } = await elements.submit()
      
      if (submitError) {
        toast.error(submitError.message || 'Please check your payment information')
        setIsProcessing(false)
        return
      }

      // Now confirm payment using Payment Element
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
          payment_method_data: {
            billing_details: {
              name: customerInfo.name,
              email: customerInfo.email,
              phone: customerInfo.phone,
              address: {
                line1: customerInfo.address.line1,
                line2: customerInfo.address.line2,
                city: customerInfo.address.city,
                state: customerInfo.address.state,
                postal_code: customerInfo.address.postal_code,
                country: customerInfo.address.country
              }
            }
          }
        },
        redirect: 'if_required' // Only redirect if required by payment method
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order with payment_status: 'paid' since payment already succeeded
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
            items: cartItems.map(item => ({
              id: item.id,
              quantity: item.quantity
            })),
            subtotal: propValidatedTotals.subtotal,
            taxAmount: 0,
            shippingAmount: propValidatedTotals.delivery,
            discountAmount: 0,
            totalAmount: propValidatedTotals.total,
            stripePaymentIntentId: paymentIntent.id,
            requiresDeliveryQuote: deliveryCheck ? !deliveryCheck.withinRadius : false,
            deliveryDistanceMiles: deliveryCheck?.distanceMiles || null,
            paymentStatus: 'paid', // Payment already succeeded, so mark as paid immediately
            orderStatus: 'processing' // Order is ready to process
          })
        })

        if (orderResponse.ok) {
          const { order } = await orderResponse.json()
          clearCart()
          toast.success('Order placed successfully!')
          router.push(`/order-success?orderId=${order.id}`)
        } else {
          const error = await orderResponse.json()
          toast.error(error.error || 'Failed to create order')
        }
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Payment requires additional action (e.g., 3D Secure)
        // Stripe will handle the redirect automatically
        toast.info('Please complete the additional authentication step.')
      }
    } catch (error) {
      console.error('Payment error:', error)
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
              onChange={(e) => {
                setCustomerInfo(prev => ({ ...prev, name: e.target.value }))
                onNameChange?.(e.target.value)
              }}
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
              onChange={(e) => {
                setCustomerInfo(prev => ({ ...prev, email: e.target.value }))
                onEmailChange?.(e.target.value)
              }}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              required
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
        
        {/* Delivery Distance Check */}
        {deliveryCheck && (
          <div className={`mb-4 p-4 rounded-lg border ${
            deliveryCheck.withinRadius 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {deliveryCheck.checking ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-secondary-600">Checking delivery distance...</p>
              </div>
            ) : (
              <div>
                <p className={`text-sm font-medium ${
                  deliveryCheck.withinRadius ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {deliveryCheck.message}
                </p>
              </div>
            )}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Address Line 1 * <span className="text-xs text-secondary-500 font-normal">(Start typing your address or postcode for autocomplete)</span>
            </label>
            <input
              ref={addressLine1Ref}
              type="text"
              required
              value={customerInfo.address.line1}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, line1: e.target.value }
              }))}
              placeholder="Start typing your address..."
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
                Postal Code * <span className="text-xs text-secondary-500 font-normal">(Or type postcode for autocomplete)</span>
              </label>
              <input
                ref={postalCodeRef}
                type="text"
                required
                value={customerInfo.address.postal_code}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
                placeholder="Start typing postcode..."
                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment */}
      {clientSecret && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Payment Information</h3>
          <div className="border border-secondary-300 rounded-lg p-4">
            <PaymentElement
              options={{
                layout: 'accordion', // Use accordion layout since we only have card payments
                paymentMethodOrder: ['card'], // CRITICAL: Only show card - hide all other payment methods
                wallets: {
                  applePay: 'never',
                  googlePay: 'never'
                } // Disable all wallet options including Stripe Link
              }}
            />
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-secondary-800 mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cartItems.map((item) => {
            const isOutOfStock = item.in_stock === false
            return (
            <div key={item.id} className={`flex items-center justify-between ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>
              <div className="flex items-center space-x-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-secondary-900'}`}>{item.name}</p>
                  <p className="text-sm text-secondary-500">Qty: {item.quantity}</p>
                  {isOutOfStock && (
                    <p className="text-sm font-medium text-red-600 mt-1">Out of stock. Call us for more info</p>
                  )}
                </div>
              </div>
              <p className="font-medium text-secondary-900">
                £{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          )})}
          {propValidatedTotals && (
            <>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span>£{propValidatedTotals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Delivery</span>
                  <span>{propValidatedTotals.delivery === 0 ? 'Free' : `£${propValidatedTotals.delivery.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-secondary-900 pt-2 border-t">
                  <span>Total</span>
                  <span>£{propValidatedTotals.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-xs text-secondary-500 mt-2">
                * Prices verified server-side for security
              </div>
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || !clientSecret || isProcessing || hasOutOfStockItems || !propValidatedTotals}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Payment...</span>
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
  const [loadingStock, setLoadingStock] = useState(true)

  useEffect(() => {
    // Check if checkout is blocked
    if (CHECKOUT_BLOCKED) {
      toast.error(CHECKOUT_BLOCK_MESSAGE)
      router.push('/cart')
      return
    }

    // Load cart from localStorage
    const cart = getCart()
    if (cart.length === 0) {
      router.push('/cart')
      return
    }
    
    setCartItems(cart)
    
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
  }, [router])

  const handleOrderComplete = (orderId: string) => {
    // Cart is cleared in CheckoutForm after successful order
    router.push(`/order-success?orderId=${orderId}`)
  }

  // Show blocked message if checkout is disabled
  if (CHECKOUT_BLOCKED) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-secondary-800 mb-4">Checkout Temporarily Unavailable</h1>
            <p className="text-secondary-600 mb-6">{CHECKOUT_BLOCK_MESSAGE}</p>
            <button
              onClick={() => router.push('/cart')}
              className="btn-primary w-full"
            >
              Return to Cart
            </button>
          </div>
        </div>
      </div>
    )
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
    <>
      {/* Google Places API Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&region=GB`}
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== 'undefined' && window.google) {
            // Script loaded - CheckoutForm will detect this
          }
        }}
      />
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
            <CheckoutFormWrapper
              cartItems={cartItems}
              onOrderComplete={handleOrderComplete}
              hasOutOfStockItems={hasOutOfStockItems}
            />
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
    </>
  )
}

