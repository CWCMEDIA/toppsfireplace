'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Home, Ruler, Building2, Award, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'

interface FAQItem {
  id: string
  question: string
  answer: string
  icon?: any
}

const faqCategories = [
  {
    title: 'About Us',
    icon: Home,
    faqs: [
      {
        id: 'who-we-are',
        question: 'Who are Tops Fireplaces?',
        answer: 'Tops Fireplaces is proud to supply and install properties in Southend and Essex with fantastic fireplaces to make your home warm and comfortable. We have been serving the local community for many years with quality fireplaces and excellent service.',
      },
      {
        id: 'where-located',
        question: 'Where are you located?',
        answer: 'We are based in Westcliff-on-Sea, Essex. Our showroom is located at 332 Bridgwater Drive, SS0 0EZ. We serve customers throughout Southend and the wider Essex area.',
      },
      {
        id: 'opening-hours',
        question: 'What are your opening hours?',
        answer: 'Our showroom is open Monday to Saturday from 9:00 AM to 5:30 PM. We are closed on Sundays. Please feel free to call us on 01702 510222 or email us at topsfireplaces@hotmail.com to arrange a visit.',
      },
    ],
  },
  {
    title: 'Our Services',
    icon: Wrench,
    faqs: [
      {
        id: 'made-to-measure',
        question: 'Do you offer made-to-measure fireplaces?',
        answer: 'Yes! Our fireplaces are made to measure and will perfectly complement the effect you want in your home. We work with you to ensure your fireplace fits your space and matches your style perfectly.',
      },
      {
        id: 'installation',
        question: 'Do you provide installation services?',
        answer: 'Absolutely! We will supply and install your fireplace to suit your exact requirements. Our experienced team will handle everything from delivery to professional installation, ensuring your fireplace is fitted correctly and safely.',
      },
      {
        id: 'showroom',
        question: 'Can I visit your showroom?',
        answer: 'Yes, please do! Our beautiful showroom hosts hundreds of stunning fireplaces for you to look at. Seeing our fireplaces in person will help you make the perfect choice for your home. We welcome visitors Monday to Saturday, 9:00 AM to 5:30 PM.',
      },
      {
        id: 'quality',
        question: 'What makes your fireplaces high quality?',
        answer: 'We work with the best manufacturers to give you a high standard of fireplace. Our commitment to excellent quality means we only stock fireplaces that meet our strict standards for durability, design, and performance.',
      },
    ],
  },
  {
    title: 'Products',
    icon: Building2,
    faqs: [
      {
        id: 'types',
        question: 'What types of fireplaces do you offer?',
        answer: 'We offer a wide range of fireplaces including limestone, marble, granite, travertine, cast iron, electric, and wood-burning options. Each type has its own unique characteristics and benefits, and our team can help you choose the perfect one for your home.',
      },
      {
        id: 'materials',
        question: 'What materials are your fireplaces made from?',
        answer: 'We offer fireplaces in various premium materials including limestone, marble, granite, travertine, and cast iron. Each material has its own aesthetic appeal and durability characteristics. Visit our showroom to see the materials in person.',
      },
      {
        id: 'fuel-types',
        question: 'What fuel types are available?',
        answer: 'We offer fireplaces that work with gas, electric, and wood fuels. Whether you prefer the convenience of gas or electric, or the traditional charm of a wood-burning fireplace, we have options to suit your needs.',
      },
    ],
  },
  {
    title: 'General',
    icon: HelpCircle,
    faqs: [
      {
        id: 'payment',
        question: 'What payment methods do you accept?',
        answer: 'We accept various payment methods including cash, credit/debit cards, and bank transfers. For larger installations, we can discuss payment plans. Please contact us for more details about payment options.',
      },
      {
        id: 'delivery',
        question: 'Do you deliver fireplaces?',
        answer: 'We provide free delivery within 20 miles. Out of area delivery is available - please contact us for further information. For installed fireplaces, delivery and installation are included in our service.',
      },
      {
        id: 'warranty',
        question: 'Do your fireplaces come with a warranty?',
        answer: 'Yes, all our fireplaces come with appropriate warranties. The specific warranty terms depend on the manufacturer and product type. We\'ll provide full warranty details when you make your purchase.',
      },
      {
        id: 'consultation',
        question: 'Do you offer consultations?',
        answer: 'Absolutely! We\'re happy to discuss your fireplace needs and help you choose the perfect option for your home. You can visit our showroom, call us on 01702 510222, or email us at topsfireplaces@hotmail.com to arrange a consultation.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden min-h-[60vh] flex items-center">
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
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              Find answers to common questions about our fireplaces, services, and installation process
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom section-padding">
        {/* Introduction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-4">Who We Are</h2>
              <p className="text-secondary-700 leading-relaxed">
                Tops Fireplaces is proud to supply and install properties in Southend and Essex with 
                fantastic fireplaces to make your home warm and comfortable.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-4">Our Range</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Ruler className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-800 mb-1">Made to Measure</h3>
                    <p className="text-secondary-600 text-sm">Our fireplaces will perfectly complement the effect you want in your home.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building2 className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-800 mb-1">Come to our Showroom</h3>
                    <p className="text-secondary-600 text-sm">Our beautiful showroom hosts hundreds of stunning fireplaces for you to look at.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Award className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-800 mb-1">Excellent Quality</h3>
                    <p className="text-secondary-600 text-sm">We work with the best manufacturers to give you a high standard of fireplace.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Wrench className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-secondary-800 mb-1">Installation Service</h3>
                    <p className="text-secondary-600 text-sm">We will supply and install your fireplace to suit your exact requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
                <div className="flex items-center space-x-3">
                  <category.icon className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {category.faqs.map((faq) => {
                  const isOpen = openItems.has(faq.id)
                  return (
                    <div
                      key={faq.id}
                      className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary-50 transition-colors duration-200"
                      >
                        <span className="text-lg font-semibold text-secondary-800 pr-4">
                          {faq.question}
                        </span>
                        <div className="flex-shrink-0">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-primary-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-5 pb-5"
                        >
                          <p className="text-secondary-700 leading-relaxed pt-2">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Our friendly team is here to help! Get in touch with us and we\'ll be happy to answer 
            any questions you may have about our fireplaces or services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:01702510222"
              className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-secondary-50 transition-colors duration-200 shadow-lg"
            >
              Call Us: 01702 510222
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors duration-200"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
