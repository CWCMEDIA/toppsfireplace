import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { sendCustomerOrderConfirmation, sendCustomerPaymentFailed, sendClientOrderNotification } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 })
  }

  try {
    console.log('🔔 Webhook event received:', event.type, 'Event ID:', event.id)
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✅ Processing payment_intent.succeeded event...')
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        console.log('❌ Processing payment_intent.payment_failed event...')
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    console.log('✅ Webhook event processed successfully:', event.type)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Webhook received: payment_intent.succeeded for:', paymentIntent.id)
    
    // Find the order by payment intent ID with order items
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
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (error || !order) {
      console.error('❌ Order not found for payment intent:', paymentIntent.id)
      console.error('❌ Supabase error:', JSON.stringify(error, null, 2))
      console.error('❌ This means emails will NOT be sent. Order may not exist yet or payment intent ID mismatch.')
      return
    }

    console.log('✅ Found order:', order.id, 'Order number:', order.order_number)
    console.log('📝 Updating order status to paid...')
    
    // Expand payment intent to get latest charge if not already expanded
    let expandedPaymentIntent = paymentIntent
    if (!paymentIntent.latest_charge) {
      expandedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
        expand: ['latest_charge']
      })
    }

    // Get the actual net amount received (after Stripe fees) - SECURE SERVER-SIDE RETRIEVAL
    let netAmountReceived: number | null = null
    let stripeFee: number | null = null
    
    // Retry logic: Sometimes balance transaction isn't immediately available
    const maxRetries = 3
    let retryCount = 0
    
    while (netAmountReceived === null && retryCount < maxRetries) {
      try {
        // Get the charge to find the balance transaction
        const chargeToUse = expandedPaymentIntent.latest_charge || paymentIntent.latest_charge
        if (chargeToUse) {
          const chargeId = typeof chargeToUse === 'string' 
            ? chargeToUse 
            : chargeToUse.id
          
          const charge = await stripe.charges.retrieve(chargeId, {
            expand: ['balance_transaction']
          })
          
          if (charge.balance_transaction) {
            const balanceTransactionId = typeof charge.balance_transaction === 'string' 
              ? charge.balance_transaction 
              : charge.balance_transaction.id
            
            const balanceTransaction = await stripe.balanceTransactions.retrieve(balanceTransactionId)
            
            // Net amount is what you actually received (in pence, convert to pounds)
            netAmountReceived = balanceTransaction.net / 100
            // Stripe fee = gross amount - net amount
            stripeFee = (balanceTransaction.amount - balanceTransaction.net) / 100
            
            console.log('💰 Stripe fee calculation:', {
              grossAmount: order.total_amount,
              netAmountReceived: netAmountReceived,
              stripeFee: stripeFee,
              feePercentage: ((stripeFee / parseFloat(order.total_amount.toString())) * 100).toFixed(2) + '%'
            })
            break // Success, exit retry loop
          }
        } else {
          // If no charge yet, wait and retry
          retryCount++
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            // Re-fetch payment intent to get latest charge
            expandedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id, {
              expand: ['latest_charge']
            })
            console.log(`⚠️ No charge yet, retrying (attempt ${retryCount + 1}/${maxRetries})...`)
          } else {
            console.error('⚠️ No charge found after retries')
            break
          }
        }
      } catch (feeError: any) {
        retryCount++
        if (retryCount < maxRetries) {
          // Wait before retrying (balance transaction might not be ready yet)
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
          console.log(`⚠️ Retrying fee retrieval (attempt ${retryCount + 1}/${maxRetries})...`)
        } else {
          console.error('⚠️ Could not retrieve Stripe fees after retries:', feeError?.message || feeError)
          // Don't fail the webhook if fee retrieval fails - order is still valid
          break
        }
      }
    }

    // Update order with net amount and fee information
    const updateData: any = {
      payment_status: 'paid',
      status: 'processing',
      updated_at: new Date().toISOString()
    }
    
    if (netAmountReceived !== null) {
      updateData.net_amount_received = netAmountReceived
      // Store fee info in notes (or we could add a dedicated column)
      const existingNotes = order.notes ? JSON.parse(order.notes) : {}
      existingNotes.stripeFee = stripeFee
      existingNotes.netAmountReceived = netAmountReceived
      updateData.notes = JSON.stringify(existingNotes)
    }

    // Update order status (with net amount if available)
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return
    }

    // Log order items structure to verify products are included
    console.log('📦 Order items check:', {
      hasOrderItems: !!order.order_items,
      orderItemsCount: order.order_items?.length || 0,
      firstItem: order.order_items?.[0] ? {
        id: order.order_items[0].id,
        product_id: order.order_items[0].product_id,
        hasProducts: !!order.order_items[0].products,
        productName: order.order_items[0].products?.name
      } : null
    })

    // Email 2: Send payment confirmation email to customer
    try {
      if (order.customer_email) {
        console.log('📧 Sending payment confirmation email to:', order.customer_email)
        const confirmationResult = await sendCustomerOrderConfirmation(order)
        if (confirmationResult.success) {
          console.log('✅ Payment confirmation email sent successfully to:', order.customer_email)
        } else {
          console.error('❌ Payment confirmation email failed:', confirmationResult.error)
        }
      }

      // Wait 600ms to avoid Resend rate limit (2 requests per second)
      // This ensures we don't hit the rate limit when sending multiple emails
      await new Promise(resolve => setTimeout(resolve, 600))

      // Send client notification email
      console.log('📧 Sending client notification email to:', process.env.CLIENT_EMAIL || 'topsonlineshop@outlook.com')
      const clientResult = await sendClientOrderNotification(order)
      if (clientResult.success) {
        console.log('✅ Client notification email sent successfully')
      } else {
        console.error('❌ Client notification email failed:', JSON.stringify(clientResult.error, null, 2))
      }
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError)
      // Don't fail the webhook if emails fail
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Webhook received: payment_intent.payment_failed for:', paymentIntent.id)
    
    // Find the order by payment intent ID with order items
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
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    if (error || !order) {
      console.error('Order not found for payment intent:', paymentIntent.id, 'Error:', error)
      return
    }

    console.log('Found order:', order.id, 'Updating status to failed...')

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Error updating order:', updateError)
      return
    }

    console.log('✅ Order payment status updated to failed:', order.id)

    // Send payment failed email to customer
    try {
      if (order.customer_email) {
        console.log('📧 Sending payment failed email to:', order.customer_email)
        const failedEmailResult = await sendCustomerPaymentFailed(order)
        if (failedEmailResult.success) {
          console.log('✅ Payment failed email sent successfully to:', order.customer_email)
        } else {
          console.error('❌ Payment failed email failed:', failedEmailResult.error)
        }
      }
    } catch (emailError) {
      console.error('Error sending payment failed email:', emailError)
      // Don't fail the webhook if email fails
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
