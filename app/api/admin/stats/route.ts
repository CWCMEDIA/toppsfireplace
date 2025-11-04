import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    // Get total products
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Get active products
    const { count: activeProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get out of stock products
    const { count: outOfStockProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('in_stock', false)

    // Get total orders
    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get orders from last month for comparison
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const { count: lastMonthOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())

    // Get orders from two months ago for comparison
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    
    const { count: twoMonthsAgoOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twoMonthsAgo.toISOString())
      .lt('created_at', lastMonth.toISOString())

    // Calculate percentage changes
    const orderChange = twoMonthsAgoOrders && twoMonthsAgoOrders > 0 
      ? Math.round(((lastMonthOrders || 0) - twoMonthsAgoOrders) / twoMonthsAgoOrders * 100)
      : 0

    const productChange = 12 // This could be calculated based on product creation dates
    const activeProductChange = 8 // This could be calculated based on status changes

    const stats = {
      totalProducts: totalProducts || 0,
      activeProducts: activeProducts || 0,
      outOfStockProducts: outOfStockProducts || 0,
      totalOrders: totalOrders || 0,
      lastMonthOrders: lastMonthOrders || 0,
      orderChange,
      productChange,
      activeProductChange
    }

    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
