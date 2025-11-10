import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { addSecurityHeaders } from '@/lib/security'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable')
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  
  // Create response early to add security headers
  let response: NextResponse
  
  // Allow public routes
  if (
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/products') ||
    request.nextUrl.pathname.startsWith('/api/stripe') ||
    request.nextUrl.pathname === '/admin-login' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/gallery') ||
    request.nextUrl.pathname.startsWith('/contact')
  ) {
    response = NextResponse.next()
    return addSecurityHeaders(response)
  }
  
  // Protect upload route - requires admin authentication (handled by route itself)
  if (request.nextUrl.pathname.startsWith('/api/upload')) {
    response = NextResponse.next() // Route will handle admin verification
    return addSecurityHeaders(response)
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      response = NextResponse.redirect(new URL('/admin-login', request.url))
      return addSecurityHeaders(response)
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      if (payload.role !== 'admin') {
        response = NextResponse.redirect(new URL('/admin-login', request.url))
        return addSecurityHeaders(response)
      }

      response = NextResponse.next()
      return addSecurityHeaders(response)
    } catch (error) {
      response = NextResponse.redirect(new URL('/admin-login', request.url))
      return addSecurityHeaders(response)
    }
  }

  response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
