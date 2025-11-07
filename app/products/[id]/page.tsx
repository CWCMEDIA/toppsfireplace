'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Award, 
  CheckCircle,
  ArrowLeft,
  Plus,
  Minus,
  Phone,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'
import { addToCart } from '@/lib/cart'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedMedia, setSelectedMedia] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Combine images and videos into a single media array
  const mediaItems = product ? [
    ...(product.images || []).map(img => ({ type: 'image' as const, url: img })),
    ...(product.videos || []).map(vid => ({ type: 'video' as const, url: vid }))
  ] : []

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product)
          setSelectedMedia(0) // Reset to first item when product changes
          
          // Fetch related products after product is loaded
          if (data.product) {
            fetchRelatedProducts(productId)
          }
        } else {
          setProduct(null)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    const fetchRelatedProducts = async (id: string) => {
      try {
        const response = await fetch(`/api/products/related?productId=${id}`)
        if (response.ok) {
          const data = await response.json()
          setRelatedProducts(data.products || [])
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
        setRelatedProducts([])
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden' // Prevent body scroll when lightbox is open
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  const handleNext = () => {
    setLightboxIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const handlePrevious = () => {
    setLightboxIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen || mediaItems.length === 0) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % mediaItems.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, mediaItems.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Product Not Found</h1>
          <Link href="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-secondary-600 hover:text-primary-600">Home</Link>
              <span className="text-secondary-400">/</span>
              <Link href="/products" className="text-secondary-600 hover:text-primary-600">Products</Link>
              <span className="text-secondary-400">/</span>
              <span className="text-secondary-800 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Media Gallery (Images + Videos) */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-xl overflow-hidden shadow-lg">
              {mediaItems.length > 0 ? (
                mediaItems[selectedMedia].type === 'image' ? (
                  <div 
                    onClick={() => openLightbox(selectedMedia)}
                    className="cursor-zoom-in w-full h-96 relative"
                  >
                    <Image
                      src={mediaItems[selectedMedia].url}
                      alt={product.name}
                      width={600}
                      height={400}
                      className="w-full h-96 object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={mediaItems[selectedMedia].url}
                    controls
                    className="w-full h-96 object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="w-full h-96 bg-secondary-100 flex items-center justify-center">
                  <span className="text-secondary-500 text-lg">No Media Available</span>
                </div>
              )}
            </div>
            
            {mediaItems.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {mediaItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 relative cursor-pointer ${
                      selectedMedia === index ? 'border-primary-600' : 'border-secondary-200'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <Image
                        src={item.url}
                        alt={`${product.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-20 object-contain"
                      />
                    ) : (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-20 object-contain"
                          muted
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause()
                            e.currentTarget.currentTime = 0
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.badge && (
                  <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.badge}
                  </span>
                )}
                <span className="text-sm text-secondary-600 capitalize">{product.material}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-secondary-800 mb-4">{product.name}</h1>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary-600">£{product.price.toLocaleString()}</span>
                {product.original_price && product.original_price > 0 && product.original_price > product.price && (
                  <>
                    <span className="text-xl text-secondary-500 line-through">
                      £{product.original_price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-medium">
                      Save £{(product.original_price - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              <p className="text-secondary-700 text-lg leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center space-x-6 text-sm text-secondary-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{product.in_stock ? `In Stock (${product.stock_count} available)` : 'Out of Stock'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span>Free delivery within 20 miles</span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-secondary-700">Quantity:</span>
                <div className="flex items-center border border-secondary-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-secondary-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-secondary-300 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-secondary-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (!product.in_stock) {
                      toast.error('This product is currently out of stock')
                      return
                    }
                    addToCart(product, quantity)
                    toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`)
                  }}
                  disabled={!product.in_stock}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-6 h-6 flex-shrink-0" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-800">Need help choosing?</p>
                  <p className="text-sm text-primary-600">Call us on 01702 510222 for expert advice</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-secondary-800 mb-4">Product Description</h3>
                <p className="text-secondary-700 leading-relaxed mb-6">
                  {product.long_description || product.description}
                </p>
                
                {product.features && product.features.length > 0 && (
                  <>
                    <h4 className="text-lg font-semibold text-secondary-800 mb-4">Key Features</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-secondary-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-6">Technical Specifications</h3>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-secondary-100">
                        <td className="px-6 py-4 font-medium text-secondary-800 bg-secondary-50">Material</td>
                        <td className="px-6 py-4 text-secondary-700">{product.material}</td>
                      </tr>
                      <tr className="border-b border-secondary-100">
                        <td className="px-6 py-4 font-medium text-secondary-800 bg-secondary-50">Fuel Type</td>
                        <td className="px-6 py-4 text-secondary-700">{product.fuel_type}</td>
                      </tr>
                      {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key} className="border-b border-secondary-100">
                          <td className="px-6 py-4 font-medium text-secondary-800 bg-secondary-50">
                            {key}
                          </td>
                          <td className="px-6 py-4 text-secondary-700">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-4">Shipping Information</h3>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Delivery Areas</h4>
                        <p className="text-secondary-700">Free delivery within 20 miles. Out of area delivery available please contact for further information.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Delivery Time</h4>
                        <p className="text-secondary-700">Standard delivery available. Express delivery available.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Installation</h4>
                        <p className="text-secondary-700">Professional installation service available. Contact us for a quote.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Returns</h4>
                        <p className="text-secondary-700">14 day return policy for unused items in original packaging.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-secondary-800 mb-8">You Might Also Like</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  className="card group hover:shadow-xl transition-shadow duration-300"
                >
                  <Link href={`/products/${relatedProduct.id}`}>
                    <div className="aspect-w-4 aspect-h-3 bg-secondary-100 rounded-t-xl overflow-hidden relative">
                      {relatedProduct.images && relatedProduct.images.length > 0 ? (
                        <Image
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                          <span className="text-secondary-500">Product Image</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link href={`/products/${relatedProduct.id}`}>
                      <h4 className="text-lg font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                        {relatedProduct.name}
                      </h4>
                    </Link>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary-600">£{relatedProduct.price.toLocaleString()}</span>
                        {relatedProduct.original_price && relatedProduct.original_price > 0 && relatedProduct.original_price > relatedProduct.price && (
                          <span className="text-sm text-secondary-500 line-through">
                            £{relatedProduct.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/products/${relatedProduct.id}`}
                        className="btn-primary text-sm px-4 py-2"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && mediaItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Darkened background */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation buttons */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrevious()
                }}
                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image/Video container */}
          <div
            className="relative z-10 max-w-7xl max-h-[90vh] w-full mx-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {mediaItems[lightboxIndex].type === 'image' ? (
              <Image
                src={mediaItems[lightboxIndex].url}
                alt={`${product.name} - Image ${lightboxIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[90vh] object-contain"
                priority
              />
            ) : (
              <video
                src={mediaItems[lightboxIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Image counter */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
              {lightboxIndex + 1} / {mediaItems.length}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
