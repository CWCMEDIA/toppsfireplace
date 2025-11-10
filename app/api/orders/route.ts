import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Order } from '@/lib/types'
import { sendCustomerPaymentProcessing, sendCustomerOrderConfirmation, sendClientOrderNotification } from '@/lib/email'
import { verifyAdmin } from '@/lib/admin-auth'
import { withSecurity, validateRequestBody, sanitizeInput } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse, isValidEmail, isValidPhone } from '@/lib/security'

const CLIENT_EMAIL = process.env.CLIENT_EMAIL || 'topsonlineshop@outlook.com'

// GET /api/orders - Get all orders (Admin only)
async function handleGetOrders(request: NextRequest) {
  try {
    // Authentication is handled by withSecurity wrapper
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          products (
            id,
            name,
            images
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return secureErrorResponse('Failed to fetch orders', 500)
    }

    return secureSuccessResponse({ orders: data })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return secureErrorResponse('Internal server error', 500)
  }
}

export const GET = withSecurity(handleGetOrders, {
  requireAuth: true,
  rateLimit: { maxRequests: 100, windowMs: 60000 },
  requireHTTPS: true,
  validateOrigin: true
})

// POST /api/orders - Create new order
async function handleCreateOrder(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize all inputs
    const sanitizedBody = sanitizeInput(body, 10000)
    const { 
      customerEmail, 
      customerName, 
      customerPhone, 
      shippingAddress, 
      billingAddress, 
      items, 
      subtotal, 
      taxAmount, 
      shippingAmount, 
      discountAmount, 
      totalAmount,
      stripePaymentIntentId,
      requiresDeliveryQuote,
      deliveryDistanceMiles,
      paymentStatus,
      orderStatus
    } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const orderData: any = {
      order_number: orderNumber,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      subtotal: subtotal,
      tax_amount: taxAmount || 0,
      shipping_amount: shippingAmount || 0,
      discount_amount: discountAmount || 0,
      total_amount: totalAmount,
      stripe_payment_intent_id: stripePaymentIntentId,
      status: orderStatus || 'pending',
      payment_status: paymentStatus || 'pending'
    }

    // Add delivery quote fields if provided (store in notes or metadata)
    if (requiresDeliveryQuote !== undefined || deliveryDistanceMiles !== null) {
      const deliveryInfo = {
        requiresDeliveryQuote: requiresDeliveryQuote || false,
        deliveryDistanceMiles: deliveryDistanceMiles || null
      }
      // Store in notes field as JSON for now (can be moved to dedicated column later)
      orderData.notes = JSON.stringify(deliveryInfo)
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // SECURITY: Validate prices from database before creating order items
    const orderItems = []
    let validatedSubtotal = 0

    for (const item of items) {
      // Fetch product to get actual price
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id, price')
        .eq('id', item.id)
        .single()

      if (productError || !product) {
        // If product not found, delete the order and return error
        await supabaseAdmin.from('orders').delete().eq('id', order.id)
        return NextResponse.json(
          { error: `Product ${item.id} not found` },
          { status: 404 }
        )
      }

      // Use database price, not client price
      const actualPrice = parseFloat(product.price)
      const itemTotal = actualPrice * item.quantity
      validatedSubtotal += itemTotal

      orderItems.push({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: actualPrice,
        total_price: itemTotal
      })
    }

    // Verify totals match (with small tolerance for rounding)
    const calculatedTotal = validatedSubtotal + (shippingAmount || 0) + (taxAmount || 0) - (discountAmount || 0)
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      // If totals don't match, delete the order and return error
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Order total mismatch. Please try again.' },
        { status: 400 }
      )
    }

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // If order items fail, delete the order
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Update product stock
    for (const item of items) {
      // First get current stock
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('stock_count')
        .eq('id', item.id)
        .single()

      if (product) {
        const newStockCount = product.stock_count - item.quantity
        await supabaseAdmin
          .from('products')
          .update({
            stock_count: newStockCount,
            in_stock: newStockCount > 0
          })
          .eq('id', item.id)
      }
    }

    // Fetch complete order with items for email
    const { data: completeOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          total_price,
          product_id,
          products (
            id,
            name,
            images
          )
        )
      `)
      .eq('id', order.id)
      .single()

    // Send Email 1: Payment Processing email (sent immediately, regardless of payment status)
    if (completeOrder && !fetchError) {
      console.log('📦 Complete order data:', {
        id: completeOrder.id,
        customer_email: completeOrder.customer_email,
        customer_name: completeOrder.customer_name,
        order_number: completeOrder.order_number,
        payment_status: completeOrder.payment_status
      })
      
      try {
        // Email 1: Send payment processing email to customer (always send this)
        if (!completeOrder.customer_email) {
          console.error('❌ No customer email found in order!')
        } else {
          console.log('📧 Sending payment processing email to:', completeOrder.customer_email)
          const processingEmailResult = await sendCustomerPaymentProcessing(completeOrder)
          if (processingEmailResult.success) {
            console.log('✅ Payment processing email sent successfully to:', completeOrder.customer_email)
          } else {
            console.error('❌ Payment processing email failed:', JSON.stringify(processingEmailResult.error, null, 2))
          }
        }
        
        // Email 2: Send confirmation email ONLY if payment is already paid
        if (completeOrder.payment_status === 'paid') {
          // Wait 600ms to avoid Resend rate limit (2 requests per second)
          // This ensures we don't hit the rate limit when sending multiple emails
          await new Promise(resolve => setTimeout(resolve, 600))
          
          console.log('📧 Payment already confirmed - sending confirmation email to:', completeOrder.customer_email)
          const confirmationEmailResult = await sendCustomerOrderConfirmation(completeOrder)
          if (confirmationEmailResult.success) {
            console.log('✅ Payment confirmation email sent successfully to:', completeOrder.customer_email)
          } else {
            console.error('❌ Payment confirmation email failed:', JSON.stringify(confirmationEmailResult.error, null, 2))
          }
          
          // Wait another 600ms before sending client email
          await new Promise(resolve => setTimeout(resolve, 600))
          
          // Also send client notification if payment is confirmed
          console.log('📧 Sending client notification email to:', CLIENT_EMAIL)
          const clientEmailResult = await sendClientOrderNotification(completeOrder)
          if (clientEmailResult.success) {
            console.log('✅ Client email sent successfully to:', CLIENT_EMAIL)
          } else {
            console.error('❌ Client email failed:', JSON.stringify(clientEmailResult.error, null, 2))
          }
        } else {
          console.log('⏳ Payment not yet confirmed - confirmation email will be sent via webhook when payment succeeds')
        }
      } catch (emailError: any) {
        // Log error but don't fail the order creation
        console.error('❌ Exception sending order emails:', emailError?.message || emailError)
        console.error('Full error:', emailError)
      }
    } else {
      console.error('❌ Cannot send emails - completeOrder:', !!completeOrder, 'fetchError:', fetchError)
    }

    return secureSuccessResponse({ order }, 201)
  } catch (error: any) {
    console.error('Create order error:', error)
    return secureErrorResponse('Internal server error', 500)
  }
}

export const POST = withSecurity(handleCreateOrder, {
  rateLimit: { maxRequests: 10, windowMs: 60000 }, // 10 orders per minute
  requireHTTPS: true,
  validateOrigin: true,
  maxBodySize: 50000 // 50KB max
})

