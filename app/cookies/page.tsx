'use client'

import { Cookie, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden min-h-[40vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/newbanner.jpeg')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-6">
              <Cookie className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              Information about how we use cookies and similar technologies
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom section-padding">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-secondary-600 mb-8">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">1. What Are Cookies?</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  A "cookie" is a small piece of information that a website assigns to your device while you are viewing a website. Cookies are very helpful and can be used for various different purposes. These purposes include allowing you to navigate between pages efficiently, enable automatic activation of certain features, remembering your preferences and making the interaction between you and our Services quicker and easier.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Cookies are also used to help ensure that the advertisements you see are relevant to you and your interests and to compile statistical data on your use of our Services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">2. How We Use Cookies</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We and our trusted partners use cookies and other technologies in our related services, including when you visit our Site or access our services.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Cookies do not contain any information that personally identifies you, but Personal Information that we store about you may be linked, by us, to the information stored in and obtained from cookies. You may remove the cookies by following the instructions of your device preferences; however, if you choose to disable cookies, some features of our Site may not operate properly and your online experience may be limited.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">3. Types of Cookies We Use</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  The Site uses the following types of cookies:
                </p>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.1 Essential Cookies (Strictly Necessary)</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                </p>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-secondary-800 mb-2">Admin Authentication Cookie</p>
                  <ul className="list-disc pl-6 space-y-1 text-secondary-700 text-sm">
                    <li><strong>Name:</strong> admin-token</li>
                    <li><strong>Purpose:</strong> Maintains admin authentication session</li>
                    <li><strong>Type:</strong> Essential/Strictly Necessary</li>
                    <li><strong>Lifespan:</strong> 24 hours</li>
                    <li><strong>HTTP-Only:</strong> Yes (secure, not accessible via JavaScript)</li>
                    <li><strong>Secure:</strong> Yes (HTTPS only in production)</li>
                    <li><strong>Consent Required:</strong> No (essential for site functionality)</li>
                    <li><strong>Note:</strong> This cookie is only set for admin users and is not relevant to regular customers</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.2 Session Cookies</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Session cookies are stored only temporarily during a browsing session in order to allow normal use of the system and are deleted from your device when the browser is closed. These cookies are essential for the website to function properly.
                </p>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.3 Persistent Cookies</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Persistent cookies are read only by the Site, saved on your computer for a fixed period and are not deleted when the browser is closed. Such cookies are used where we need to know who you are for repeat visits, for example to allow us to store your preferences for the next sign-in.
                </p>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.4 Third-Party Cookies</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Third-party cookies are set by other online services who run content on the page you are viewing, for example by third-party analytics companies who monitor and analyze our web access.
                </p>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-secondary-800 mb-2">Payment Processing Cookies (Stripe)</p>
                  <p className="text-secondary-700 text-sm mb-2">
                    When you make a purchase, our payment processor Stripe may set cookies necessary for secure payment processing. These cookies are essential for completing your transaction securely.
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-secondary-700 text-sm">
                    <li><strong>Purpose:</strong> Secure payment processing and fraud prevention</li>
                    <li><strong>Type:</strong> Essential/Strictly Necessary</li>
                    <li><strong>Consent Required:</strong> No (essential for payment functionality)</li>
                    <li><strong>More Information:</strong> Please see <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">Stripe's Privacy Policy</a></li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">4. Local Storage</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  In addition to cookies, we use browser local storage to store certain information on your device:
                </p>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-secondary-800 mb-2">Shopping Cart Data</p>
                  <ul className="list-disc pl-6 space-y-1 text-secondary-700 text-sm">
                    <li><strong>Name:</strong> cart</li>
                    <li><strong>Purpose:</strong> Storing your shopping cart items locally in your browser</li>
                    <li><strong>Type:</strong> Local Storage (not a cookie)</li>
                    <li><strong>Data Stored:</strong> Product IDs, quantities, and selected options</li>
                    <li><strong>Consent Required:</strong> No (essential for shopping cart functionality)</li>
                    <li><strong>Note:</strong> This data is stored locally on your device and is not transmitted to our servers until you proceed to checkout</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">5. Analytics</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Currently, we do not use third-party analytics services such as Google Analytics. However, if we implement analytics in the future, we will update this Cookie Policy accordingly and provide you with the option to opt-out of non-essential analytics cookies.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  If we do implement analytics in the future, such services may collect information such as how often users access the Site, what pages they visit when they do so, etc. We would use such information only to improve our Site and services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">6. Managing Cookies</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  You have the right to accept or reject cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  However, please note that if you disable cookies, some features of our Site may not operate properly and your online experience may be limited. Essential cookies cannot be disabled as they are necessary for the website to function.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  To manage cookies, you can:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>Adjust your browser settings to refuse cookies or alert you when cookies are being sent</li>
                  <li>Delete cookies that have already been set on your device</li>
                  <li>Use browser extensions or add-ons that block cookies</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Instructions for managing cookies in popular browsers:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">7. Third-Party Collection of Information</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Our policy only addresses the use and disclosure of information we collect from you. To the extent you disclose your information to other parties or sites throughout the internet, different rules may apply to their use or disclosure of the information you disclose to them.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Accordingly, we encourage you to read the terms and conditions and privacy policy of each third party that you choose to disclose information to.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  This Cookie Policy does not apply to the practices of companies that we do not own or control, or to individuals whom we do not employ or manage, including any of the third parties which we may disclose information as set forth in this Cookie Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">8. Updates to This Cookie Policy</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We reserve the right to periodically amend or revise the Cookie Policy; material changes will be effective immediately upon the display of the revised Cookie Policy. The last revision will be reflected in the "Last Updated" section at the top of this page.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Your continued use of the Site, following the notification of such amendments on our website, constitutes your acknowledgment and consent of such amendments to the Cookie Policy and your agreement to be bound by the terms of such amendments.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">9. How to Contact Us</h2>
                <p className="text-secondary-700 leading-relaxed mb-6">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="bg-secondary-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-secondary-800">Phone</p>
                      <a href="tel:01702510222" className="text-primary-600 hover:text-primary-700">01702 510222</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-secondary-800">Email</p>
                      <a href="mailto:topsfireplaces@hotmail.com" className="text-primary-600 hover:text-primary-700">topsfireplaces@hotmail.com</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-secondary-800">Address</p>
                      <p className="text-secondary-700">Tops Fireplaces Ltd</p>
                      <p className="text-secondary-700">332 Bridgwater Drive</p>
                      <p className="text-secondary-700">Westcliff-on-Sea, Essex</p>
                      <p className="text-secondary-700">SS0 0EZ</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded-lg mt-8">
                <p className="text-secondary-700">
                  <strong>Note:</strong> For more information about how we collect, use, and protect your personal information, please see our <a href="/privacy" className="text-primary-600 hover:text-primary-700 underline font-semibold">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
