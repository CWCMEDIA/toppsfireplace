import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/auth'

// GET /api/brands/[id] - Get single brand
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ brand: data }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/brands/[id] - Update brand (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { name, status } = body

    const updateData: any = {}

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: 'Brand name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
      // Regenerate slug if name changes
      updateData.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    if (status !== undefined) {
      updateData.status = status
    }

    const { data, error } = await supabaseAdmin
      .from('brands')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating brand:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update brand' },
        { status: 500 }
      )
    }

    return NextResponse.json({ brand: data }, { status: 200 })
  } catch (error) {
    console.error('Error in PUT /api/brands/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/brands/[id] - Delete brand (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Check if brand is used by any products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('brand_id', params.id)
      .limit(1)

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete brand that is assigned to products. Please remove brand from products first or set brand to inactive.' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('brands')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting brand:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete brand' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Brand deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in DELETE /api/brands/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

