'use client'

import { useState, useEffect } from 'react'
import { Cookie, X, Settings, Check, X as XIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  getCookiePreferences,
  hasConsentBeenGiven,
  acceptAllCookies,
  rejectAllCookies,
  saveCookiePreferences,
  type CookiePreferences
} from '@/lib/cookie-consent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
    timestamp: 0
  })

  useEffect(() => {
    // Check if consent has been given
    if (!hasConsentBeenGiven()) {
      setShowBanner(true)
      setPreferences(getCookiePreferences())
    }
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShowBanner(false)
    // Reload page to apply cookie settings (if needed for analytics, etc.)
    window.location.reload()
  }

  const handleRejectAll = () => {
    rejectAllCookies()
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
    // Reload page to apply cookie settings
    window.location.reload()
  }

  const handleToggleCategory = (category: 'analytics' | 'marketing' | 'functional') => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  if (!showBanner) {
    return null
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-primary-600 shadow-2xl"
        >
          <div className="container-custom py-6">
            {!showSettings ? (
              // Main Banner View
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Cookie className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-bold text-secondary-800">We Value Your Privacy</h3>
                  </div>
                  <p className="text-secondary-700 text-sm mb-2">
                    We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. 
                    By clicking "Accept All", you consent to our use of cookies. You can also choose to reject non-essential cookies or customise your preferences.
                  </p>
                  <p className="text-secondary-600 text-xs">
                    For more information, please read our{' '}
                    <Link href="/cookies" className="text-primary-600 hover:text-primary-700 underline">
                      Cookie Policy
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700 underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={handleRejectAll}
                    className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded-lg hover:bg-secondary-300 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    <Settings className="w-4 h-4" />
                    Customise
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              // Settings View
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Settings className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-bold text-secondary-800">Cookie Preferences</h3>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="w-5 h-5 text-secondary-600" />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Essential Cookies */}
                  <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-secondary-800">Essential Cookies</h4>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Always Active</span>
                        </div>
                        <p className="text-sm text-secondary-600 mb-2">
                          These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.
                        </p>
                        <ul className="text-xs text-secondary-600 space-y-1">
                          <li>• Admin authentication (admin users only)</li>
                          <li>• Shopping cart functionality</li>
                          <li>• Payment processing (Stripe)</li>
                        </ul>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-6 bg-primary-600 rounded-full flex items-center justify-end px-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="bg-white rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-800 mb-2">Analytics Cookies</h4>
                        <p className="text-sm text-secondary-600 mb-2">
                          These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                        </p>
                        <p className="text-xs text-secondary-500">
                          Currently not in use, but may be enabled in the future.
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleCategory('analytics')}
                        className={`ml-4 w-12 h-6 rounded-full transition-colors flex items-center ${
                          preferences.analytics
                            ? 'bg-primary-600 justify-end'
                            : 'bg-secondary-300 justify-start'
                        }`}
                        aria-label="Toggle analytics cookies"
                      >
                        <div className="w-5 h-5 bg-white rounded-full mx-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="bg-white rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-800 mb-2">Marketing Cookies</h4>
                        <p className="text-sm text-secondary-600 mb-2">
                          These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement.
                        </p>
                        <p className="text-xs text-secondary-500">
                          Currently not in use, but may be enabled in the future.
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleCategory('marketing')}
                        className={`ml-4 w-12 h-6 rounded-full transition-colors flex items-center ${
                          preferences.marketing
                            ? 'bg-primary-600 justify-end'
                            : 'bg-secondary-300 justify-start'
                        }`}
                        aria-label="Toggle marketing cookies"
                      >
                        <div className="w-5 h-5 bg-white rounded-full mx-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="bg-white rounded-lg p-4 border border-secondary-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-800 mb-2">Functional Cookies</h4>
                        <p className="text-sm text-secondary-600 mb-2">
                          These cookies enable the website to provide enhanced functionality and personalisation. They may be set by us or by third-party providers whose services we have added to our pages.
                        </p>
                        <p className="text-xs text-secondary-500">
                          Currently not in use, but may be enabled in the future.
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggleCategory('functional')}
                        className={`ml-4 w-12 h-6 rounded-full transition-colors flex items-center ${
                          preferences.functional
                            ? 'bg-primary-600 justify-end'
                            : 'bg-secondary-300 justify-start'
                        }`}
                        aria-label="Toggle functional cookies"
                      >
                        <div className="w-5 h-5 bg-white rounded-full mx-0.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-end border-t pt-4">
                  <Link
                    href="/cookies"
                    className="px-4 py-2 text-secondary-700 hover:text-secondary-900 text-sm underline"
                  >
                    Learn More
                  </Link>
                  <button
                    onClick={() => {
                      setShowSettings(false)
                      setPreferences(getCookiePreferences())
                    }}
                    className="px-4 py-2 bg-secondary-200 text-secondary-800 rounded-lg hover:bg-secondary-300 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

