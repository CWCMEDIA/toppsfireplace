'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Upload,
  Save,
  X,
  LogOut,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Star,
  Image as ImageIcon
} from 'lucide-react'
import { motion } from 'framer-motion'
import ProductForm from '@/components/ProductForm'
import GalleryForm from '@/components/GalleryForm'
import { Product, GalleryItem, Brand } from '@/lib/types'
import toast from 'react-hot-toast'

// Sample data - this would come from your database
const sampleProducts = [
  {
    id: 1,
    name: 'Classic Limestone Fireplace',
    price: 1299,
    originalPrice: 1599,
    category: 'limestone',
    subcategory: 'fireplace',
    material: 'limestone',
    fuel: 'gas',
    rating: 4.8,
    reviews: 24,
    badge: 'Best Seller',
    inStock: true,
    stockCount: 5,
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Modern Marble Electric Fire',
    price: 899,
    originalPrice: 1099,
    category: 'marble',
    subcategory: 'electric',
    material: 'marble',
    fuel: 'electric',
    rating: 4.9,
    reviews: 18,
    badge: 'New',
    inStock: true,
    stockCount: 8,
    createdAt: '2024-01-20',
    status: 'active',
  },
  {
    id: 3,
    name: 'Rustic Granite Wood Stove',
    price: 1899,
    originalPrice: 2199,
    category: 'granite',
    subcategory: 'stove',
    material: 'granite',
    fuel: 'wood',
    rating: 4.7,
    reviews: 31,
    badge: 'Premium',
    inStock: false,
    stockCount: 0,
    createdAt: '2024-01-10',
    status: 'inactive',
  },
]


export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'brands'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddGalleryItem, setShowAddGalleryItem] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalOrders: 0,
    orderChange: 0,
    productChange: 0,
    activeProductChange: 0
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If we reach this component, middleware has already verified authentication
    setIsAuthenticated(true)
    setIsLoading(false)
    fetchProducts()
    fetchGalleryItems()
    fetchBrands()
    fetchStats()
  }, [])

  useEffect(() => {
    // Check if there's an edit parameter in the URL
    const editId = searchParams.get('edit')
    if (editId && products.length > 0) {
      const productToEdit = products.find(p => p.id === editId)
      if (productToEdit) {
        setEditingProduct(productToEdit)
        setShowAddProduct(true)
      }
    }
  }, [searchParams, products])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      toast.error('Failed to fetch products')
    }
  }

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/gallery')
      const data = await response.json()
      setGalleryItems(data.gallery || [])
    } catch (error) {
      toast.error('Failed to fetch gallery items')
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (error) {
      toast.error('Failed to fetch brands')
    }
  }

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error('Brand name is required')
      return
    }

    try {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newBrandName.trim() })
      })

      if (response.ok) {
        toast.success('Brand created successfully')
        setNewBrandName('')
        setShowAddBrand(false)
        fetchBrands()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create brand')
      }
    } catch (error) {
      toast.error('Failed to create brand')
    }
  }

  const handleUpdateBrand = async (id: string, name: string, status: string) => {
    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, status })
      })

      if (response.ok) {
        toast.success('Brand updated successfully')
        setEditingBrand(null)
        fetchBrands()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to update brand')
      }
    } catch (error) {
      toast.error('Failed to update brand')
    }
  }

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Brand deleted successfully')
        fetchBrands()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete brand')
      }
    } catch (error) {
      toast.error('Failed to delete brand')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      router.push('/admin-login')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Product deleted successfully')
        fetchProducts()
        fetchStats() // Refresh stats after product deletion
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      console.log('Toggling featured for product:', id, 'to:', featured)
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured })
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Success response:', data)
        toast.success(featured ? 'Product added to featured' : 'Product removed from featured')
        fetchProducts()
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        toast.error(`Failed to update product: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Network error:', error)
      toast.error('Failed to update product')
    }
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully')
        setShowAddProduct(false)
        setEditingProduct(null)
        fetchProducts()
        fetchStats() // Refresh stats after product changes
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save product')
      }
    } catch (error) {
      toast.error('Failed to save product')
    }
  }

  const handleSaveGalleryItem = async (galleryData: Partial<GalleryItem>) => {
    try {
      const url = editingGalleryItem ? `/api/gallery/${editingGalleryItem.id}` : '/api/gallery'
      const method = editingGalleryItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(galleryData)
      })

      if (response.ok) {
        toast.success(editingGalleryItem ? 'Gallery item updated successfully' : 'Gallery item created successfully')
        setShowAddGalleryItem(false)
        setEditingGalleryItem(null)
        fetchGalleryItems()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save gallery item')
      }
    } catch (error) {
      toast.error('Failed to save gallery item')
    }
  }

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('Gallery item deleted successfully')
        fetchGalleryItems()
      } else {
        toast.error('Failed to delete gallery item')
      }
    } catch (error) {
      toast.error('Failed to delete gallery item')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const statsData = [
    { 
      name: 'Total Products', 
      value: stats.totalProducts.toString(), 
      icon: Package, 
      change: `${stats.productChange > 0 ? '+' : ''}${stats.productChange}%`, 
      changeType: stats.productChange >= 0 ? 'positive' : 'negative' 
    },
    { 
      name: 'Active Products', 
      value: stats.activeProducts.toString(), 
      icon: TrendingUp, 
      change: `${stats.activeProductChange > 0 ? '+' : ''}${stats.activeProductChange}%`, 
      changeType: stats.activeProductChange >= 0 ? 'positive' : 'negative' 
    },
    { 
      name: 'Out of Stock', 
      value: stats.outOfStockProducts.toString(), 
      icon: AlertCircle, 
      change: stats.outOfStockProducts > 0 ? `+${stats.outOfStockProducts}` : '0', 
      changeType: stats.outOfStockProducts > 0 ? 'negative' : 'positive' 
    },
    { 
      name: 'Total Orders', 
      value: stats.totalOrders.toString(), 
      icon: ShoppingCart, 
      change: `${stats.orderChange > 0 ? '+' : ''}${stats.orderChange}%`, 
      changeType: stats.orderChange >= 0 ? 'positive' : 'negative' 
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 relative">
                <Image
                  src="/tops.png"
                  alt="Tops Fireplaces"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-secondary-800">Admin Dashboard</h1>
                <p className="text-sm text-secondary-600">Tops Fireplaces Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-secondary-600 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-secondary-800 mt-2">{stat.value}</p>
                  <p className={`text-sm mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-secondary-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Products</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'gallery'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Gallery</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('brands')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'brands'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Brands</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Products Section */}
        {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-800">Products</h2>
                <p className="text-secondary-600">Manage your fireplace inventory</p>
              </div>
              <button
                onClick={() => setShowAddProduct(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="limestone">Limestone</option>
                <option value="marble">Marble</option>
                <option value="granite">Granite</option>
                <option value="travertine">Travertine</option>
                <option value="electric">Electric</option>
                <option value="cast-iron">Cast Iron</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-secondary-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{product.name}</div>
                          <div className="text-sm text-secondary-500">{product.material} • {product.fuel_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">£{product.price.toLocaleString()}</div>
                      {product.original_price && product.original_price > 0 && product.original_price > product.price && (
                        <div className="text-sm text-secondary-500 line-through">£{product.original_price.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{product.stock_count}</div>
                      <div className={`text-xs ${
                        product.in_stock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`/products/${product.id}`, '_blank')}
                          className="text-secondary-600 hover:text-secondary-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product.id, !product.featured)}
                          className={`p-1 ${
                            product.featured 
                              ? 'text-yellow-600 hover:text-yellow-900' 
                              : 'text-secondary-400 hover:text-yellow-600'
                          }`}
                          title={product.featured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Gallery Section */}
        {/* Brands Section */}
        {activeTab === 'brands' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-800">Brands</h2>
                <p className="text-secondary-600">Manage product brands</p>
              </div>
              <button
                onClick={() => {
                  setShowAddBrand(true)
                  setEditingBrand(null)
                  setNewBrandName('')
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            </div>
          </div>

          {/* Add/Edit Brand Form */}
          {(showAddBrand || editingBrand) && (
            <div className="p-6 border-b border-secondary-200 bg-secondary-50">
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={editingBrand ? editingBrand.name : newBrandName}
                    onChange={(e) => editingBrand 
                      ? setEditingBrand({...editingBrand, name: e.target.value})
                      : setNewBrandName(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Dimplex, Valor, Newman"
                  />
                </div>
                {editingBrand && (
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editingBrand.status}
                      onChange={(e) => setEditingBrand({...editingBrand, status: e.target.value as 'active' | 'inactive'})}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => editingBrand 
                      ? handleUpdateBrand(editingBrand.id, editingBrand.name, editingBrand.status)
                      : handleCreateBrand()
                    }
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBrand ? 'Update Brand' : 'Create Brand'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddBrand(false)
                      setEditingBrand(null)
                      setNewBrandName('')
                    }}
                    className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Brands Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-secondary-500">
                      No brands found. Click "Add Brand" to create one.
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => {
                    const productCount = products.filter(p => p.brand_id === brand.id).length
                    return (
                      <tr key={brand.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">{brand.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-secondary-600">{productCount} product{productCount !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingBrand(brand)
                                setShowAddBrand(false)
                              }}
                              className="text-primary-600 hover:text-primary-900 p-1"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {activeTab === 'gallery' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-800">Gallery</h2>
                <p className="text-secondary-600">Manage your project gallery</p>
              </div>
              <button
                onClick={() => setShowAddGalleryItem(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gallery Item</span>
              </button>
            </div>
          </div>

          {/* Gallery Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {galleryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 overflow-hidden bg-secondary-100">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-secondary-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{item.title}</div>
                          <div className="text-sm text-secondary-500 line-clamp-1">{item.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-900 capitalize">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-900">{item.location}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-secondary-900">{item.year}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingGalleryItem(item)}
                          className="text-primary-600 hover:text-primary-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGalleryItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {galleryItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">
                      No gallery items found. Add your first gallery item to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddProduct || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowAddProduct(false)
            setEditingProduct(null)
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* Add/Edit Gallery Item Modal */}
      {(showAddGalleryItem || editingGalleryItem) && (
        <GalleryForm
          galleryItem={editingGalleryItem}
          onClose={() => {
            setShowAddGalleryItem(false)
            setEditingGalleryItem(null)
          }}
          onSave={handleSaveGalleryItem}
        />
      )}
    </div>
  )
}
