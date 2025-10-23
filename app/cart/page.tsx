'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Truck } from 'lucide-react'
import { motion } from 'framer-motion'

// Sample cart data - this would come from your state management
const cartItems = [
  {
    id: 1,
    name: 'Classic Limestone Fireplace',
    price: 1299,
    originalPrice: 1599,
    image: '/api/placeholder/150/150',
    quantity: 1,
    material: 'limestone',
    fuel: 'gas',
  },
  {
    id: 2,
    name: 'Modern Marble Electric Fire',
    price: 899,
    originalPrice: 1099,
    image: '/api/placeholder/150/150',
    quantity: 2,
    material: 'marble',
    fuel: 'electric',
  },
]

export default function CartPage() {
  const [items, setItems] = useState(cartItems)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const savings = items.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0)
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
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-500 text-sm">Image</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-secondary-600 mb-2">{item.material} • {item.fuel}</p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">£{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-secondary-500 line-through">£{item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
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
                
                {delivery > 0 && (
                  <div className="text-sm text-secondary-600 bg-primary-50 p-3 rounded-lg">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Add £{(500 - subtotal).toFixed(2)} more for free delivery
                  </div>
                )}
                
                <div className="border-t border-secondary-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCheckingOut(true)}
                disabled={isCheckingOut}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>

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

        {/* Checkout Modal */}
        {isCheckingOut && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">Checkout Coming Soon</h3>
                <p className="text-secondary-600 mb-6">
                  We're working on our secure checkout system. For now, please call us to complete your order.
                </p>
                <div className="space-y-4">
                  <a
                    href="tel:01702510222"
                    className="btn-primary w-full text-center block"
                  >
                    Call 01702 510222
                  </a>
                  <button
                    onClick={() => setIsCheckingOut(false)}
                    className="btn-secondary w-full"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
