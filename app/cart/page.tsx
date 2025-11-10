'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Truck, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { getCart, updateCartItemQuantity, removeFromCart, type CartItem } from '@/lib/cart'
import { CHECKOUT_BLOCKED, CHECKOUT_BLOCK_MESSAGE } from '@/lib/checkout-config'

interface CartItemWithStock extends CartItem {
  in_stock?: boolean
}

export default function CartPage() {
  const [items, setItems] = useState<CartItemWithStock[]>([])
  const [loadingStock, setLoadingStock] = useState(true)

  // Function to fetch stock status for cart items
  const fetchStockStatus = async (cartItems: CartItem[]) => {
    setLoadingStock(true)
    try {
      const itemsWithStock = await Promise.all(
        cartItems.map(async (item) => {
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
      setItems(itemsWithStock)
    } catch (error) {
      console.error('Error fetching stock status:', error)
    } finally {
      setLoadingStock(false)
    }
  }

  useEffect(() => {
    // Load cart from localStorage
    const cartItems = getCart()
    setItems(cartItems)
    
    // Fetch stock status for each item
    if (cartItems.length > 0) {
      fetchStockStatus(cartItems)
    } else {
      setLoadingStock(false)
    }
  }, [])

  // Listen for storage changes (in case cart is updated from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const cartItems = getCart()
      if (cartItems.length > 0) {
        fetchStockStatus(cartItems)
      } else {
        setItems([])
        setLoadingStock(false)
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event for same-tab updates
    const handleCartUpdate = () => {
      const cartItems = getCart()
      if (cartItems.length > 0) {
        fetchStockStatus(cartItems)
      } else {
        setItems([])
        setLoadingStock(false)
      }
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(id, newQuantity)
    setItems(updatedCart)
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id: string) => {
    const updatedCart = removeFromCart(id)
    setItems(updatedCart)
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const savings = items.reduce((sum, item) => {
    if (item.original_price && item.original_price > 0 && item.original_price > item.price) {
      return sum + ((item.original_price - item.price) * item.quantity)
    }
    return sum
  }, 0)
  const delivery = subtotal > 500 ? 0 : 50
  const total = subtotal + delivery

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-secondary-400" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-800 mb-4">Your Cart is Empty</h1>
          <p className="text-secondary-600 mb-8">Looks like you haven't added any fireplaces to your cart yet.</p>
          <Link href="/products" className="btn-primary text-lg px-8 py-4">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/products" className="text-secondary-600 hover:text-primary-600 transition-colors duration-200">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-secondary-800">Shopping Cart</h1>
          </div>
          <p className="text-secondary-600">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, index) => {
              const isOutOfStock = item.in_stock === false
              return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm p-6 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.slug || item.id}`} className="w-24 h-24 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-secondary-500 text-sm">Image</span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug || item.id}`}>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-1 hover:text-primary-600 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    {(item.material || item.fuel_type) && (
                      <p className="text-sm text-secondary-600 mb-2">
                        {item.material || ''}{item.material && item.fuel_type ? ' • ' : ''}{item.fuel_type || ''}
                      </p>
                    )}
                    
                    {isOutOfStock && (
                      <p className="text-sm font-medium text-red-600 mb-2">
                        Out of stock. Call us for more info
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isOutOfStock}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isOutOfStock}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">£{item.price.toLocaleString()}</span>
                        {item.original_price && item.original_price > 0 && item.original_price > item.price && (
                          <span className="text-sm text-secondary-500 line-through">£{item.original_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2 transition-colors"
                    title="Remove from cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )})}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Subtotal</span>
                  <span className="font-medium">£{subtotal.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span className="font-medium">£{savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-secondary-600">Delivery</span>
                  <span className="font-medium">
                    {delivery === 0 ? 'Free' : `£${delivery.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="text-sm text-secondary-600 bg-primary-50 p-3 rounded-lg">
                  <Truck className="w-4 h-4 inline mr-1" />
                  Free delivery within 20 miles. Out of area delivery available - please contact for further information.
                </div>
                
                <div className="border-t border-secondary-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {items.some(item => item.in_stock === false) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    Some items in your cart are out of stock. Please remove them or call us for more info.
                  </p>
                </div>
              )}

              {CHECKOUT_BLOCKED && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">Checkout Temporarily Unavailable</p>
                      <p className="text-xs text-yellow-700">{CHECKOUT_BLOCK_MESSAGE}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {CHECKOUT_BLOCKED ? (
                <button
                  disabled
                  className="w-full bg-secondary-300 text-secondary-500 text-lg py-4 flex items-center justify-center space-x-2 cursor-not-allowed rounded-lg"
                >
                  <Shield className="w-5 h-5" />
                  <span>Checkout Unavailable</span>
                </button>
              ) : (
                <Link
                  href="/checkout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    if (items.some(item => item.in_stock === false) || loadingStock) {
                      e.preventDefault()
                    }
                  }}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Proceed to Checkout</span>
                </Link>
              )}

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-primary-600 hover:text-primary-700">
                  Continue Shopping
                </Link>
              </div>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <div className="flex items-center justify-center space-x-4 text-xs text-secondary-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>SSL Encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
