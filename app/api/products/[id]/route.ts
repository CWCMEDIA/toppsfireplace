import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { generateSlug, isUUID } from '@/lib/utils'

// GET /api/products/[id] - Get single product (supports both UUID and slug)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let query = supabaseAdmin
      .from('products')
      .select('*')

    // Check if it's a UUID or a slug
    if (isUUID(params.id)) {
      query = query.eq('id', params.id)
    } else {
      query = query.eq('slug', params.id)
    }

    const { data, error } = await query.single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { id, original_price, dimensions, weight, specifications, name, in_stock, ...updateData } = body

    // Generate slug if name is being updated
    if (name) {
      updateData.slug = generateSlug(name)
    }

    // Explicitly handle original_price: set to null if undefined, otherwise use the value
    const productUpdate: any = {
      ...updateData,
      original_price: original_price === undefined || original_price === null || original_price === 0 
        ? null 
        : parseFloat(original_price),
      // Handle dimensions and weight: set to null if empty string or undefined
      dimensions: dimensions === '' || dimensions === undefined ? null : dimensions,
      weight: weight === '' || weight === undefined ? null : weight,
      // Explicitly handle in_stock: ensure it's a boolean (not undefined)
      in_stock: in_stock !== undefined ? Boolean(in_stock) : undefined,
      // CRITICAL: Always replace specifications entirely - never merge
      // If specifications is in the body, use it (even if empty object {}), otherwise keep existing
      specifications: body.specifications !== undefined ? (body.specifications || {}) : undefined,
      updated_at: new Date().toISOString()
    }

    // Remove specifications from updateData if it's undefined (don't update it)
    if (productUpdate.specifications === undefined) {
      delete productUpdate.specifications
    }

    // Determine if params.id is UUID or slug
    const isIdUUID = isUUID(params.id)
    let query = supabaseAdmin
      .from('products')
      .update(productUpdate)
    
    if (isIdUUID) {
      query = query.eq('id', params.id)
    } else {
      query = query.eq('slug', params.id)
    }

    const { data, error } = await query.select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/products/[id] - Update specific fields (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    
    // Generate slug if name is being updated
    const updateData: any = { ...body, updated_at: new Date().toISOString() }
    if (body.name) {
      updateData.slug = generateSlug(body.name)
    }
    // Explicitly ensure in_stock is a boolean if provided
    if (body.in_stock !== undefined) {
      updateData.in_stock = Boolean(body.in_stock)
    }

    // Determine if params.id is UUID or slug
    const isIdUUID = isUUID(params.id)
    let query = supabaseAdmin
      .from('products')
      .update(updateData)
    
    if (isIdUUID) {
      query = query.eq('id', params.id)
    } else {
      query = query.eq('slug', params.id)
    }

    const { data, error } = await query.select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Determine if params.id is UUID or slug
    const isIdUUID = isUUID(params.id)
    let query = supabaseAdmin
      .from('products')
      .delete()
    
    if (isIdUUID) {
      query = query.eq('id', params.id)
    } else {
      query = query.eq('slug', params.id)
    }

    const { error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
