import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { verifyAdmin } from '@/lib/admin-auth'
import { generateSlug } from '@/lib/utils'

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
      // Sanitize search input to prevent injection
      const sanitizedSearch = search.trim().replace(/[%_]/g, '')
      if (sanitizedSearch) {
        query = query.or(`name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%,material.ilike.%${sanitizedSearch}%`)
      }
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
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, material, fuel_type, images, ...otherFields } = body

    // Basic validation
    if (!name || !description || !price || !category || !material || !fuel_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Handle original_price explicitly - set to null if undefined/0/empty
    const originalPrice = otherFields.original_price && otherFields.original_price > 0
      ? parseFloat(otherFields.original_price)
      : null

    const { original_price, ...restFields } = otherFields // Remove original_price from otherFields

    // Generate slug from product name
    const slug = generateSlug(name)

    const productData: Partial<Product> = {
      name,
      slug,
      description,
      price: parseFloat(price),
      original_price: originalPrice,
      category,
      material,
      fuel_type,
      images: images || [],
      rating: 0,
      review_count: 0,
      stock_count: 0,
      in_stock: false,
      status: 'active',
      ...restFields
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
