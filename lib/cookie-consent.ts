// Cookie Consent Management
// UK GDPR/PECR Compliant

export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'functional'

export interface CookiePreferences {
  essential: boolean // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
  functional: boolean
  timestamp: number // When preferences were set
}

const COOKIE_CONSENT_KEY = 'cookie-consent-preferences'
const COOKIE_CONSENT_VERSION = '1.0' // Increment when cookie structure changes

// Default preferences (only essential cookies allowed)
const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true, // Always true
  analytics: false,
  marketing: false,
  functional: false,
  timestamp: Date.now()
}

/**
 * Get current cookie preferences from localStorage
 */
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) {
      return { ...DEFAULT_PREFERENCES, timestamp: 0 } // No consent given yet
    }

    const parsed = JSON.parse(stored)
    
    // Check version compatibility
    if (parsed.version !== COOKIE_CONSENT_VERSION) {
      // Version mismatch - reset to defaults
      return { ...DEFAULT_PREFERENCES, timestamp: 0 }
    }

    return {
      essential: true, // Always true
      analytics: parsed.analytics || false,
      marketing: parsed.marketing || false,
      functional: parsed.functional || false,
      timestamp: parsed.timestamp || 0
    }
  } catch (error) {
    console.error('Error reading cookie preferences:', error)
    return { ...DEFAULT_PREFERENCES, timestamp: 0 }
  }
}

/**
 * Check if user has given consent (any consent, even if all optional cookies rejected)
 */
export function hasConsentBeenGiven(): boolean {
  const preferences = getCookiePreferences()
  return preferences.timestamp > 0
}

/**
 * Save cookie preferences to localStorage
 */
export function saveCookiePreferences(preferences: Partial<CookiePreferences>): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const current = getCookiePreferences()
    const updated: CookiePreferences = {
      essential: true, // Always true
      analytics: preferences.analytics ?? current.analytics,
      marketing: preferences.marketing ?? current.marketing,
      functional: preferences.functional ?? current.functional,
      timestamp: Date.now()
    }

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      ...updated,
      version: COOKIE_CONSENT_VERSION
    }))
  } catch (error) {
    console.error('Error saving cookie preferences:', error)
  }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    essential: true,
    analytics: true,
    marketing: true,
    functional: true
  })
}

/**
 * Reject all optional cookies (only essential allowed)
 */
export function rejectAllCookies(): void {
  saveCookiePreferences({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  })
}

/**
 * Check if a specific cookie category is allowed
 */
export function isCookieCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences()
  
  if (category === 'essential') {
    return true // Essential cookies are always allowed
  }

  return preferences[category] === true
}

/**
 * Clear all cookie preferences (for testing/debugging)
 */
export function clearCookiePreferences(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
  } catch (error) {
    console.error('Error clearing cookie preferences:', error)
  }
}

