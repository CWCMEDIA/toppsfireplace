import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Disable caching to ensure fresh product data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
