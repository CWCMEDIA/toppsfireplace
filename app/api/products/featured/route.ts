import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
      console.error('Error fetching featured products:', error)
      return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error in featured products API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
