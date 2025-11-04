import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable')
}

// Helper function to verify admin authentication
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) {
    return { isValid: false, error: 'Unauthorized' }
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    if (payload.role !== 'admin') {
      return { isValid: false, error: 'Forbidden' }
    }

    return { isValid: true }
  } catch (error: any) {
    return { isValid: false, error: 'Unauthorized' }
  }
}

// GET /api/gallery/[id] - Get single gallery item (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: galleryItem, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching gallery item:', error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (!galleryItem) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 })
    }

    return NextResponse.json({ galleryItem })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/gallery/[id] - Update gallery item (Admin only)
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
    const { title, category, type, description, location, year, images, videos, status } = body

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .update({
        title,
        category,
        type,
        description,
        location,
        year,
        images: images || [],
        videos: videos !== undefined ? (videos || []) : undefined,
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating gallery item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 })
    }

    return NextResponse.json({ galleryItem: data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/gallery/[id] - Delete gallery item (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting gallery item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

