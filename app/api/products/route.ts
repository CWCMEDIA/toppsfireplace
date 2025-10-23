import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Product } from '@/lib/types'

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'active'

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,material.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, material, fuel_type, images, ...otherFields } = body

    // Basic validation
    if (!name || !description || !price || !category || !material || !fuel_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const productData: Partial<Product> = {
      name,
      description,
      price: parseFloat(price),
      category,
      material,
      fuel_type,
      images: images || [],
      rating: 0,
      review_count: 0,
      stock_count: 0,
      in_stock: false,
      status: 'active',
      ...otherFields
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
