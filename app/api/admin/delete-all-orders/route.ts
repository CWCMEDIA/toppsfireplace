import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { withSecurity } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse } from '@/lib/security'

async function handleDeleteAllOrders(request: NextRequest) {
  try {
    // Delete all order items first (due to foreign key constraint)
    // Using .gte('created_at', '1970-01-01') as a condition that's always true to delete all
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .delete()
      .gte('created_at', '1970-01-01') // Condition that's always true - deletes all

    if (itemsError) {
      return secureErrorResponse('Failed to delete order items', 500)
    }

    // Delete all orders
    const { error: ordersError } = await supabaseAdmin
      .from('orders')
      .delete()
      .gte('created_at', '1970-01-01') // Condition that's always true - deletes all

    if (ordersError) {
      return secureErrorResponse('Failed to delete orders', 500)
    }

    return secureSuccessResponse({ message: 'All orders deleted successfully' })
  } catch (error: any) {
    return secureErrorResponse('Internal server error', 500)
  }
}

export const DELETE = withSecurity(handleDeleteAllOrders, {
  requireAuth: true,
  requireHTTPS: true,
  validateOrigin: true
})

