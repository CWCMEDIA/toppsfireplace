import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/auth'

// GET /api/brands - Get all brands (public, but only active ones)
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching brands:', error)
      return NextResponse.json(
        { error: 'Failed to fetch brands' },
        { status: 500 }
      )
    }

    return NextResponse.json({ brands: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Error in GET /api/brands:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Create new brand (Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if brand with same name or slug already exists
    const { data: existingBrand } = await supabaseAdmin
      .from('brands')
      .select('id')
      .or(`name.ilike.${name},slug.eq.${slug}`)
      .single()

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand with this name already exists' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('brands')
      .insert({
        name: name.trim(),
        slug,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating brand:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create brand' },
        { status: 500 }
      )
    }

    return NextResponse.json({ brand: data }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/brands:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

