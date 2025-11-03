import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable')
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  
  // Allow public routes
  if (
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/products') ||
    request.nextUrl.pathname.startsWith('/api/upload') ||
    request.nextUrl.pathname.startsWith('/api/stripe') ||
    request.nextUrl.pathname === '/admin-login' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/products') ||
    request.nextUrl.pathname.startsWith('/gallery') ||
    request.nextUrl.pathname.startsWith('/contact')
  ) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin-login', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
