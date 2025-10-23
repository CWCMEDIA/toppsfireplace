export interface Product {
  id: string
  name: string
  description: string
  long_description?: string
  price: number
  original_price?: number
  category: string
  subcategory?: string
  material: string
  fuel_type: string
  dimensions?: string
  weight?: string
  features?: string[]
  specifications?: Record<string, string>
  images: string[]
  badge?: string
  rating: number
  review_count: number
  stock_count: number
  in_stock: boolean
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address: Address
  billing_address?: Address
  items: OrderItem[]
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  stripe_payment_intent_id?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product: Product
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'customer'
  created_at: string
  updated_at: string
}

export interface ContactEnquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  enquiry_type: 'general' | 'quote' | 'installation' | 'maintenance' | 'showroom'
  status: 'new' | 'in_progress' | 'resolved'
  admin_notes?: string
  created_at: string
  updated_at: string
}
