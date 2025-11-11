import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { withSecurity, validateRequestBody, sanitizeInput } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse } from '@/lib/security'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// Delivery calculation: Free if subtotal > 500, otherwise £50
const DELIVERY_THRESHOLD = 500
const DELIVERY_COST = 50

async function handleCreatePaymentIntent(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize all inputs
    const sanitizedBody = sanitizeInput(body, 5000)
    const { items, customerEmail, customerName, requiresDeliveryQuote } = sanitizedBody
    
    // Validate request body
    const validation = validateRequestBody(
      sanitizedBody,
      ['items'],
      {
        items: (val) => Array.isArray(val) && val.length > 0 && val.length <= 100,
        customerEmail: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) && val.length <= 254,
        customerName: (val) => !val || (typeof val === 'string' && val.length <= 200),
        requiresDeliveryQuote: (val) => val === undefined || typeof val === 'boolean'
      }
    )
    
    if (!validation.valid) {
      return secureErrorResponse(validation.error || 'Invalid request', 400)
    }

    // Validate items structure
    for (const item of items) {
      if (!item.id || typeof item.id !== 'string' || item.id.length > 100) {
        return secureErrorResponse('Invalid item ID', 400)
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 1000) {
        return secureErrorResponse('Invalid item quantity', 400)
      }
    }

    // Customer email and name are optional - can be added later when confirming payment
    // This allows us to create payment intent early for better UX

    // SECURITY: Validate all items from database - never trust client prices
    const validatedItems = []
    let subtotal = 0

    for (const clientItem of items) {
      // Fetch product from database to get actual price and stock
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, name, price, in_stock, stock_count, status')
        .eq('id', clientItem.id)
        .single()

      if (productError || !product) {
        return secureErrorResponse('Product not found', 404)
      }

      // Check if product is active
      if (product.status !== 'active') {
        return secureErrorResponse('Product is not available', 400)
      }

      // Check stock availability
      if (!product.in_stock || (product.stock_count !== null && product.stock_count < clientItem.quantity)) {
        return secureErrorResponse('Insufficient stock', 400)
      }

      // Use database price, not client price (SECURITY)
      const actualPrice = parseFloat(product.price)
      const itemTotal = actualPrice * clientItem.quantity
      subtotal += itemTotal

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: actualPrice,
        quantity: clientItem.quantity
      })
    }

    // Calculate delivery (server-side)
    // Delivery is always FREE (£0) - regardless of address, price, or distance
    // If address is outside 20 miles, disclaimer will show but delivery is still free
    const deliveryAmount = 0
    const totalAmount = subtotal + deliveryAmount

    // Create payment intent with validated amount
    // Only allow card payments (no other payment methods)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        ...(customerEmail && { customerEmail }),
        ...(customerName && { customerName }),
        items: JSON.stringify(validatedItems),
        subtotal: subtotal.toFixed(2),
        delivery: deliveryAmount.toFixed(2),
        total: totalAmount.toFixed(2)
      },
      payment_method_types: ['card'] // Only allow card payments
    })

    return secureSuccessResponse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      validatedItems,
      subtotal,
      delivery: deliveryAmount,
      total: totalAmount
    })
  } catch (error: any) {
    // Log error server-side only
    console.error('Stripe error:', error)
    return secureErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Failed to create payment intent' 
        : error.message,
      500
    )
  }
}

// Export with security wrapper
export const POST = withSecurity(handleCreatePaymentIntent, {
  rateLimit: { maxRequests: 30, windowMs: 60000 }, // 30 requests per minute (increased for refresh tolerance)
  requireHTTPS: true,
  validateOrigin: true,
  maxBodySize: 100000 // 100KB max
})
