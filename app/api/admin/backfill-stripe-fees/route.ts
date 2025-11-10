import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

// POST /api/admin/backfill-stripe-fees - Backfill Stripe fees for existing orders
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Get all paid orders that don't have net_amount_received yet
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, stripe_payment_intent_id, notes')
      .eq('payment_status', 'paid')
      .not('stripe_payment_intent_id', 'is', null)
      .is('net_amount_received', null)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ 
        message: 'No orders need backfilling',
        processed: 0,
        failed: 0
      })
    }

    console.log(`📊 Found ${orders.length} orders to backfill`)

    let processed = 0
    let failed = 0
    const errors: string[] = []

    // Process each order
    for (const order of orders) {
      try {
        if (!order.stripe_payment_intent_id) {
          console.log(`⏭️ Skipping order ${order.order_number} - no payment intent ID`)
          continue
        }

        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id)

        if (!paymentIntent.latest_charge) {
          console.log(`⏭️ Skipping order ${order.order_number} - no charge found`)
          failed++
          errors.push(`${order.order_number}: No charge found`)
          continue
        }

        // Get the charge
        const chargeId = typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge.id

        const charge = await stripe.charges.retrieve(chargeId)

        if (!charge.balance_transaction) {
          console.log(`⏭️ Skipping order ${order.order_number} - no balance transaction`)
          failed++
          errors.push(`${order.order_number}: No balance transaction`)
          continue
        }

        // Get balance transaction
        const balanceTransaction = await stripe.balanceTransactions.retrieve(
          typeof charge.balance_transaction === 'string' 
            ? charge.balance_transaction 
            : charge.balance_transaction.id
        )

        // Calculate net amount and fee
        const netAmountReceived = balanceTransaction.net / 100
        const stripeFee = (balanceTransaction.amount - balanceTransaction.net) / 100

        // Update order - save to both column and notes for compatibility
        let existingNotes: any = {}
        try {
          if (order.notes) {
            existingNotes = JSON.parse(order.notes)
          }
        } catch (e) {
          // If notes isn't valid JSON, start fresh but preserve delivery info if it exists
          console.log('Notes not valid JSON, creating new notes object')
        }
        
        // Preserve existing delivery info if it exists
        if (existingNotes.requiresDeliveryQuote !== undefined) {
          // Keep existing delivery info
        }
        
        existingNotes.stripeFee = stripeFee
        existingNotes.netAmountReceived = netAmountReceived

        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            net_amount_received: netAmountReceived,
            notes: JSON.stringify(existingNotes),
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (updateError) {
          console.error(`❌ Error updating order ${order.order_number}:`, updateError)
          failed++
          errors.push(`${order.order_number}: ${updateError.message}`)
        } else {
          console.log(`✅ Updated order ${order.order_number}: Net £${netAmountReceived.toFixed(2)}, Fee £${stripeFee.toFixed(2)}`)
          processed++
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error: any) {
        console.error(`❌ Error processing order ${order.order_number}:`, error)
        failed++
        errors.push(`${order.order_number}: ${error.message || 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      message: 'Backfill completed',
      total: orders.length,
      processed,
      failed,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to backfill fees' },
      { status: 500 }
    )
  }
}

