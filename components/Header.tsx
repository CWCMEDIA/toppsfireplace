'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, ShoppingCart, Phone, Search } from 'lucide-react'
import { getCartItemCount } from '@/lib/cart'
import { Product } from '@/lib/types'

const Header = () => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    // Initial cart count
    setCartCount(getCartItemCount())

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCartCount(getCartItemCount())
    }

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart') {
        setCartCount(getCartItemCount())
      }
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Search functionality
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch('/api/products')
        if (response.ok) {
          const data = await response.json()
          const products = data.products || []
          
          // Filter products by name/title
          const filtered = products.filter((product: Product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            product.status === 'active'
          ).slice(0, 5) // Limit to 5 results
          
          setSearchResults(filtered)
        }
      } catch (error) {
        // Silently handle error - search results will just be empty
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      searchProducts()
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`)
      setSearchTerm('')
      setIsSearchOpen(false)
    }
  }

  const handleResultClick = () => {
    setSearchTerm('')
    setIsSearchOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'Installation Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="text-white py-1.5 sm:py-2" style={{ backgroundColor: '#827977' }}>
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center text-xs sm:text-sm">
            <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
              <span className="whitespace-nowrap">•01702 510222</span>
              <span className="hidden sm:inline whitespace-nowrap">•Free Delivery (20mi)</span>
              <span className="hidden md:inline whitespace-nowrap">•Over 35 Years Experience</span>
              <span className="hidden lg:inline whitespace-nowrap">•14 Day Returns</span>
              <span className="hidden lg:inline whitespace-nowrap">•Manufactures Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 min-w-0">
            <div className="w-28 h-16 sm:w-32 sm:h-20 md:w-36 md:h-20 lg:w-40 lg:h-24 relative overflow-visible">
              <Image
                src="/tops.png"
                alt="Tops Fireplaces"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl mx-4">
            <div className="flex items-center justify-between w-full space-x-12">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary-700 hover:text-primary-600 font-medium transition-colors duration-200 text-lg px-3 py-2 rounded-lg hover:bg-primary-50"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Search and Cart */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Link
              href="/cart"
              className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200 ml-1"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4 px-4 sm:px-0">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search fireplaces, stoves, accessories..."
                className="w-full px-4 py-3 pl-10 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {searchTerm && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      onClick={handleResultClick}
                      className="flex items-center space-x-3 p-3 hover:bg-secondary-50 transition-colors border-b border-secondary-100 last:border-b-0"
                    >
                      {product.images && product.images.length > 0 ? (
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-secondary-100 rounded flex-shrink-0"></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-800 truncate">{product.name}</h4>
                        <p className="text-sm text-primary-600 font-semibold">£{product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="p-3 border-t border-secondary-200 bg-secondary-50">
                    <button
                      type="submit"
                      className="w-full text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                      View all results for "{searchTerm}"
                    </button>
                  </div>
                </div>
              )}
              
              {searchTerm && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-secondary-200 rounded-lg shadow-lg z-50 p-4">
                  <p className="text-secondary-600 text-sm">No products found matching "{searchTerm}"</p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-secondary-200 py-4 px-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary-700 hover:text-primary-600 font-medium py-2.5 px-2 transition-colors duration-200 rounded-lg hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
