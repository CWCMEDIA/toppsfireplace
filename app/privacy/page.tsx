'use client'

import { Shield, Mail, Phone, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPolicyPage() {
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              How we collect, use, and protect your personal information
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
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">1. Introduction</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  This Privacy Policy outlines Tops Fireplaces Ltd ("we", "our" or "the Company") practices with respect to information collected from users who access our website at www.topsfireplaces.com ("Site"), or otherwise share personal information with us (collectively: "Users").
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Tops Fireplaces Ltd is the data controller responsible for your personal information. We are committed to protecting your privacy and ensuring the security of your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">2. Grounds for Data Collection</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Processing of your personal information (meaning, any information which may potentially allow your identification with reasonable means; hereinafter "Personal Information") is necessary for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li>The performance of our contractual obligations towards you and providing you with our services</li>
                  <li>Protecting our legitimate interests</li>
                  <li>Compliance with legal and financial regulatory obligations to which we are subject</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  When you use the Site, you consent to the collection, storage, use, disclosure and other uses of your Personal Information as described in this Privacy Policy.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  We encourage our Users to carefully read the Privacy Policy and use it to make informed decisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">3. What Information We Collect</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We collect two types of data and information from Users.
                </p>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.1 Non-Personal Information</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  The first type of information is un-identified and non-identifiable information pertaining to a User(s), which may be made available or gathered via your use of the Site ("Non-personal Information"). We are not aware of the identity of a User from which the Non-personal Information was collected. Non-personal Information which is being collected may include your aggregated usage information and technical information transmitted by your device, including certain software and hardware information (e.g. the type of browser and operating system your device uses, language preference, access time, etc.) in order to enhance the functionality of our Site. We may also collect information on your activity on the Site (e.g. pages viewed, online browsing, clicks, actions, etc.).
                </p>

                <h3 className="text-xl font-semibold text-secondary-800 mb-3 mt-6">3.2 Personal Information</h3>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  The second type of information is Personal Information which is individually identifiable information, namely information that identifies an individual or may with reasonable effort identify an individual. Such information includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li><strong>Device Information:</strong> We collect Personal Information from your device. Such information includes geolocation data, IP address, unique identifiers (e.g. MAC address and UUID) and other information which relates to your activity through the Site.</li>
                  <li><strong>Registration and Order Information:</strong> When you register on our Site or place an order, you will be asked to provide us certain details such as: full name; email address; physical address (billing and delivery); phone number; payment information (processed securely through Stripe); and other information necessary to fulfil your order.</li>
                  <li><strong>Contact Information:</strong> When you contact us through our contact form or by email, we collect your name, email address, phone number, and any message content you provide.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">4. How We Receive Information About You</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We receive your Personal Information from various sources:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700">
                  <li>When you voluntarily provide us your personal details in order to register on our Site or place an order</li>
                  <li>When you use or access our Site in connection with your use of our services</li>
                  <li>From third party providers, services and public registers (for example, traffic analytics vendors)</li>
                  <li>From payment processors (Stripe) when you make a purchase</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">5. How We Use Your Information</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We do not rent, sell, or share Users' information with third parties except as described in this Privacy Policy.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We may use the information for the following:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li><strong>Order Processing:</strong> To process and fulfil your orders, including payment processing, delivery arrangements, and customer service</li>
                  <li><strong>Communication:</strong> Communicating with you – sending you notices regarding our services, providing you with technical information and responding to any customer service issue you may have</li>
                  <li><strong>Updates:</strong> To communicate with you and to keep you informed of our latest updates and services</li>
                  <li><strong>Legal Compliance:</strong> Conducting statistical and analytical purposes, intended to improve the Site, and complying with legal obligations</li>
                  <li><strong>Marketing:</strong> To market our websites and products (see more under "Marketing" section below)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">6. Third-Party Services</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  In addition to the different uses listed above, we may transfer or disclose Personal Information to our subsidiaries, affiliated companies and subcontractors.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We may share Personal Information with our trusted third party providers, who may be located in different jurisdictions across the world, for any of the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li><strong>Payment Processing:</strong> We use Stripe to process payments. Stripe collects and processes your payment information, including billing address and payment card details, in accordance with their privacy policy. We do not store your full payment card details on our servers.</li>
                  <li><strong>Data Storage:</strong> We use Supabase to host and operate our Site and store your personal information securely</li>
                  <li><strong>Service Delivery:</strong> Providing you with our services, including providing a personalized display of our Site</li>
                  <li><strong>Analytics:</strong> Performing research, technical diagnostics or analytics to improve our services</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We may also disclose information if we have good faith to believe that disclosure of such information is helpful or reasonably necessary to: (i) comply with any applicable law, regulation, legal process or governmental request; (ii) enforce our policies (including our Terms of Service), including investigations of potential violations thereof; (iii) investigate, detect, prevent, or take action regarding illegal activities or other wrongdoing, suspected fraud or security issues; (iv) to establish or exercise our rights to defend against legal claims; (v) prevent harm to the rights, property or safety of us, our users, yourself or any third party; or (vi) for the purpose of collaborating with law enforcement agencies and/or in case we find it necessary in order to enforce intellectual property or other legal rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">7. Your Rights Under UK GDPR</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li><strong>Right of Access:</strong> Receive confirmation as to whether or not personal information concerning you is being processed, and access your stored personal information, together with supplementary information</li>
                  <li><strong>Right to Data Portability:</strong> Receive a copy of personal information you directly volunteer to us in a structured, commonly used and machine-readable format</li>
                  <li><strong>Right to Rectification:</strong> Request rectification of your personal information that is in our control</li>
                  <li><strong>Right to Erasure:</strong> Request erasure of your personal information (also known as the "right to be forgotten")</li>
                  <li><strong>Right to Object:</strong> Object to the processing of personal information by us</li>
                  <li><strong>Right to Restrict Processing:</strong> Request to restrict processing of your personal information by us</li>
                  <li><strong>Right to Lodge a Complaint:</strong> Lodge a complaint with a supervisory authority (the Information Commissioner's Office in the UK)</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  However, please note that these rights are not absolute, and may be subject to our own legitimate interests and regulatory requirements.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  If you wish to exercise any of the aforementioned rights, or receive more information, please contact us using the details provided in the "How to Contact Us" section below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">8. Data Retention</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We will retain your personal information for as long as necessary to provide our services, and as necessary to comply with our legal obligations, resolve disputes, and enforce our policies. Retention periods will be determined taking into account the type of information that is collected and the purpose for which it is collected, bearing in mind the requirements applicable to the situation and the need to destroy outdated, unused information at the earliest reasonable time.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Under applicable regulations, we will keep records containing client personal data, account opening documents, communications and anything else as required by applicable laws and regulations.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  We may rectify, replenish or remove incomplete or inaccurate information, at any time and at our own discretion.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">9. Cookies and Cookie Consent</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We and our trusted partners use cookies and other technologies in our related services. When you first visit our website, you will see a cookie consent banner that allows you to choose which types of cookies you want to accept.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  You can choose to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-secondary-700 mb-4">
                  <li><strong>Accept All:</strong> Accept all cookies including essential, analytics, marketing, and functional cookies</li>
                  <li><strong>Reject All:</strong> Reject all non-essential cookies, allowing only essential cookies necessary for the website to function</li>
                  <li><strong>Customise:</strong> Choose which specific cookie categories you want to accept or reject</li>
                </ul>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Your cookie preferences are stored in your browser and will be remembered for future visits. You can change your preferences at any time by clearing your browser's local storage or by contacting us.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  For detailed information about the cookies we use, how we use them, and how to manage them, please see our <a href="/cookies" className="text-primary-600 hover:text-primary-700 underline">Cookie Policy</a>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">10. Transfer of Data Outside the UK/EEA</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Please note that some data recipients may be located outside the UK or EEA. In such cases we will transfer your data only to such countries as approved by the UK Government or European Commission as providing adequate level of data protection, or enter into legal agreements ensuring an adequate level of data protection.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Our third-party service providers (including Stripe and Supabase) may process your data in countries outside the UK/EEA. We ensure appropriate safeguards are in place to protect your data in accordance with UK GDPR requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">11. Marketing</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We may use your Personal Information, such as your name, email address, telephone number, etc. ourselves or by using our third party subcontractors for the purpose of providing you with promotional materials, concerning our services, which we believe may interest you.
                </p>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  Out of respect to your right to privacy we provide you within such marketing materials with means to decline receiving further marketing offers from us. If you unsubscribe we will remove your email address or telephone number from our marketing distribution lists.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Please note that even if you have unsubscribed from receiving marketing emails from us, we may send you other types of important e-mail communications without offering you the opportunity to opt out of receiving them. These may include customer service announcements or administrative notices.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">12. Minors</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We understand the importance of protecting children's privacy, especially in an online environment. The Site is not designed for or directed at children. Under no circumstances shall we allow use of our services by minors without prior consent or authorization by a parent or legal guardian. We do not knowingly collect Personal Information from minors.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  If a parent or guardian becomes aware that his or her child has provided us with Personal Information without their consent, he or she should contact us at topsonlineshop@outlook.com.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">13. Security</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We take great care in implementing and maintaining the security of the Site and your information. We use industry-standard security measures including encryption, secure servers, and access controls to protect your personal information.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Although we take reasonable steps to safeguard information, we cannot be responsible for the acts of those who gain unauthorized access or abuse our Site, and we make no warranty, express, implied or otherwise, that we will prevent such access.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">14. Updates or Amendments to This Privacy Policy</h2>
                <p className="text-secondary-700 leading-relaxed mb-4">
                  We reserve the right to periodically amend or revise the Privacy Policy; material changes will be effective immediately upon the display of the revised Privacy Policy. The last revision will be reflected in the "Last Updated" section at the top of this page.
                </p>
                <p className="text-secondary-700 leading-relaxed">
                  Your continued use of the Site, following the notification of such amendments on our website, constitutes your acknowledgment and consent of such amendments to the Privacy Policy and your agreement to be bound by the terms of such amendments.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-secondary-800 mb-4">15. How to Contact Us</h2>
                <p className="text-secondary-700 leading-relaxed mb-6">
                  If you have any general questions about the Site or the information we collect about you and how we use it, or if you wish to exercise your rights under UK GDPR, please contact us:
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
                      <a href="mailto:topsonlineshop@outlook.com" className="text-primary-600 hover:text-primary-700">topsonlineshop@outlook.com</a>
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
