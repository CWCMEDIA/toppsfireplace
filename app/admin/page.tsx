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
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import ProductForm from '@/components/ProductForm'
import { Product } from '@/lib/types'
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
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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

        {/* Products Section */}
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
                      {product.original_price && product.original_price > product.price && (
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
    </div>
  )
}
