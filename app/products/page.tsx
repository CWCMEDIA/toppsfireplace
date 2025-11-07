'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Filter, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { Product, Brand } from '@/lib/types'
import { addToCart as addProductToCart } from '@/lib/cart'
import { isYouTubeUrl, getYouTubeEmbedUrl, extractYouTubeId } from '@/lib/youtube'
import toast from 'react-hot-toast'

// Map category IDs to their corresponding subcategory values
const categoryToSubcategoryMap: Record<string, string> = {
  'limestone': 'limestone-fireplaces',
  'marble': 'marble-fireplaces',
  'granite': 'granite-fireplaces',
  'travertine': 'travertine-fireplaces',
  'cast-iron': 'cast-iron-fireplaces',
  'wood-mdf': 'wood-mdf-fireplaces',
  'beams': 'beams',
  'gas': 'gas-fires-stoves',
  'gas-fires-stoves': 'gas-fires-stoves',
  'electric': 'electric-fires',
  'media-wall': 'media-wall-fires',
  'electric-suites': 'electric-suites',
  'woodburners-stoves': 'woodburners-stoves',
  'accessories': 'accessories'
}

const categories = [
  { id: 'all', name: 'All Products', count: 0 },
  { id: 'limestone', name: 'Limestone Fireplaces', count: 0 },
  { id: 'marble', name: 'Marble Fireplaces', count: 0 },
  { id: 'granite', name: 'Granite Fireplaces', count: 0 },
  { id: 'travertine', name: 'Travertine Fireplaces', count: 0 },
  { id: 'cast-iron', name: 'Cast Iron Fireplaces', count: 0 },
  { id: 'wood-mdf', name: 'Wood/MDF Fireplaces', count: 0 },
  { id: 'gas', name: 'Gas', count: 0 },
  { id: 'gas-fires-stoves', name: 'Gas Fires and Stoves', count: 0 },
  { id: 'beams', name: 'Beams', count: 0 },
  { id: 'electric', name: 'Electric Fires', count: 0 },
  { id: 'media-wall', name: 'Media Wall Fires', count: 0 },
  { id: 'electric-suites', name: 'Electric Suites', count: 0 },
  { id: 'woodburners-stoves', name: 'Woodburners/Stoves', count: 0 },
  { id: 'accessories', name: 'Accessories', count: 0 }
]

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [selectedFuelType, setSelectedFuelType] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    // Read search query from URL
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setSearchTerm(searchQuery)
    }
    
    // Read category from URL
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      // Validate category exists in our categories list
      const validCategory = categories.find(cat => cat.id === categoryParam)
      if (validCategory) {
        setSelectedCategory(categoryParam)
      }
    }
    
    fetchProducts()
    fetchBrands()
  }, [searchParams])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    addProductToCart(product, 1)
    toast.success('Added to cart!')
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Check category match - also check if subcategory matches the mapped subcategory value
    let matchesCategory = false
    if (selectedCategory === 'all') {
      matchesCategory = true
    } else {
      // Direct matches
      matchesCategory = product.category === selectedCategory || 
                       product.subcategory === selectedCategory
      
      // Also check if subcategory matches the mapped value for this category
      const mappedSubcategory = categoryToSubcategoryMap[selectedCategory]
      if (mappedSubcategory && product.subcategory === mappedSubcategory) {
        matchesCategory = true
      }
    }
    
    const matchesBrand = selectedBrand === 'all' || product.brand_id === selectedBrand
    
    // Fuel type matching - handle special cases
    let matchesFuelType = false
    if (selectedFuelType === 'all') {
      matchesFuelType = true
    } else if (selectedFuelType === 'fireplace') {
      // "Fireplace" matches products that are fireplaces (not beams/accessories)
      matchesFuelType = product.category !== 'beams' && 
                       product.category !== 'accessories' &&
                       product.subcategory !== 'beams' &&
                       product.subcategory !== 'accessories'
    } else if (selectedFuelType === 'beam') {
      // "Beam" matches products with beams category/subcategory
      matchesFuelType = product.category === 'beams' || 
                       product.subcategory === 'beams' ||
                       product.subcategory === 'beam'
    } else if (selectedFuelType === 'accessories') {
      // "Accessories" matches products with accessories category/subcategory
      matchesFuelType = product.category === 'accessories' || 
                       product.subcategory === 'accessories' ||
                       product.subcategory === 'accessorie'
    } else {
      // Standard fuel type matching
      matchesFuelType = product.fuel_type === selectedFuelType
    }
    
    return matchesSearch && matchesCategory && matchesBrand && matchesFuelType && product.status === 'active'
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // First, prioritize in-stock items (in_stock = true comes first)
    if (a.in_stock !== b.in_stock) {
      // Convert boolean to number: true = 1, false = 0
      // If b is in stock and a is not: 1 - 0 = 1 (b comes first)
      // If a is in stock and b is not: 0 - 1 = -1 (a comes first)
      return Number(b.in_stock) - Number(a.in_stock)
    }
    
    // If both have same stock status, apply the selected sort
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'name':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Update category counts (include both category and subcategory matches)
  const updatedCategories = categories.map(category => {
    if (category.id === 'all') {
      return {
        ...category,
        count: products.filter(p => p.status === 'active').length
      }
    }
    
    // Get the mapped subcategory value for this category
    const mappedSubcategory = categoryToSubcategoryMap[category.id]
    
    return {
      ...category,
      count: products.filter(p => 
        p.status === 'active' && 
        (p.category === category.id || 
         p.subcategory === category.id || 
         (mappedSubcategory && p.subcategory === mappedSubcategory))
      ).length
    }
  })

  // Sort categories: "All Products" first, then by count (descending), then alphabetically
  const sortedCategories = [...updatedCategories].sort((a, b) => {
    // Always keep "All Products" at the top
    if (a.id === 'all') return -1
    if (b.id === 'all') return 1
    
    // Sort by count (descending) - highest count first
    if (b.count !== a.count) {
      return b.count - a.count
    }
    
    // If counts are equal, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-16 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/newbanner.jpeg')",
            backgroundPosition: 'center 75%'
          }}
        ></div>
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="container-custom relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Range</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover our complete range of premium fireplaces, from traditional limestone to modern electric designs
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom section-padding">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-secondary-600 hover:text-secondary-800"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or material..."
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {sortedCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-primary-100 text-primary-800 font-medium'
                            : 'text-secondary-600 hover:bg-secondary-100'
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Fuel Type</h4>
                  <select
                    value={selectedFuelType}
                    onChange={(e) => setSelectedFuelType(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Fuel Types</option>
                    <option value="gas">Gas</option>
                    <option value="electric">Electric</option>
                    <option value="wood">Wood</option>
                    <option value="multi-fuel">Multi-fuel</option>
                    <option value="no-fuel">No Fuel Type</option>
                    <option value="fireplace">Fireplace</option>
                    <option value="beam">Beam</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-700 mb-3">Brands</h4>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="all">All Brands</option>
                      {brands.map((brand) => {
                        const brandProductCount = products.filter(p => p.brand_id === brand.id && p.status === 'active').length
                        if (brandProductCount === 0) return null
                        return (
                          <option key={brand.id} value={brand.id}>
                            {brand.name} ({brandProductCount})
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-medium text-secondary-700 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="name">Name A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-secondary-600">
                Showing {sortedProducts.length} of {products.filter(p => p.status === 'active').length} products
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary-600">View:</span>
                <button className="p-2 text-secondary-600 hover:text-primary-600">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden rounded-t-xl">
                    <Link href={`/products/${product.slug || product.id}`} className="block cursor-pointer">
                      <div className="aspect-w-16 aspect-h-12 bg-secondary-100">
                        {/* Check for video first (videos take priority as title media) */}
                        {product.videos && product.videos.length > 0 ? (
                          isYouTubeUrl(product.videos[0]) ? (() => {
                            const videoId = extractYouTubeId(product.videos[0])
                            const embedUrl = videoId 
                              ? `${getYouTubeEmbedUrl(product.videos[0])}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`
                              : `${getYouTubeEmbedUrl(product.videos[0])}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`
                            return (
                              <div className="w-full h-48 relative">
                                <iframe
                                  src={embedUrl}
                                  title={product.name}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ pointerEvents: 'none' }}
                                />
                              </div>
                            )
                          })() : (
                            <video
                              src={product.videos[0]}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-48 object-cover"
                            />
                          )
                        ) : product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-secondary-100 flex items-center justify-center">
                            <div className="text-secondary-400 text-center">
                              <div className="w-12 h-12 bg-secondary-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-2xl">🔥</span>
                              </div>
                              <p className="text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                    {product.badge && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-secondary-500 uppercase tracking-wide">
                        {product.material} • {product.fuel_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-secondary-900">
                          £{product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > 0 && product.original_price > product.price && (
                          <span className="text-lg text-secondary-500 line-through">
                            £{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.in_stock && (
                        <div className="text-sm text-secondary-500">
                          {product.stock_count} in stock
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {product.features && product.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-secondary-600">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!product.in_stock}
                        className="p-2 border border-secondary-300 text-secondary-600 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">No products found</h3>
                <p className="text-secondary-600 mb-4">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedBrand('all')
                    setSelectedFuelType('all')
                  }}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}