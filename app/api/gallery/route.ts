import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

// GET /api/gallery - Get all gallery items (public)
export async function GET(request: NextRequest) {
  try {
    const { data: galleryItems, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ gallery: galleryItems || [] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gallery - Create new gallery item (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ galleryItem: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

