import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { sendCustomerOutForDelivery, sendCustomerDelivered, sendCustomerCancelled } from '@/lib/email'
import { withSecurity, validateRequestBody, sanitizeInput } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse } from '@/lib/security'

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
async function handleUpdateOrder(request: NextRequest, params: { id: string }) {
  try {
    const body = await request.json()
    
    // Sanitize input
    const sanitizedBody = sanitizeInput(body, 2000)
    const { status, customMessage } = sanitizedBody

    // Validate request body
    const validation = validateRequestBody(
      sanitizedBody,
      ['status'],
      {
        status: (val) => typeof val === 'string' && ['pending', 'processing', 'out_for_delivery', 'shipped', 'delivered', 'cancelled'].includes(val),
        customMessage: (val) => !val || (typeof val === 'string' && val.length <= 1000)
      }
    )
    
    if (!validation.valid) {
      return secureErrorResponse(validation.error || 'Invalid status. Must be one of: pending, processing, out_for_delivery, shipped, delivered, cancelled', 400)
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
      return secureErrorResponse('Order not found', 404)
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
      return secureErrorResponse('Failed to update order', 500)
    }

    // Send emails based on status change
    if (status !== currentOrder.status) {
      try {
        // Verify we have the required customer email before sending
        if (!updatedOrder.customer_email || !updatedOrder.customer_email.includes('@')) {
          console.error('❌ Cannot send email: Invalid customer email:', updatedOrder.customer_email)
          // Don't fail the status update, just log the error
        } else {
          let emailResult
          
          if (status === 'out_for_delivery' && currentOrder.status !== 'out_for_delivery') {
            console.log('📧 Sending out for delivery email to:', updatedOrder.customer_email, 'Order:', updatedOrder.order_number)
            emailResult = await sendCustomerOutForDelivery(updatedOrder, customMessage || '')
          } else if (status === 'delivered' && currentOrder.status !== 'delivered') {
            console.log('📧 Sending delivered email to:', updatedOrder.customer_email, 'Order:', updatedOrder.order_number)
            emailResult = await sendCustomerDelivered(updatedOrder)
          } else if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
            console.log('📧 Sending cancelled email to:', updatedOrder.customer_email, 'Order:', updatedOrder.order_number)
            emailResult = await sendCustomerCancelled(updatedOrder, customMessage || '')
          }
          
          if (emailResult && !emailResult.success) {
            console.error('❌ Failed to send email:', emailResult.error)
            // Don't fail the status update if email fails, just log it
          } else if (emailResult) {
            console.log('✅ Email sent successfully')
          }
        }
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError)
        // Don't fail the status update if email fails
      }
    }

    return secureSuccessResponse({ order: updatedOrder })
  } catch (error: any) {
    return secureErrorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    (req) => handleUpdateOrder(req, params),
    {
      requireAuth: true,
      requireHTTPS: true,
      validateOrigin: true,
      maxBodySize: 5000
    }
  )(request)
}

