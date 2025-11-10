import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

// Security: Only allow this specific key to be set
const TOUR_COMPLETION_KEY = 'admin_orders_tour_completed'
const TOUR_COMPLETION_VALUE = 'true' // Hardcoded - cannot be manipulated

// GET - Check if tour has been completed
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication - REQUIRED
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check settings table for tour completion status
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', TOUR_COMPLETION_KEY)
      .single()

    // PGRST116 = no rows returned (tour not completed)
    if (error && error.code !== 'PGRST116') {
      // Only log server-side errors, don't expose to client
      return NextResponse.json({ completed: false })
    }

    // Strict check: only 'true' string means completed
    const completed = data?.value === TOUR_COMPLETION_VALUE
    return NextResponse.json({ completed })
  } catch (error) {
    // Fail securely - return false if any error
    return NextResponse.json({ completed: false })
  }
}

// POST - Mark tour as completed
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication - REQUIRED
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Security: Ignore any request body - hardcode all values
    // This prevents any manipulation of the completion status via request body
    // The value is ALWAYS set to 'true' - no user input is accepted or processed
    
    const { data, error } = await supabaseAdmin
      .from('settings')
      .upsert({
        key: TOUR_COMPLETION_KEY,
        value: TOUR_COMPLETION_VALUE, // Always 'true' - hardcoded, cannot be manipulated
        description: 'Admin orders tour completion status',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()

    if (error) {
      return NextResponse.json({ error: 'Failed to mark tour as completed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark tour as completed' }, { status: 500 })
  }
}

// DELETE - Reset tour (remove completion status)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication - REQUIRED
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the tour completion setting
    const { error } = await supabaseAdmin
      .from('settings')
      .delete()
      .eq('key', TOUR_COMPLETION_KEY)

    if (error) {
      return NextResponse.json({ error: 'Failed to reset tour' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset tour' }, { status: 500 })
  }
}

