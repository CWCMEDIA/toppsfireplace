import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { sendCustomerOutForDelivery } from '@/lib/email'

// GET /api/orders/[id] - Get single order (public, for order confirmation)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: order, error } = await supabaseAdmin
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
      .eq('id', params.id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/orders/[id] - Update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { status, customMessage } = body

    // Validate status
    const validStatuses = ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Get current order to check if we need to send email
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
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
      .eq('id', params.id)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
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
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: updateError.message || 'Failed to update order' },
        { status: 500 }
      )
    }

    // If status changed to "out_for_delivery", send email to customer
    if (status === 'out_for_delivery' && currentOrder.status !== 'out_for_delivery') {
      try {
        const emailResult = await sendCustomerOutForDelivery(updatedOrder, customMessage || '')
        if (!emailResult.success) {
          console.error('Failed to send out for delivery email:', emailResult.error)
          // Don't fail the status update if email fails, just log it
        }
      } catch (emailError) {
        console.error('Error sending out for delivery email:', emailError)
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({ order: updatedOrder }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PUT /api/orders/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

