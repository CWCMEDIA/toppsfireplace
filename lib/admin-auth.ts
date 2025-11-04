import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing required JWT_SECRET environment variable')
}

/**
 * Verify admin authentication from request
 * Returns { isValid: true } if authenticated admin, { isValid: false, error: string } otherwise
 */
export async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value
  if (!token) {
    return { isValid: false, error: 'Unauthorized' }
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    
    if (payload.role !== 'admin') {
      return { isValid: false, error: 'Forbidden' }
    }

    return { isValid: true }
  } catch (error: any) {
    return { isValid: false, error: 'Unauthorized' }
  }
}

