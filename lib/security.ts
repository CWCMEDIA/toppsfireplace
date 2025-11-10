import { NextRequest, NextResponse } from 'next/server'

/**
 * Security utility functions for API endpoints
 */

/**
 * Add security headers to API responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // HTTPS enforcement
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // XSS protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co https://maps.googleapis.com; frame-src https://js.stripe.com;"
  )
  
  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )
  
  return response
}

/**
 * Validate request origin (CSRF protection)
 */
export function validateOrigin(request: NextRequest): boolean {
  // In development, always allow (for localhost testing)
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // In production, validate against allowed origins
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'https://topsfireplaces.shop',
    'https://www.topsfireplaces.shop'
  ].filter(Boolean)
  
  // If no allowed origins configured, allow (for flexibility during setup)
  // BUT log a warning in production
  if (allowedOrigins.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('SECURITY WARNING: No allowed origins configured for origin validation')
    }
    return true
  }
  
  // Check origin header (most reliable for CSRF protection)
  if (origin) {
    const originMatch = allowedOrigins.some(allowed => {
      try {
        const originUrl = new URL(origin)
        const allowedUrl = new URL(allowed)
        return originUrl.origin === allowedUrl.origin
      } catch {
        return origin.startsWith(allowed)
      }
    })
    if (originMatch) return true
  }
  
  // Check referer header as fallback
  if (referer) {
    const refererMatch = allowedOrigins.some(allowed => {
      try {
        const refererUrl = new URL(referer)
        const allowedUrl = new URL(allowed)
        return refererUrl.origin === allowedUrl.origin
      } catch {
        return referer.startsWith(allowed)
      }
    })
    if (refererMatch) return true
  }
  
  // SECURITY: If no origin or referer, check if request URL is same-origin
  // This handles server-side requests and edge cases where headers might be missing
  try {
    const requestUrl = new URL(request.url)
    const sameOriginMatch = allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed)
        return requestUrl.origin === allowedUrl.origin
      } catch {
        return requestUrl.href.startsWith(allowed)
      }
    })
    
    // If same-origin, allow (could be server-side request or edge case)
    // BUT log for security monitoring in production
    if (sameOriginMatch) {
      // Log missing headers for same-origin requests (shouldn't happen normally)
      if (process.env.NODE_ENV === 'production') {
        const userAgent = request.headers.get('user-agent')
        // Only log if it looks like a browser request (not server-side)
        if (userAgent && !userAgent.includes('node') && !userAgent.includes('Next.js')) {
          console.warn('SECURITY WARNING: Same-origin browser request without origin/referer headers', {
            url: request.url,
            method: request.method,
            userAgent: userAgent.substring(0, 100)
          })
        }
      }
      // Allow same-origin requests even without headers (defense in depth)
      return true
    }
  } catch {
    // If URL parsing fails, be strict and block
    return false
  }
  
  // No origin, referer, or same-origin match - block for security
  // This prevents CSRF attacks from external sites
  return false
}

/**
 * Rate limiting store (in-memory for now, consider Redis for production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple rate limiter
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)
  
  if (!record || now > record.resetTime) {
    // New window
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: maxRequests - 1, resetTime }
  }
  
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }
  
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime }
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for IP (in case of proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return request.ip || 'unknown'
}

/**
 * Validate and sanitize input
 */
export function sanitizeInput(input: any, maxLength: number = 1000): any {
  if (typeof input === 'string') {
    // Remove null bytes and trim
    let sanitized = input.replace(/\0/g, '').trim()
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }
    
    return sanitized
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item, maxLength))
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {}
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key], maxLength)
    }
    return sanitized
  }
  
  return input
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate phone number (UK format)
 */
export function isValidPhone(phone: string): boolean {
  // UK phone number validation (basic)
  const phoneRegex = /^(\+44|0)[1-9]\d{8,9}$/
  const cleaned = phone.replace(/\s+/g, '')
  return phoneRegex.test(cleaned) && cleaned.length <= 20
}

/**
 * Secure error response (don't leak sensitive info)
 */
export function secureErrorResponse(
  message: string = 'An error occurred',
  status: number = 500
): NextResponse {
  const response = NextResponse.json(
    { error: message },
    { status }
  )
  return addSecurityHeaders(response)
}

/**
 * Secure success response
 */
export function secureSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response)
}

/**
 * Enforce HTTPS in production
 */
export function enforceHTTPS(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'production') {
    const protocol = request.headers.get('x-forwarded-proto') || 
                    request.nextUrl.protocol.replace(':', '')
    return protocol === 'https'
  }
  return true // Allow HTTP in development
}

