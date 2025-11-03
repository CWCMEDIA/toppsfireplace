'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingCart, Phone, Search } from 'lucide-react'
import { getCartItemCount } from '@/lib/cart'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

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

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Fireplaces', href: '/products' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                01702 510222
              </span>
              <span>|</span>
              <span>Free delivery across Essex</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Est. 1988</span>
              <span>|</span>
              <span>Expert Installation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/tops.png"
                alt="Tops Fireplaces"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-secondary-800">Tops Fireplaces</h1>
              <p className="text-sm text-secondary-600">Quality Fireplaces in Essex</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center flex-1 max-w-2xl">
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/cart"
              className="relative p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-secondary-600 hover:text-primary-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fireplaces, stoves, accessories..."
                className="w-full px-4 py-3 pl-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-secondary-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-secondary-700 hover:text-primary-600 font-medium py-2 transition-colors duration-200"
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
