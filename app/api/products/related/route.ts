import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/products/related?productId=xxx - Get related products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // First, get the current product to find related ones
    const { data: currentProduct, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Find related products based on:
    // 1. Same category (highest priority)
    // 2. Same material (secondary)
    // 3. Same fuel_type (tertiary)
    // 4. Same subcategory (if available)
    // Exclude the current product
    // Only show active products

    // Build OR conditions for Supabase
    const orConditions: string[] = []
    orConditions.push(`category.eq.${currentProduct.category}`)
    orConditions.push(`material.eq.${currentProduct.material}`)
    orConditions.push(`fuel_type.eq.${currentProduct.fuel_type}`)
    
    if (currentProduct.subcategory) {
      orConditions.push(`subcategory.eq.${currentProduct.subcategory}`)
    }

    const { data: relatedProducts, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .neq('id', productId) // Exclude current product
      .eq('status', 'active') // Only active products
      .or(orConditions.join(','))
      .limit(12) // Get more than we need to sort and filter
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching related products:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort by relevance:
    // 1. Products matching both category AND material (highest priority)
    // 2. Products matching category OR material
    // 3. Products matching fuel_type
    // 4. Products matching subcategory
    const sortedProducts = (relatedProducts || [])
      .map(product => {
        let score = 0
        
        // Category match = 10 points
        if (product.category === currentProduct.category) {
          score += 10
        }
        
        // Material match = 8 points
        if (product.material === currentProduct.material) {
          score += 8
        }
        
        // Fuel type match = 5 points
        if (product.fuel_type === currentProduct.fuel_type) {
          score += 5
        }
        
        // Subcategory match = 3 points
        if (currentProduct.subcategory && product.subcategory === currentProduct.subcategory) {
          score += 3
        }
        
        return { ...product, relevanceScore: score }
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3) // Return top 3 most relevant
      .map(({ relevanceScore, ...product }) => product) // Remove score from response

    return NextResponse.json({ products: sortedProducts })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

