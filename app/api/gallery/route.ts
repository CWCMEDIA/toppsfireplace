import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable')
}

// GET /api/gallery - Get all gallery items (public)
export async function GET(request: NextRequest) {
  try {
    const { data: galleryItems, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ gallery: galleryItems || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gallery - Create new gallery item (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, category, type, description, location, year, images, videos, status } = body

    // Validate required fields
    if (!title || !category || !type || !description || !location || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, type, description, location, year' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .insert({
        title,
        category,
        type,
        description,
        location,
        year,
        images: images || [],
        videos: videos || [],
        status: status || 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating gallery item:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ galleryItem: data }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    if (error.code === 'ERR_JWT_INVALID' || error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

