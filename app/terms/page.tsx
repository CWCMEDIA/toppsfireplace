'use client'

import { FileText, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden min-h-[40vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-fireplace.jpg')"
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
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              Terms and conditions for using our website and purchasing our products
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
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">1. Company Information</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  These Terms of Service ("Terms") govern your use of the website www.topsfireplaces.com ("Site") and the purchase of products from Tops Fireplaces Ltd ("we", "us", "our", or "the Company").
                </p>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-secondary-800 mb-2">Tops Fireplaces Ltd</p>
                  <p className="text-secondary-700">332 Bridgwater Drive</p>
                  <p className="text-secondary-700">Westcliff-on-Sea, Essex</p>
                  <p className="text-secondary-700">SS0 0EZ</p>
                  <p className="text-secondary-700 mt-2">Phone: 01702 510222</p>
                  <p className="text-secondary-700">Email: topsfireplaces@hotmail.com</p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">2. Acceptance of Terms</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  By accessing and using this Site, you accept and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Site or purchase our products.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site after such changes constitutes your acceptance of the modified Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">3. Products and Pricing</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We sell fireplaces, stoves, and related accessories. All products are subject to availability. We reserve the right to discontinue any product at any time.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  All prices displayed on our Site are in British Pounds (GBP) and include Value Added Tax (VAT) where applicable. Prices are correct at the time of publication but may be subject to change without notice.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We make every effort to ensure that all prices are accurate. However, if we discover an error in the price of a product you have ordered, we will inform you as soon as possible and give you the option of:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li>Confirming your order at the correct price</li>
                  <li>Cancelling your order and receiving a full refund</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">4. Orders</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  When you place an order through our Site, you are making an offer to purchase products from us. We will send you an email confirmation acknowledging receipt of your order. This email confirmation does not constitute acceptance of your order.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We reserve the right to accept or reject your order for any reason, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>Product availability</li>
                  <li>Errors in product descriptions or prices</li>
                  <li>Errors in your order</li>
                  <li>Suspected fraudulent activity</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed">
                  If we are unable to fulfil your order, we will notify you and refund any payment already received.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">5. Payment</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Payment for all products must be made at the time of ordering. We accept the following payment methods:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
                  <li>Other payment methods as displayed on our Site</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  All payments are processed securely through Stripe, our payment processor. We do not store your full payment card details on our servers. Stripe handles all payment information in accordance with their security standards and privacy policy.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Payment will be debited from your account when you place your order. If your payment is not successful, we will notify you and your order will not be processed.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">6. Delivery</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We provide free delivery within 20 miles. Out of area delivery is available - please contact us for further information. Delivery times are estimates and are not guaranteed.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  For large items such as fireplaces, we may offer installation services. Delivery and installation arrangements will be confirmed with you after your order is placed.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Risk in the products passes to you upon delivery. You are responsible for inspecting the products upon delivery and notifying us of any damage or defects within 48 hours of delivery.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  If delivery fails due to reasons within your control (e.g., incorrect address, no one available to receive delivery), we may charge you for any additional delivery costs incurred.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">7. Right to Cancel</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you have the right to cancel your order within 14 days of receiving the products, without giving any reason.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  The cancellation period will expire 14 days after the day on which you receive the products or the day on which you receive the last product (if you ordered multiple products in separate deliveries).
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  To exercise your right to cancel, you must inform us of your decision by:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>Email: topsfireplaces@hotmail.com</li>
                  <li>Phone: 01702 510222</li>
                  <li>Post: Tops Fireplaces Ltd, 332 Bridgwater Drive, Westcliff-on-Sea, Essex, SS0 0EZ</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  You may use the model cancellation form provided below, but it is not obligatory.
                </p>
                <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-secondary-800 mb-2">Cancellation Form</p>
                  <p className="text-secondary-700 text-sm">
                    To: Tops Fireplaces Ltd, topsfireplaces@hotmail.com<br />
                    I hereby give notice that I cancel my contract of sale of the following goods:<br />
                    [Product details]<br />
                    Ordered on: [Date]<br />
                    Received on: [Date]<br />
                    Name: [Your name]<br />
                    Address: [Your address]<br />
                    Signature: [Your signature - only if this form is notified on paper]<br />
                    Date: [Date]
                  </p>
                </div>
                <p className="text-secondary-700 leading-relaxed">
                  If you cancel your order, you must return the products to us at your own cost, unless the products are damaged or defective. We will refund the purchase price and delivery costs (if any) within 14 days of receiving the returned products.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">8. Returns and Refunds</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  If you wish to return products for any reason (including cancellation within the 14-day cooling-off period), please contact us using the details provided above.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Products must be returned in their original condition, unused, and in their original packaging where possible. We reserve the right to refuse a refund if products are returned in a damaged or used condition.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We will refund the purchase price using the same payment method you used for the original transaction. Refunds will be processed within 14 days of receiving the returned products or receiving your cancellation notice (whichever is later).
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  If products are damaged or defective when you receive them, please contact us immediately. We will arrange for replacement or refund at no cost to you.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">9. Warranty</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  All products come with the manufacturer's warranty. Warranty terms vary by product and manufacturer. Warranty details will be provided with your order.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  In addition to any manufacturer's warranty, you have legal rights as a consumer, including the right to receive products that are of satisfactory quality, fit for purpose, and as described. These rights are not affected by any warranty provided by the manufacturer.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">10. Limitation of Liability</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded or limited by law.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  To the fullest extent permitted by law, our total liability to you for any claim arising out of or in connection with these Terms or your use of our Site or products shall not exceed the amount you paid for the products in question.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  We will not be liable for any indirect, special, incidental, or consequential damages arising out of or in connection with these Terms or your use of our Site or products.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">11. Intellectual Property</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  All content on this Site, including text, graphics, logos, images, and software, is the property of Tops Fireplaces Ltd or its content suppliers and is protected by UK and international copyright laws.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  You may not reproduce, distribute, modify, or create derivative works from any content on this Site without our express written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">12. Complaints</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  If you have any complaints about our products or services, please contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>Email: topsfireplaces@hotmail.com</li>
                  <li>Phone: 01702 510222</li>
                  <li>Post: Tops Fireplaces Ltd, 332 Bridgwater Drive, Westcliff-on-Sea, Essex, SS0 0EZ</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed">
                  We aim to resolve all complaints promptly and fairly. If you are not satisfied with our response, you may contact the relevant consumer protection authority or seek legal advice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">13. Governing Law</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  These Terms are governed by and construed in accordance with the laws of England and Wales.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Any disputes arising out of or in connection with these Terms or your use of our Site or products shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">14. Contact Us</h2>
                <p className="text-secondary-700 leading-relaxed mb-6">
                  If you have any questions about these Terms, please contact us:
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
