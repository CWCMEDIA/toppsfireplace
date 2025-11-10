import { NextRequest, NextResponse } from 'next/server'
import { 
  addSecurityHeaders, 
  validateOrigin, 
  rateLimit, 
  getClientIP,
  sanitizeInput,
  secureErrorResponse,
  secureSuccessResponse,
  enforceHTTPS
} from './security'
import { verifyAdmin } from './admin-auth'

/**
 * API security middleware wrapper
 * Use this to wrap API route handlers for automatic security
 */
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    rateLimit?: { maxRequests: number; windowMs: number }
    requireHTTPS?: boolean
    validateOrigin?: boolean
    maxBodySize?: number // in bytes
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Require authentication if specified
      if (options.requireAuth) {
        const authResult = await verifyAdmin(request)
        if (!authResult.isValid) {
          return secureErrorResponse('Unauthorized', 401)
        }
      }

      // 2. Enforce HTTPS in production
      if (options.requireHTTPS !== false && !enforceHTTPS(request)) {
        return secureErrorResponse('HTTPS required', 403)
      }

      // 3. Validate origin (CSRF protection)
      if (options.validateOrigin !== false && !validateOrigin(request)) {
        return secureErrorResponse('Invalid origin', 403)
      }

      // 4. Rate limiting
      if (options.rateLimit) {
        const clientIP = getClientIP(request)
        const limitResult = rateLimit(
          clientIP,
          options.rateLimit.maxRequests,
          options.rateLimit.windowMs
        )

        if (!limitResult.allowed) {
          const response = secureErrorResponse('Rate limit exceeded', 429)
          response.headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString())
          response.headers.set('X-RateLimit-Remaining', '0')
          response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())
          return response
        }

        // Add rate limit headers
        const response = await handler(request)
        response.headers.set('X-RateLimit-Limit', options.rateLimit.maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString())
        response.headers.set('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())
        return addSecurityHeaders(response)
      }

      // 5. Check body size
      if (options.maxBodySize && request.body) {
        const contentLength = request.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > options.maxBodySize) {
          return secureErrorResponse('Request body too large', 413)
        }
      }

      // 6. Execute handler
      const response = await handler(request)
      return addSecurityHeaders(response)
    } catch (error: any) {
      // Don't leak error details in production
      console.error('API Security Error:', error)
      return secureErrorResponse(
        process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
        500
      )
    }
  }
}

/**
 * Re-export sanitizeInput for convenience
 */
export { sanitizeInput } from './security'

/**
 * Validate request body structure
 */
export function validateRequestBody(
  body: any,
  requiredFields: string[],
  fieldValidators?: { [key: string]: (value: any) => boolean }
): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      return { valid: false, error: `Missing required field: ${field}` }
    }
  }

  // Run custom validators
  if (fieldValidators) {
    for (const [field, validator] of Object.entries(fieldValidators)) {
      if (field in body && !validator(body[field])) {
        return { valid: false, error: `Invalid value for field: ${field}` }
      }
    }
  }

  return { valid: true }
}

