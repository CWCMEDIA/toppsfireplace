'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    enquiryType: 'general',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (submitError) setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('access_key', 'a40c262e-daa2-4c34-90e3-fd82732230d8')
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone || 'Not provided')
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('enquiryType', formData.enquiryType)
      
      // Format message to include all details
      const formattedMessage = `Enquiry Type: ${formData.enquiryType}
      
Subject: ${formData.subject}

Message:
${formData.message}

---
Contact Details:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
`
      formDataToSend.append('message', formattedMessage)
      formDataToSend.append('from_name', formData.name)
      
      // Note: Email destination is configured in your web3forms account settings
      // The 'to' parameter is ignored if the email isn't authorized in your account

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          enquiryType: 'general',
        })
      } else {
        setSubmitError(data.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['01702 510222'],
      description: 'Call us for immediate assistance',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['topsonlineshop@outlook.com'],
      description: 'Send us an email anytime',
    },
    {
      icon: MapPin,
      title: 'Address',
      details: [
        '332 Bridgwater Drive',
        'Westcliff-on-Sea, Essex',
        'SS0 0EZ'
      ],
      description: 'Visit our showroom',
    },
    {
      icon: Clock,
      title: 'Opening Hours',
      details: [
        'Monday-Saturday: 9:00-17:30'
      ],
      description: 'We\'re here to help',
    },
  ]

  const enquiryTypes = [
    { value: 'general', label: 'General Enquiry' },
    { value: 'quote', label: 'Request Quote' },
    { value: 'installation', label: 'Installation Service' },
    { value: 'maintenance', label: 'Maintenance & Repairs' },
    { value: 'showroom', label: 'Showroom Visit' },
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-800 mb-4">Message Sent!</h1>
          <p className="text-secondary-600 mb-6">
            Thank you for your enquiry. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-primary"
          >
            Send Another Message
          </button>
        </motion.div>
      </div>
    )
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
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">Get In Touch</h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto">
              Ready to transform your home with a beautiful fireplace? Contact our experts 
              for a free consultation and home assessment.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-secondary-800 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="01702 123456"
                  />
                </div>
                <div>
                  <label htmlFor="enquiryType" className="block text-sm font-medium text-secondary-700 mb-2">
                    Enquiry Type
                  </label>
                  <select
                    id="enquiryType"
                    name="enquiryType"
                    value={formData.enquiryType}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {enquiryTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="input-field"
                  placeholder="Tell us about your fireplace needs, room dimensions, or any questions you have..."
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-secondary-800 mb-6">Contact Information</h2>
              <p className="text-secondary-600 mb-8">
                We're here to help you find the perfect fireplace for your home. 
                Get in touch with our experts for personalized advice and service.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-1">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-secondary-700">{detail}</p>
                      ))}
                    </div>
                    <p className="text-sm text-secondary-600 mt-2">{info.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="tel:01702510222"
                  className="flex items-center space-x-3 text-primary-700 hover:text-primary-800 transition-colors duration-200"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now: 01702 510222</span>
                </a>
                <a
                  href="mailto:topsonlineshop@outlook.com"
                  className="flex items-center space-x-3 text-primary-700 hover:text-primary-800 transition-colors duration-200"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email Us</span>
                </a>
                <a
                  href="/gallery"
                  className="flex items-center space-x-3 text-primary-700 hover:text-primary-800 transition-colors duration-200"
                >
                  <MapPin className="w-5 h-5" />
                  <span>View Our Gallery</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">Find Us</h2>
              <p className="text-secondary-600 mb-6">
                Visit our showroom to see our full range of fireplaces and get expert advice.
              </p>
            </div>
            <div className="h-96 w-full relative overflow-hidden rounded-b-2xl">
              <iframe
                src="https://www.google.com/maps?q=332+Bridgwater+Drive,+Westcliff-on-Sea,+Essex,+SS0+0EZ&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Tops Fireplaces Location - 332 Bridgwater Drive, Westcliff-on-Sea, Essex, SS0 0EZ"
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-secondary-800">Tops Fireplaces</p>
                    <p className="text-xs text-secondary-600 mt-1">
                      332 Bridgwater Drive<br />
                      Westcliff-on-Sea, Essex<br />
                      SS0 0EZ
                    </p>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=332+Bridgwater+Drive,+Westcliff-on-Sea,+Essex,+SS0+0EZ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
