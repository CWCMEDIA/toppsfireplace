import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  product_id: string
  products?: {
    id: string
    name: string
    images?: string[]
  }
}

interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address: string | { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }
  billing_address: string | { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  order_items?: OrderItem[]
  notes?: string
}

// Helper function to format address
function formatAddress(address: string | { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string }): string {
  // Handle null/undefined
  if (!address) {
    return 'Address not provided'
  }
  
  // If it's a string, try to parse it as JSON first (in case it's stored as JSON string)
  if (typeof address === 'string') {
    try {
      const parsed = JSON.parse(address)
      // If parsing succeeded and it's an object, format it
      if (typeof parsed === 'object' && parsed !== null) {
        return formatAddress(parsed)
      }
      // Otherwise, return the string as-is
      return address
    } catch {
      // Not JSON, return as-is
      return address
    }
  }
  
  // If it's an object, format it
  if (typeof address === 'object' && address !== null) {
    const parts = []
    if (address.line1) parts.push(address.line1)
    if (address.line2) parts.push(address.line2)
    if (address.city) parts.push(address.city)
    if (address.state) parts.push(address.state)
    if (address.postal_code) parts.push(address.postal_code)
    if (address.country) parts.push(address.country)
    return parts.join('<br>')
  }
  
  return 'Address not provided'
}

const CLIENT_EMAIL = process.env.CLIENT_EMAIL || 'topsonlineshop@outlook.com'
// Use verified domain email for production, or Resend test domain for development
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@topsfireplaces.shop'

// Email 1: Payment Processing (sent immediately when order is created)
export async function sendCustomerPaymentProcessing(order: Order) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping payment processing email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Processing - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Processing</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We're processing your payment</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your order! We've received your payment request and it's currently being processed.
            </p>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">⏱️ Processing Time</h3>
              <p style="color: #92400e; margin: 10px 0;">
                Payment processing typically takes <strong>a few minutes</strong> to complete. This can vary depending on your bank or payment method. You'll receive a confirmation email once your payment has been successfully processed.
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
              <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Payment Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Processing</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #f59e0b; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #f59e0b;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #f59e0b; color: #f59e0b;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">What Happens Next?</h3>
              <ol style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                <li style="margin: 8px 0;">We're processing your payment (usually takes a few minutes)</li>
                <li style="margin: 8px 0;">You'll receive a confirmation email once payment is successful</li>
                <li style="margin: 8px 0;">We'll prepare your order for delivery</li>
                <li style="margin: 8px 0;">You'll be contacted to arrange a convenient delivery time</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Need help? Contact us:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: 01702 510222</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: topsonlineshop@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 Payment processing email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Payment Processing - ${order.order_number}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Payment Processing - ${order.order_number}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending payment processing email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('✅ Payment processing email sent successfully to:', order.customer_email, 'Resend ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerPaymentProcessing:', error)
    return { success: false, error }
  }
}

// Email 3: Payment Failed (sent when payment fails)
export async function sendCustomerPaymentFailed(order: Order) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping payment failed email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Failed - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We couldn't process your payment</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Unfortunately, we were unable to process your payment for order <strong>${order.order_number}</strong>. Your order has not been completed.
            </p>

            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">What You Can Do</h3>
              <ol style="margin: 10px 0; padding-left: 20px; color: #991b1b;">
                <li style="margin: 8px 0;"><strong>Call us directly</strong> at <a href="tel:01702510222" style="color: #dc2626; font-weight: bold;">01702 510222</a> - we can help resolve the issue and take your order over the phone</li>
                <li style="margin: 8px 0;"><strong>Try again online</strong> - visit our shop and place your order again with a different payment method if needed</li>
                <li style="margin: 8px 0;"><strong>Check your payment details</strong> - ensure your card has sufficient funds and hasn't expired</li>
              </ol>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Payment Status:</strong> <span style="color: #dc2626; font-weight: bold;">Failed</span></p>
              <p style="margin: 10px 0;"><strong>Total Amount:</strong> £${order.total_amount.toFixed(2)}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626; color: #dc2626;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Need Help?</h3>
              <p style="color: #1e40af; margin: 10px 0;">
                We're here to help! If you're having trouble with your payment, please don't hesitate to contact us. We can take your order over the phone or help resolve any payment issues.
              </p>
              <div style="margin-top: 15px;">
                <a href="tel:01702510222" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">📞 Call Us: 01702 510222</a>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.topsfireplaces.shop'}/products" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">🛒 Try Again - Visit Shop</a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Contact us:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: <a href="tel:01702510222" style="color: #3b82f6;">01702 510222</a></p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: <a href="mailto:topsonlineshop@outlook.com" style="color: #3b82f6;">topsonlineshop@outlook.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 Payment failed email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Payment Failed - ${order.order_number}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Payment Failed - ${order.order_number}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending payment failed email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('✅ Payment failed email sent successfully to:', order.customer_email, 'Resend ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerPaymentFailed:', error)
    return { success: false, error }
  }
}

// Email 2: Payment Confirmation (sent only when payment is confirmed)
export async function sendCustomerOrderConfirmation(order: Order) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping customer email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const deliveryInfo = order.notes ? JSON.parse(order.notes) : {}
    const requiresDeliveryQuote = deliveryInfo.requiresDeliveryQuote || false
    const deliveryDistance = deliveryInfo.deliveryDistanceMiles || null

    // Log order items structure for debugging
    console.log('📧 Order confirmation email - order_items structure:', JSON.stringify(order.order_items?.map(item => ({
      id: item.id,
      product_id: item.product_id,
      hasProducts: !!item.products,
      productName: item.products?.name,
      productsObject: item.products
    })), null, 2))

    const itemsList = order.order_items?.map(item => {
      // Try multiple ways to get product name - handle different data structures
      let productName = 'Product'
      
      if (item.products?.name) {
        productName = item.products.name
      } else if ((item as any).product?.name) {
        productName = (item as any).product.name
      } else if ((item as any).name) {
        productName = (item as any).name
      } else {
        // If product name is missing, log it for debugging
        console.warn('⚠️ Product name missing for order item:', item.id, 'product_id:', item.product_id)
        productName = `Product #${item.product_id}`
      }
      
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your order</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We're excited to confirm that your order has been received and payment has been processed successfully!
            </p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #3b82f6;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">Paid</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #1e40af;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #1e40af; color: #1e40af;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">Delivery Information</h2>
              <p style="margin: 10px 0;"><strong>Shipping Address:</strong></p>
              <p style="margin: 5px 0; padding-left: 20px; color: #6b7280;">${formatAddress(order.shipping_address)}</p>
              ${requiresDeliveryQuote ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 15px; border-radius: 4px;">
                  <p style="margin: 0; color: #92400e;"><strong>Note:</strong> Your delivery address is outside our standard 20-mile radius${deliveryDistance ? ` (${deliveryDistance.toFixed(1)} miles away)` : ''}. We'll contact you shortly to arrange delivery and provide a quote.</p>
                </div>
              ` : `
                <p style="margin-top: 15px; color: #10b981;"><strong>✓</strong> Free delivery within 20 miles</p>
              `}
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li style="margin: 8px 0;">We'll process your order and prepare it for delivery</li>
                <li style="margin: 8px 0;">You'll be contacted to arrange a convenient delivery time</li>
                <li style="margin: 8px 0;">If you have any questions, please contact us at 01702 510222</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Need help? Contact us:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: 01702 510222</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: topsonlineshop@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    console.log('📧 Customer email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`
    })

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 About to send email via Resend:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      hasHtml: !!html,
      htmlLength: html?.length || 0
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_number}`,
      html
    })

    console.log('📧 Resend API response:', {
      hasData: !!data,
      hasError: !!error,
      dataId: data?.id,
      errorDetails: error ? JSON.stringify(error, null, 2) : null
    })

    if (error) {
      console.error('❌ Resend API error sending customer email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    if (!data || !data.id) {
      console.error('❌ Resend returned no data or ID - email may not have been sent!')
      console.error('❌ Resend response:', JSON.stringify({ data, error }, null, 2))
      return { success: false, error: 'No email ID returned from Resend' }
    }

    console.log('✅ Customer email sent successfully to:', order.customer_email, 'Resend ID:', data.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerOrderConfirmation:', error)
    return { success: false, error }
  }
}

export async function sendClientOrderNotification(order: Order) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping client email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const deliveryInfo = order.notes ? JSON.parse(order.notes) : {}
    const requiresDeliveryQuote = deliveryInfo.requiresDeliveryQuote || false
    const deliveryDistance = deliveryInfo.deliveryDistanceMiles || null

    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🛒 New Order Received</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Action Required</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Information</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> <span style="font-size: 18px; color: #dc2626; font-weight: bold;">${order.order_number}</span></p>
              <p style="margin: 10px 0;"><strong>Order ID:</strong> ${order.id}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p style="margin: 10px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.payment_status === 'paid' ? 'Paid' : 'Pending'}</span></p>
              <p style="margin: 10px 0;"><strong>Order Status:</strong> <span style="text-transform: capitalize;">${order.status}</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Customer Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 150px;">Customer ID:</td>
                  <td style="padding: 8px 0;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0;">${order.customer_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${order.customer_email}" style="color: #3b82f6;">${order.customer_email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;"><a href="tel:${order.customer_phone}" style="color: #3b82f6;">${order.customer_phone || 'Not provided'}</a></td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Shipping Address</h2>
              <p style="margin: 10px 0; padding: 15px; background: #f3f4f6; border-radius: 4px;">${formatAddress(order.shipping_address)}</p>
              ${requiresDeliveryQuote ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 15px; border-radius: 4px;">
                  <p style="margin: 0; color: #92400e;"><strong>⚠️ Delivery Quote Required</strong></p>
                  <p style="margin: 5px 0 0 0; color: #92400e;">Customer is outside 20-mile radius${deliveryDistance ? ` (${deliveryDistance.toFixed(1)} miles away)` : ''}. Please contact customer to arrange delivery and provide a quote.</p>
                </div>
              ` : `
                <p style="margin-top: 15px; color: #10b981;"><strong>✓</strong> Within 20-mile delivery radius - standard delivery applies</p>
              `}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626; color: #dc2626;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Next Steps</h3>
              <ol style="margin: 10px 0; padding-left: 20px; color: #92400e;">
                <li style="margin: 8px 0;">Review order details above</li>
                <li style="margin: 8px 0;">${requiresDeliveryQuote ? 'Contact customer to arrange delivery and provide quote' : 'Prepare order for delivery'}</li>
                <li style="margin: 8px 0;">Update order status in admin panel</li>
                <li style="margin: 8px 0;">Contact customer to arrange delivery time</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">This is an automated notification from your e-commerce system.</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Order ID: ${order.id} | Order Number: ${order.order_number}</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Validate CLIENT_EMAIL
    if (!CLIENT_EMAIL || !CLIENT_EMAIL.includes('@')) {
      console.error('❌ Invalid CLIENT_EMAIL address:', CLIENT_EMAIL)
      return { success: false, error: 'Invalid CLIENT_EMAIL address' }
    }

    console.log('📧 Client email details:', {
      from: FROM_EMAIL,
      to: CLIENT_EMAIL,
      subject: `🛒 New Order: ${order.order_number} - £${order.total_amount.toFixed(2)}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: CLIENT_EMAIL,
      subject: `🛒 New Order: ${order.order_number} - £${order.total_amount.toFixed(2)}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending client email:', JSON.stringify(error, null, 2))
      console.error('❌ Full error details:', error)
      return { success: false, error }
    }

    console.log('✅ Client email sent successfully to:', CLIENT_EMAIL)
    console.log('✅ Resend response data:', JSON.stringify(data, null, 2))
    console.log('✅ Resend email ID:', data?.id)
    
    if (!data?.id) {
      console.warn('⚠️ WARNING: Resend returned success but no email ID. Email may not have been sent.')
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendClientOrderNotification:', error)
    return { success: false, error }
  }
}

// Email: Out for Delivery (sent when order status changes to "out_for_delivery")
export async function sendCustomerOutForDelivery(order: Order, customMessage: string = '') {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping out for delivery email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Order is Out for Delivery - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚚 Your Order is Out for Delivery!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We're on our way</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Great news! Your order <strong>${order.order_number}</strong> is now out for delivery and on its way to you.
            </p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0;">📦 Delivery Information</h3>
              <p style="color: #065f46; margin: 10px 0;">
                Your order is currently being delivered to:
              </p>
              <p style="color: #065f46; margin: 10px 0; padding: 15px; background: white; border-radius: 4px;">
                ${formatAddress(order.shipping_address)}
              </p>
              ${customMessage ? `
                <div style="margin-top: 15px; padding: 15px; background: white; border-radius: 4px; border-left: 3px solid #10b981;">
                  <p style="color: #065f46; margin: 0; font-weight: bold;">Additional Information:</p>
                  <p style="color: #065f46; margin: 10px 0 0 0; white-space: pre-line;">${customMessage}</p>
                </div>
              ` : ''}
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Out for Delivery</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #10b981;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #10b981; color: #10b981;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">What to Expect</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
                <li style="margin: 8px 0;">Your order should arrive soon</li>
                <li style="margin: 8px 0;">Please ensure someone is available to receive the delivery</li>
                <li style="margin: 8px 0;">If you have any questions, contact us at 01702 510222</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Need help? Contact us:</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: 01702 510222</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: topsonlineshop@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 Out for delivery email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Your Order is Out for Delivery - ${order.order_number}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Your Order is Out for Delivery - ${order.order_number}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending out for delivery email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('✅ Out for delivery email sent successfully to:', order.customer_email, 'Resend ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerOutForDelivery:', error)
    return { success: false, error }
  }
}

// Email: Order Delivered (sent when order status changes to "delivered")
export async function sendCustomerDelivered(order: Order) {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping delivered email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Delivered!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your purchase</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We're delighted to confirm that your order <strong>${order.order_number}</strong> has been successfully delivered!
            </p>

            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin-top: 0;">📦 Delivered Items</h3>
              <p style="color: #065f46; margin: 10px 0;">
                Your order has been delivered to:
              </p>
              <p style="color: #065f46; margin: 10px 0; padding: 15px; background: white; border-radius: 4px;">
                ${formatAddress(order.shipping_address)}
              </p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Delivered</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">Order Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #10b981;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #10b981; color: #10b981;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Need Help?</h3>
              <p style="color: #1e40af; margin: 10px 0;">
                If you have any questions about your order, need assistance with installation, or have any concerns, we're here to help!
              </p>
              <div style="margin-top: 15px;">
                <p style="color: #1e40af; margin: 5px 0;"><strong>📞 Phone:</strong> <a href="tel:01702510222" style="color: #3b82f6; font-weight: bold;">01702 510222</a></p>
                <p style="color: #1e40af; margin: 5px 0;"><strong>✉️ Email:</strong> <a href="mailto:topsonlineshop@outlook.com" style="color: #3b82f6; font-weight: bold;">topsonlineshop@outlook.com</a></p>
              </div>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">We'd Love Your Feedback!</h3>
              <p style="color: #92400e; margin: 10px 0;">
                Your satisfaction is important to us. If you're happy with your purchase, we'd be grateful if you could leave us a review or share your experience.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Thank you for choosing Tops Fireplaces!</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: 01702 510222</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: topsonlineshop@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 Delivered email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Delivered - ${order.order_number}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Delivered - ${order.order_number}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending delivered email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('✅ Delivered email sent successfully to:', order.customer_email, 'Resend ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerDelivered:', error)
    return { success: false, error }
  }
}

// Email: Order Cancelled (sent when order status changes to "cancelled")
export async function sendCustomerCancelled(order: Order, cancellationReason: string = '') {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - skipping cancelled email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const itemsList = order.order_items?.map(item => {
      const productName = item.products?.name || 'Product'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.unit_price.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${item.total_price.toFixed(2)}</td>
        </tr>
      `
    }).join('') || ''

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancelled - ${order.order_number}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Cancelled</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We're sorry to inform you</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${order.customer_name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We regret to inform you that your order <strong>${order.order_number}</strong> has been cancelled.
            </p>

            ${cancellationReason ? `
            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">Reason for Cancellation</h3>
              <p style="color: #991b1b; margin: 10px 0; white-space: pre-line;">${cancellationReason}</p>
            </div>
            ` : ''}

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Order Details</h2>
              <p style="margin: 10px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 10px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Cancelled</span></p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #dc2626; margin-top: 0; font-size: 20px;">Cancelled Items</h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #e5e7eb;">£${order.subtotal.toFixed(2)}</td>
                  </tr>
                  ${order.shipping_amount > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Shipping:</td>
                    <td style="padding: 12px; text-align: right;">£${order.shipping_amount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626;">Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; border-top: 2px solid #dc2626; color: #dc2626;">£${order.total_amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Refund Information</h3>
              <p style="color: #1e40af; margin: 10px 0;">
                If payment was already processed, a refund will be issued to your original payment method. Refunds typically take 5-10 business days to appear in your account.
              </p>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Need Help?</h3>
              <p style="color: #1e40af; margin: 10px 0;">
                If you have any questions about this cancellation or would like to discuss alternative options, please don't hesitate to contact us.
              </p>
              <div style="margin-top: 15px;">
                <p style="color: #1e40af; margin: 5px 0;"><strong>📞 Phone:</strong> <a href="tel:01702510222" style="color: #3b82f6; font-weight: bold;">01702 510222</a></p>
                <p style="color: #1e40af; margin: 5px 0;"><strong>✉️ Email:</strong> <a href="mailto:topsonlineshop@outlook.com" style="color: #3b82f6; font-weight: bold;">topsonlineshop@outlook.com</a></p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">We apologize for any inconvenience.</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Phone: 01702 510222</p>
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">Email: topsonlineshop@outlook.com</p>
            </div>
          </div>
        </body>
      </html>
    `

    if (!order.customer_email || !order.customer_email.includes('@')) {
      console.error('❌ Invalid customer email address:', order.customer_email)
      return { success: false, error: 'Invalid email address' }
    }

    console.log('📧 Cancelled email details:', {
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Cancelled - ${order.order_number}`
    })

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: order.customer_email,
      subject: `Order Cancelled - ${order.order_number}`,
      html
    })

    if (error) {
      console.error('❌ Resend API error sending cancelled email:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    console.log('✅ Cancelled email sent successfully to:', order.customer_email, 'Resend ID:', data?.id)
    return { success: true, data }
  } catch (error) {
    console.error('Error in sendCustomerCancelled:', error)
    return { success: false, error }
  }
}

