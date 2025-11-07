/**
 * API Route to generate slugs for existing products
 * This can be run once to migrate all existing products
 * 
 * Usage: POST /api/admin/generate-slugs
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'
import { generateSlug } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Fetch all products without slugs
    const { data: products, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, slug')
      .or('slug.is.null,slug.eq.')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ 
        message: 'All products already have slugs',
        updated: 0 
      })
    }

    // Generate slugs and handle duplicates
    const updates: Array<{ id: string; slug: string }> = []
    const slugMap = new Map<string, number>() // Track slug usage

    for (const product of products) {
      if (!product.name) continue

      let slug = generateSlug(product.name)
      
      // Handle duplicates by appending a counter
      if (slugMap.has(slug)) {
        const count = slugMap.get(slug)! + 1
        slugMap.set(slug, count)
        slug = `${slug}-${count}`
      } else {
        slugMap.set(slug, 1)
      }

      // Check if slug already exists in database
      const { data: existing } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', slug)
        .neq('id', product.id)
        .single()

      // If slug exists, append product ID suffix
      if (existing) {
        slug = `${slug}-${product.id.substring(0, 8)}`
      }

      updates.push({ id: product.id, slug })
    }

    // Update products in batches
    let updated = 0
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ slug: update.slug, updated_at: new Date().toISOString() })
        .eq('id', update.id)

      if (!error) {
        updated++
      }
    }

    return NextResponse.json({
      message: `Successfully generated slugs for ${updated} products`,
      updated,
      total: products.length
    })
  } catch (error) {
    console.error('Error generating slugs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

