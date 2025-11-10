'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  Image as ImageIcon,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  Settings,
  BarChart3
} from 'lucide-react'
import { motion } from 'framer-motion'
import ProductForm from '@/components/ProductForm'
import GalleryForm from '@/components/GalleryForm'
import AdminOrdersTour from '@/components/AdminOrdersTour'
import StripeAnalyticsCharts from '@/components/StripeAnalyticsCharts'
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
  const [activeTab, setActiveTab] = useState<'products' | 'gallery' | 'brands' | 'orders' | 'analytics'>('products')
  const [showTour, setShowTour] = useState(false)
  const [tourCompleted, setTourCompleted] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name' | 'productType' | 'paymentStatus' | 'orderStatus'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterProductType, setFilterProductType] = useState<string>('all')
  const [orderSearchTerm, setOrderSearchTerm] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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
    if (activeTab === 'orders') {
      fetchOrders()
    }
    
    // Check tour completion status on initial load
    checkTourStatus()
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const checkTourStatus = async () => {
    try {
      const response = await fetch('/api/admin/tour-status', {
        credentials: 'include',
        cache: 'no-store' // Ensure we always get fresh data
      })
      
      if (response.ok) {
        const data = await response.json()
        // Strict boolean check - only true means completed
        const isCompleted = data.completed === true
        setTourCompleted(isCompleted)
        
        // Show tour ONLY if not completed - start on "Your Orders" button
        if (!isCompleted) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            setShowTour(true)
          }, 500)
        } else {
          // Explicitly hide tour if completed
          setShowTour(false)
        }
      } else {
        // If check fails, don't show tour (safer default)
        setShowTour(false)
      }
    } catch (error) {
      // If check fails, don't show tour (safer default)
      setShowTour(false)
    }
  }

  const handleResetTour = async () => {
    try {
      const response = await fetch('/api/admin/tour-status', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setTourCompleted(false)
        // Show tour after reset
        setTimeout(() => {
          setShowTour(true)
        }, 300)
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const settingsContainer = document.getElementById('settings-menu-container')
      if (showSettingsMenu && settingsContainer && !settingsContainer.contains(target)) {
        setShowSettingsMenu(false)
      }
    }

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettingsMenu])

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

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleDeleteAllOrders = async () => {
    try {
      const response = await fetch('/api/admin/delete-all-orders', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success('All orders deleted successfully')
        setOrders([])
        setShowDeleteConfirm(false)
        // Refresh stats to update order count
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete orders')
      }
    } catch (error) {
      toast.error('Failed to delete orders')
    }
  }

  const handleBackfillFees = async () => {
    if (!confirm('This will fetch Stripe fee data for all old orders that don\'t have it yet. This may take a few minutes. Continue?')) {
      return
    }

    setOrdersLoading(true)
    try {
      toast.loading('Backfilling Stripe fees for old orders...', { id: 'backfill' })
      
      const response = await fetch('/api/admin/backfill-stripe-fees', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Backfill complete: ${data.processed} processed, ${data.failed} failed`, { id: 'backfill' })
        
        // Refresh orders to show updated data
        await fetchOrders()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to backfill fees', { id: 'backfill' })
      }
    } catch (error) {
      toast.error('Failed to backfill fees', { id: 'backfill' })
    } finally {
      setOrdersLoading(false)
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
    <div className="min-h-screen bg-secondary-50 admin-page-font">
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
            <Link href="/" className="text-secondary-600 hover:text-primary-600 transition-colors duration-200">
              return to home
            </Link>
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
            <nav className="flex justify-between items-center px-6" aria-label="Tabs">
              <div className="flex space-x-8">
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
                <button
                  onClick={() => setActiveTab('orders')}
                  data-tour="orders-tab"
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'orders'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-5 h-5" />
                    <span>Your Orders</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'analytics'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Revenue Analytics</span>
                  </div>
                </button>
              </div>
              
              {/* Settings Menu */}
              <div className="relative" id="settings-menu-container">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {/* Dropdown Menu */}
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                    <button
                      onClick={async () => {
                        setShowSettingsMenu(false)
                        await handleResetTour()
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors flex items-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset Tour</span>
                    </button>
                  </div>
                )}
              </div>
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
                <option value="cast-iron">Cast Iron</option>
                <option value="wood-mdf">Wood/MDF</option>
                <option value="gas">Gas</option>
                <option value="electric">Electric</option>
                <option value="media-wall">Media Wall</option>
                <option value="electric-suites">Electric Suites</option>
                <option value="woodburners-stoves">Woodburners/Stoves</option>
                <option value="beams">Beams</option>
                <option value="accessories">Accessories</option>
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

        {/* Orders Section */}
        {activeTab === 'orders' && (
        <div>
          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-secondary-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-800">Your Orders</h2>
                <p className="text-secondary-600">View and manage all customer orders</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchOrders}
                  data-tour="refresh"
                  className="btn-secondary flex items-center space-x-2"
                  disabled={ordersLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <div className="relative group">
                  <button
                    onClick={handleBackfillFees}
                    data-tour="backfill"
                    className="btn-secondary flex items-center space-x-2 text-sm"
                    disabled={ordersLoading}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Backfill Fees</span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-secondary-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                      If the net amount is not showing, click here to refresh fees for old orders
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-secondary-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative" data-tour="search-bar">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  placeholder="Search by order ID, customer name/email/phone, or product name..."
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {orderSearchTerm && (
                  <button
                    onClick={() => setOrderSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sorting and Filtering Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center" data-tour="sorting">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-secondary-700 whitespace-nowrap">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'name' | 'productType' | 'paymentStatus' | 'orderStatus')}
                  className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="name">Customer Name (A-Z)</option>
                  <option value="productType">Product Type</option>
                  <option value="paymentStatus">Payment Status</option>
                  <option value="orderStatus">Order Status</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
                title="Delete all orders"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete All Orders</span>
              </button>
              
              {sortBy === 'productType' && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-secondary-700 whitespace-nowrap">Product Type:</label>
                  <select
                    value={filterProductType}
                    onChange={(e) => setFilterProductType(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="limestone">Limestone Fireplaces</option>
                    <option value="marble">Marble Fireplaces</option>
                    <option value="granite">Granite Fireplaces</option>
                    <option value="travertine">Travertine Fireplaces</option>
                    <option value="cast-iron">Cast Iron Fireplaces</option>
                    <option value="wood-mdf">Wood/MDF Fireplaces</option>
                    <option value="beams">Beams</option>
                    <option value="gas">Gas Fires and Stoves</option>
                    <option value="electric">Electric Fires</option>
                    <option value="media-wall">Media Wall Fires</option>
                    <option value="electric-suites">Electric Suites</option>
                    <option value="woodburners-stoves">Woodburners/Stoves</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
              )}
            </div>
            </div>

          {ordersLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-secondary-600">Loading orders...</p>
            </div>
          ) : (
            <>
              {orders.length === 0 ? (
                <div className="p-12 text-center">
                  <Receipt className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No orders found</p>
                </div>
              ) : (
            <div className="overflow-x-auto">
              <div className="p-6 space-y-6">
                {(() => {
                  // Sort and filter orders
                  let sortedOrders = [...orders]
                  
                  // Filter by search term
                  if (orderSearchTerm.trim()) {
                    const searchLower = orderSearchTerm.toLowerCase().trim()
                    sortedOrders = sortedOrders.filter(order => {
                      // Search in order number
                      if (order.order_number?.toLowerCase().includes(searchLower)) {
                        return true
                      }
                      
                      // Search in customer name
                      if (order.customer_name?.toLowerCase().includes(searchLower)) {
                        return true
                      }
                      
                      // Search in customer email
                      if (order.customer_email?.toLowerCase().includes(searchLower)) {
                        return true
                      }
                      
                      // Search in customer phone
                      if (order.customer_phone?.toLowerCase().includes(searchLower)) {
                        return true
                      }
                      
                      // Search in product names
                      if (order.order_items?.some((item: any) => {
                        const productName = item.products?.name || ''
                        return productName.toLowerCase().includes(searchLower)
                      })) {
                        return true
                      }
                      
                      return false
                    })
                  }
                  
                  // Filter by product type if selected
                  if (filterProductType !== 'all') {
                    sortedOrders = sortedOrders.filter(order => {
                      return order.order_items?.some((item: any) => {
                        const productCategory = item.products?.category || ''
                        // Map filter values to actual category values
                        const categoryMap: { [key: string]: string[] } = {
                          'limestone': ['limestone'],
                          'marble': ['marble'],
                          'granite': ['granite'],
                          'travertine': ['travertine'],
                          'cast-iron': ['cast-iron'],
                          'wood-mdf': ['wood-mdf'],
                          'beams': ['beams'],
                          'gas': ['gas'],
                          'electric': ['electric'],
                          'media-wall': ['media-wall'],
                          'electric-suites': ['electric-suites'],
                          'woodburners-stoves': ['woodburners-stoves'],
                          'accessories': ['accessories']
                        }
                        const matchingCategories = categoryMap[filterProductType] || []
                        return matchingCategories.includes(productCategory.toLowerCase())
                      })
                    })
                  }
                  
                  // Sort orders
                  sortedOrders.sort((a, b) => {
                    let comparison = 0
                    
                    switch (sortBy) {
                      case 'date':
                        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        break
                      case 'amount':
                        comparison = parseFloat(a.total_amount.toString()) - parseFloat(b.total_amount.toString())
                        break
                      case 'name':
                        comparison = a.customer_name.localeCompare(b.customer_name)
                        break
                      case 'productType':
                        // Sort by first product's category
                        const aCategory = a.order_items?.[0]?.products?.category || ''
                        const bCategory = b.order_items?.[0]?.products?.category || ''
                        comparison = aCategory.localeCompare(bCategory)
                        break
                      case 'paymentStatus':
                        // Sort by payment status: paid > pending > failed > refunded
                        const paymentStatusOrder: { [key: string]: number } = {
                          'paid': 1,
                          'pending': 2,
                          'failed': 3,
                          'refunded': 4
                        }
                        const aPaymentStatus = paymentStatusOrder[a.payment_status] || 99
                        const bPaymentStatus = paymentStatusOrder[b.payment_status] || 99
                        comparison = aPaymentStatus - bPaymentStatus
                        // If same status, sort by date
                        if (comparison === 0) {
                          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        }
                        break
                      case 'orderStatus':
                        // Sort by order status: processing > shipped > delivered > pending > cancelled
                        const orderStatusOrder: { [key: string]: number } = {
                          'processing': 1,
                          'shipped': 2,
                          'delivered': 3,
                          'pending': 4,
                          'cancelled': 5
                        }
                        const aOrderStatus = orderStatusOrder[a.status] || 99
                        const bOrderStatus = orderStatusOrder[b.status] || 99
                        comparison = aOrderStatus - bOrderStatus
                        // If same status, sort by date
                        if (comparison === 0) {
                          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                        }
                        break
                    }
                    
                    return sortDirection === 'asc' ? comparison : -comparison
                  })
                  
                  return sortedOrders.map((order, index) => {
                  const deliveryInfo = order.notes ? JSON.parse(order.notes) : {}
                  const requiresDeliveryQuote = deliveryInfo.requiresDeliveryQuote || false
                  const deliveryDistance = deliveryInfo.deliveryDistanceMiles || null
                  
                  // Alternate background colors for better visual separation
                  const backgroundColor = index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'
                  
                  const getPaymentStatusIcon = () => {
                    switch (order.payment_status) {
                      case 'paid':
                        return <CheckCircle className="w-4 h-4 text-green-600" />
                      case 'failed':
                        return <XCircle className="w-4 h-4 text-red-600" />
                      case 'pending':
                        return <Clock className="w-4 h-4 text-yellow-600" />
                      default:
                        return <Clock className="w-4 h-4 text-secondary-400" />
                    }
                  }

                  const getPaymentStatusColor = () => {
                    switch (order.payment_status) {
                      case 'paid':
                        return 'bg-green-100 text-green-800'
                      case 'failed':
                        return 'bg-red-100 text-red-800'
                      case 'pending':
                        return 'bg-yellow-100 text-yellow-800'
                      default:
                        return 'bg-secondary-100 text-secondary-800'
                    }
                  }

                  const getOrderStatusColor = () => {
                    switch (order.status) {
                      case 'processing':
                        return 'bg-blue-100 text-blue-800'
                      case 'shipped':
                        return 'bg-purple-100 text-purple-800'
                      case 'delivered':
                        return 'bg-green-100 text-green-800'
                      case 'cancelled':
                        return 'bg-red-100 text-red-800'
                      default:
                        return 'bg-secondary-100 text-secondary-800'
                    }
                  }

                  const formatAddress = (address: any) => {
                    if (typeof address === 'string') return address
                    if (typeof address === 'object' && address !== null) {
                      const parts = []
                      if (address.line1) parts.push(address.line1)
                      if (address.line2) parts.push(address.line2)
                      if (address.city) parts.push(address.city)
                      if (address.state) parts.push(address.state)
                      if (address.postal_code) parts.push(address.postal_code)
                      if (address.country) parts.push(address.country)
                      return parts.join(', ')
                    }
                    return 'Address not provided'
                  }

                  return (
                    <div key={order.id} className={`border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow ${backgroundColor}`}>
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-secondary-200">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-secondary-800">{order.order_number}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor()}`}>
                              {getPaymentStatusIcon()}
                              <span className="ml-1 capitalize">{order.payment_status}</span>
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor()}`}>
                              <Truck className="w-3 h-3 mr-1" />
                              <span className="capitalize">{order.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary-600">
                            £{parseFloat(order.total_amount.toString()).toFixed(2)}
                          </p>
                          {(() => {
                            // Check both net_amount_received column and notes field
                            let netAmount: number | null = null
                            let stripeFee: number | null = null
                            
                            // First check the dedicated column (preferred)
                            if (order.net_amount_received) {
                              netAmount = parseFloat(order.net_amount_received.toString())
                            }
                            
                            // Then check notes (fallback for old data or if column not set)
                            if (!netAmount && order.notes) {
                              try {
                                const orderNotes = JSON.parse(order.notes)
                                if (orderNotes.netAmountReceived) {
                                  netAmount = parseFloat(orderNotes.netAmountReceived.toString())
                                }
                                if (orderNotes.stripeFee) {
                                  stripeFee = parseFloat(orderNotes.stripeFee.toString())
                                }
                              } catch (e) {
                                // Notes might not be JSON, ignore
                              }
                            }
                            
                            // If we have net amount, show it
                            if (netAmount) {
                              return (
                                <div className="mt-2 text-sm">
                                  <p className="text-secondary-600">
                                    Net: <span className="font-semibold text-green-600">£{netAmount.toFixed(2)}</span>
                                  </p>
                                  {stripeFee && (
                                    <p className="text-xs text-secondary-500">
                                      Stripe fee: £{stripeFee.toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              )
                            }
                            return null
                          })()}
                          {requiresDeliveryQuote && (
                            <p className="text-xs text-yellow-600 mt-1">
                              ⚠️ Delivery quote required {deliveryDistance ? `(${deliveryDistance.toFixed(1)} miles)` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-700 mb-2">Customer Information</h4>
                          <div className="space-y-1 text-sm text-secondary-600">
                            <p><strong>Name:</strong> {order.customer_name}</p>
                            <p><strong>Email:</strong> {order.customer_email}</p>
                            {order.customer_phone && (
                              <p><strong>Phone:</strong> {order.customer_phone}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-secondary-700 mb-2">Shipping Address</h4>
                          <p className="text-sm text-secondary-600 whitespace-pre-line">
                            {formatAddress(order.shipping_address)}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-secondary-700 mb-3">Order Items</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-secondary-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-secondary-500 uppercase">Product</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-secondary-500 uppercase">Quantity</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-secondary-500 uppercase">Unit Price</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-secondary-500 uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-200">
                              {order.order_items?.map((item: any) => (
                                <tr key={item.id} className="hover:bg-secondary-50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center space-x-3">
                                      {item.products?.images?.[0] ? (
                                        <img
                                          src={item.products.images[0]}
                                          alt={item.products.name || 'Product'}
                                          className="w-12 h-12 rounded object-cover"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded bg-secondary-100 flex items-center justify-center">
                                          <Package className="w-6 h-6 text-secondary-400" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium text-secondary-900">
                                          {item.products?.name || `Product #${item.product_id}`}
                                        </p>
                                        <p className="text-xs text-secondary-500">ID: {item.product_id}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="font-medium">{item.quantity}</span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    £{parseFloat(item.unit_price.toString()).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">
                                    £{parseFloat(item.total_price.toString()).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-secondary-50">
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                                <td className="px-4 py-2 text-right font-medium">
                                  £{parseFloat(order.subtotal.toString()).toFixed(2)}
                                </td>
                              </tr>
                              {order.shipping_amount > 0 && (
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right">Shipping:</td>
                                  <td className="px-4 py-2 text-right">
                                    £{parseFloat(order.shipping_amount.toString()).toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              {order.tax_amount > 0 && (
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right">Tax:</td>
                                  <td className="px-4 py-2 text-right">
                                    £{parseFloat(order.tax_amount.toString()).toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right font-bold text-lg">Total:</td>
                                <td className="px-4 py-2 text-right font-bold text-lg text-primary-600">
                                  £{parseFloat(order.total_amount.toString()).toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {order.stripe_payment_intent_id && (
                        <div className="text-xs text-secondary-500 mt-4 pt-4 border-t border-secondary-200">
                          <p><strong>Stripe Payment Intent:</strong> {order.stripe_payment_intent_id}</p>
                        </div>
                      )}
                    </div>
                  )
                  })
                })()}
                {/* Show message if search returns no results */}
                {orderSearchTerm.trim() && (() => {
                  // Check if search has results
                  const searchLower = orderSearchTerm.toLowerCase().trim()
                  const hasResults = orders.some(order => {
                    if (order.order_number?.toLowerCase().includes(searchLower)) return true
                    if (order.customer_name?.toLowerCase().includes(searchLower)) return true
                    if (order.customer_email?.toLowerCase().includes(searchLower)) return true
                    if (order.customer_phone?.toLowerCase().includes(searchLower)) return true
                    if (order.order_items?.some((item: any) => {
                      return (item.products?.name || '').toLowerCase().includes(searchLower)
                    })) return true
                    return false
                  })
                  return !hasResults && orders.length > 0
                })() && (
                  <div className="p-12 text-center">
                    <Search className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-600 mb-2">No orders found matching "{orderSearchTerm}"</p>
                    <button
                      onClick={() => setOrderSearchTerm('')}
                      className="text-primary-600 hover:text-primary-700 text-sm underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
              )}
            </>
          )}
        </div>
        </div>
        )}

        {/* Revenue Analytics Section */}
        {activeTab === 'analytics' && (
        <div>
          <StripeAnalyticsCharts />
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

      {/* Delete All Orders Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900">Delete All Orders</h3>
            </div>
            <p className="text-secondary-700 mb-6">
              Are you sure you want to delete <strong>all {orders.length} order{orders.length !== 1 ? 's' : ''}</strong>? This action cannot be undone. All order history will be permanently removed.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 hover:bg-secondary-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllOrders}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All Orders
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Admin Orders Tour */}
      {showTour && (
        <AdminOrdersTour
          onComplete={() => {
            setShowTour(false)
            setTourCompleted(true)
          }}
          onSwitchToOrders={() => {
            setActiveTab('orders')
          }}
        />
      )}
    </div>
  )
}
