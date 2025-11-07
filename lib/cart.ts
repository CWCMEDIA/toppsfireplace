// Cart utility functions for managing shopping cart in localStorage

export interface CartItem {
  id: string
  name: string
  slug?: string
  price: number
  original_price?: number
  quantity: number
  image?: string
  material?: string
  fuel_type?: string
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return []
  }
}

export function addToCart(product: {
  id: string
  name: string
  slug?: string
  price: number
  original_price?: number
  images?: string[]
  material?: string
  fuel_type?: string
}, quantity: number = 1): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = getCart()
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      cart[existingItemIndex].quantity += quantity
    } else {
      // Add new item to cart
      cart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        original_price: product.original_price,
        quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        material: product.material,
        fuel_type: product.fuel_type
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Dispatch event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'))
    }
    
    return cart
  } catch (error) {
    console.error('Error adding to cart:', error)
    return []
  }
}

export function updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = getCart()
    const itemIndex = cart.findIndex(item => item.id === productId)
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.splice(itemIndex, 1)
      } else {
        // Update quantity
        cart[itemIndex].quantity = quantity
      }
      localStorage.setItem('cart', JSON.stringify(cart))
    }
    
    return cart
  } catch (error) {
    console.error('Error updating cart item:', error)
    return []
  }
}

export function removeFromCart(productId: string): CartItem[] {
  if (typeof window === 'undefined') return []
  
  try {
    const cart = getCart()
    const filteredCart = cart.filter(item => item.id !== productId)
    localStorage.setItem('cart', JSON.stringify(filteredCart))
    return filteredCart
  } catch (error) {
    console.error('Error removing from cart:', error)
    return []
  }
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('cart')
}

export function getCartTotal(): number {
  const cart = getCart()
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export function getCartItemCount(): number {
  const cart = getCart()
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

