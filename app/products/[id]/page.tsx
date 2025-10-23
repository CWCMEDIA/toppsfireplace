'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  Award, 
  CheckCircle,
  ArrowLeft,
  Plus,
  Minus,
  Phone,
  Edit
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/lib/types'

const relatedProducts = [
  {
    id: 2,
    name: 'Modern Marble Electric Fire',
    price: 899,
    originalPrice: 1099,
    image: '/api/placeholder/300/200',
    category: 'marble',
    rating: 4.9,
    reviews: 18,
  },
  {
    id: 3,
    name: 'Rustic Granite Wood Stove',
    price: 1899,
    originalPrice: 2199,
    image: '/api/placeholder/300/200',
    category: 'granite',
    rating: 4.7,
    reviews: 31,
  },
  {
    id: 4,
    name: 'Elegant Travertine Fireplace',
    price: 1599,
    originalPrice: 1899,
    image: '/api/placeholder/300/200',
    category: 'travertine',
    rating: 4.6,
    reviews: 22,
  },
]

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data.product)
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

    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.valid && data.user?.role === 'admin')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    if (productId) {
      fetchProduct()
      checkAdminStatus()
    }
  }, [productId])

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
    { id: 'reviews', label: 'Reviews' },
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
            {isAdmin && (
              <Link
                href={`/admin?edit=${product.id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Product</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 bg-white rounded-xl overflow-hidden shadow-lg">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage] || '/api/placeholder/600/400'}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-secondary-100 flex items-center justify-center">
                  <span className="text-secondary-500 text-lg">No Image Available</span>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-600' : 'border-secondary-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-20 object-cover"
                    />
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
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-secondary-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-secondary-600">
                  {product.rating || 0} ({product.review_count || 0} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary-600">£{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-xl text-secondary-500 line-through">
                      £{product.original_price}
                    </span>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-medium">
                      Save £{product.original_price - product.price}
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
                  <span>Free delivery in Essex</span>
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
                  disabled={!product.in_stock}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`btn-secondary ${isWishlisted ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="btn-secondary">
                  <Share2 className="w-5 h-5" />
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
                      {product.dimensions && (
                        <tr className="border-b border-secondary-100">
                          <td className="px-6 py-4 font-medium text-secondary-800 bg-secondary-50">Dimensions</td>
                          <td className="px-6 py-4 text-secondary-700">{product.dimensions}</td>
                        </tr>
                      )}
                      {product.weight && (
                        <tr className="border-b border-secondary-100">
                          <td className="px-6 py-4 font-medium text-secondary-800 bg-secondary-50">Weight</td>
                          <td className="px-6 py-4 text-secondary-700">{product.weight}</td>
                        </tr>
                      )}
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

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-6">Customer Reviews</h3>
                <div className="space-y-6">
                  {/* Sample reviews */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-secondary-800">Sarah Johnson</h4>
                        <p className="text-sm text-secondary-600">Benfleet</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary-700">
                      "Punctual, clean and tidy. Lovely job. Carried out efficiently with a very pleasant manner. 10/10"
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-secondary-800">Michael Chen</h4>
                        <p className="text-sm text-secondary-600">Westcliff-On-Sea</p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary-700">
                      "The service provided was first class, the workmanship excellent and we would not hesitate to recommend Tops Fireplaces. 10/10"
                    </p>
                  </div>
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
                        <p className="text-secondary-700">We deliver across Essex and Southend with free delivery on orders over £500.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Delivery Time</h4>
                        <p className="text-secondary-700">Standard delivery: 3-5 working days. Express delivery available.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Installation</h4>
                        <p className="text-secondary-700">Professional installation service available. Contact us for a quote.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-800 mb-2">Returns</h4>
                        <p className="text-secondary-700">30-day return policy for unused items in original packaging.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-secondary-800 mb-8">You Might Also Like</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                whileHover={{ scale: 1.02 }}
                className="card group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-w-4 aspect-h-3 bg-secondary-100 rounded-t-xl overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                    <span className="text-secondary-500">Product Image</span>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {relatedProduct.name}
                  </h4>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(relatedProduct.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-secondary-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-secondary-600">
                      {relatedProduct.rating} ({relatedProduct.reviews})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-primary-600">£{relatedProduct.price}</span>
                      {relatedProduct.originalPrice > relatedProduct.price && (
                        <span className="text-sm text-secondary-500 line-through">
                          £{relatedProduct.originalPrice}
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
      </div>
    </div>
  )
}
