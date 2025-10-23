import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Order } from '@/lib/types'

// GET /api/orders - Get all orders (Admin only)
export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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
      stripePaymentIntentId 
    } = body

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
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
        status: 'pending',
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity
    }))

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
      await supabaseAdmin
        .from('products')
        .update({
          stock_count: supabaseAdmin.raw(`stock_count - ${item.quantity}`),
          in_stock: supabaseAdmin.raw(`CASE WHEN stock_count - ${item.quantity} > 0 THEN true ELSE false END`)
        })
        .eq('id', item.id)
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
