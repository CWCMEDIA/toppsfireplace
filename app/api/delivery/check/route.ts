import { NextRequest, NextResponse } from 'next/server'
import { checkDeliveryDistance, formatAddressForGeocoding } from '@/lib/geocoding'
import { withSecurity, validateRequestBody, sanitizeInput } from '@/lib/api-security'
import { secureErrorResponse, secureSuccessResponse } from '@/lib/security'

/**
 * POST /api/delivery/check
 * Check if delivery address is within 20-mile radius
 * SECURITY: This endpoint uses Google Geocoding API server-side only
 */
async function handleDeliveryCheck(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sanitize input
    const sanitizedBody = sanitizeInput(body, 2000)
    const { address } = sanitizedBody
    
    // Validate request
    const validation = validateRequestBody(
      sanitizedBody,
      ['address'],
      {
        address: (val) => typeof val === 'object' && val !== null
      }
    )
    
    if (!validation.valid) {
      return secureErrorResponse(validation.error || 'Address is required', 400)
    }

    // Format address for geocoding
    const formattedAddress = formatAddressForGeocoding(address)

    // Check distance (server-side only - API key never exposed)
    const distanceResult = await checkDeliveryDistance(formattedAddress)

    if (!distanceResult) {
      return secureErrorResponse('Failed to validate address. Please check your address and try again.', 500)
    }

    return secureSuccessResponse({
      distanceMiles: distanceResult.distanceMiles,
      withinRadius: distanceResult.withinRadius,
      message: distanceResult.withinRadius
        ? `Free delivery available (${distanceResult.distanceMiles} miles from our location)`
        : `Delivery is ${distanceResult.distanceMiles} miles away. Subject to delivery cost - we will reach out to you within 24 hours to confirm delivery.`
    })
  } catch (error: any) {
    console.error('Delivery check error:', error)
    return secureErrorResponse('Failed to check delivery distance', 500)
  }
}

export const POST = withSecurity(handleDeliveryCheck, {
  rateLimit: { maxRequests: 30, windowMs: 60000 }, // 30 checks per minute
  requireHTTPS: true, // HTTPS required in production, HTTP allowed in development (handled by enforceHTTPS)
  validateOrigin: true,
  maxBodySize: 5000 // 5KB max
})

