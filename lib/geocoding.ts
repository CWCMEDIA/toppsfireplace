// Google Geocoding API utility for server-side distance calculations
// This file should NEVER expose the API key to the client

const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY

if (!GOOGLE_GEOCODING_API_KEY) {
  throw new Error('Missing required GOOGLE_GEOCODING_API_KEY environment variable')
}

// Business address: 332 Bridgwater Drive, Westcliff-on-Sea, Essex SS0 0EZ
const BUSINESS_ADDRESS = '332 Bridgwater Drive, Westcliff-on-Sea, Essex SS0 0EZ, UK'
const DELIVERY_RADIUS_MILES = 20

interface Coordinates {
  lat: number
  lng: number
}

interface DistanceResult {
  distanceMiles: number
  withinRadius: boolean
  businessAddress: string
  customerAddress: string
}

/**
 * Geocode an address to get coordinates
 * @param address - Full address string
 * @returns Coordinates or null if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_GEOCODING_API_KEY}&region=gb`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText)
      return null
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.error('Geocoding failed:', data.status, data.error_message)
      return null
    }
    
    const location = data.results[0].geometry.location
    return {
      lat: location.lat,
      lng: location.lng
    }
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First set of coordinates
 * @param coord2 - Second set of coordinates
 * @returns Distance in miles
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat)
  const dLon = toRadians(coord2.lng - coord1.lng)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Check if delivery address is within 20 miles of business
 * @param customerAddress - Customer's delivery address
 * @returns Distance result with withinRadius flag
 */
export async function checkDeliveryDistance(customerAddress: string): Promise<DistanceResult | null> {
  try {
    // Geocode both addresses
    const [businessCoords, customerCoords] = await Promise.all([
      geocodeAddress(BUSINESS_ADDRESS),
      geocodeAddress(customerAddress)
    ])
    
    if (!businessCoords || !customerCoords) {
      console.error('Failed to geocode addresses')
      return null
    }
    
    // Calculate distance
    const distanceMiles = calculateDistance(businessCoords, customerCoords)
    const withinRadius = distanceMiles <= DELIVERY_RADIUS_MILES
    
    return {
      distanceMiles,
      withinRadius,
      businessAddress: BUSINESS_ADDRESS,
      customerAddress
    }
  } catch (error) {
    console.error('Error checking delivery distance:', error)
    return null
  }
}

/**
 * Format address for geocoding from address object
 */
export function formatAddressForGeocoding(address: {
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country?: string
}): string {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country || 'UK'
  ].filter(Boolean)
  
  return parts.join(', ')
}

