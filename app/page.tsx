'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, Award, CheckCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Product } from '@/lib/types'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Benfleet',
    rating: 5,
    text: 'Punctual, clean and tidy. Lovely job. Carried out efficiently with a very pleasant manner. 10/10',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Westcliff-On-Sea',
    rating: 5,
    text: 'The service provided was first class, the workmanship excellent and we would not hesitate to recommend Tops Fireplaces. 10/10',
  },
  {
    id: 3,
    name: 'Emma Williams',
    location: 'Hockley',
    rating: 5,
    text: 'Excellent workers, punctual, clean and tidy job. A difficult project but brilliantly executed, great attention to detail, lovely fireplace. 10/10',
  },
]

const features = [
  {
    icon: Shield,
    title: 'Made to Measure',
    description: 'Our fireplaces will perfectly complement the effect you want in your home.',
  },
  {
    icon: Award,
    title: 'Come to our Showroom',
    description: 'Our beautiful showroom hosts hundreds of stunning fireplaces for you to look at.',
  },
  {
    icon: Star,
    title: 'Excellent Quality',
    description: 'We work with the best manufacturers to give you a high standard of fireplace.',
  },
  {
    icon: CheckCircle,
    title: 'Quality Assurance',
    description: 'We ensure every product meets our high standards of quality and craftsmanship.',
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured')
        if (response.ok) {
          const data = await response.json()
          setFeaturedProducts(data.products)
        }
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white overflow-hidden min-h-[80vh] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero-fireplace.jpg')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container-custom section-padding relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Our online shop is now open for all your fire/fireplace needs.
              </h1>
              <p className="text-xl text-white/95 mb-8 leading-relaxed">
                Trustworthy, Affordable, Dependable. Established in 1988, we provide 
                premium fireplaces, stoves, and accessories to make your home warm and comfortable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center">
                  Shop Here
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
                  Book Consultation
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Phone className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-white">Call Now</h3>
                  <p className="text-3xl font-bold mb-4 text-yellow-300">01702 510222</p>
                  <p className="text-white/90 mb-6 font-medium">Free consultation & home assessment</p>
                  <Link href="/gallery" className="btn-secondary bg-white/25 hover:bg-white/35 text-white border-white/40 font-medium">
                    360° Virtual Tour
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-800 mb-4">Why Choose Tops Fireplaces?</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              We manufacture, supply and install our gas and electric fireplaces in plaster, 
              marble, stone and limestone, with wood surrounds and more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <feature.icon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-800 mb-3">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-800 mb-4">Featured Products</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Discover our most popular products, carefully selected for their quality and style.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative overflow-hidden">
                  <div className="aspect-w-4 aspect-h-3 bg-secondary-100">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-secondary-200 to-secondary-300 flex items-center justify-center">
                        <span className="text-secondary-500 text-lg">Fireplace Image</span>
                      </div>
                    )}
                  </div>
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {product.badge}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-secondary-800 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                  
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary-600">£{product.price.toLocaleString()}</span>
                      {product.original_price && product.original_price > 0 && product.original_price > product.price && (
                        <span className="text-lg text-secondary-500 line-through">
                          £{product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {product.original_price && product.original_price > 0 && product.original_price > product.price && (
                      <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                        Save £{(product.original_price - product.price).toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    href={`/products/${product.id}`}
                    className="btn-primary w-full text-center inline-block"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products" className="group relative inline-flex items-center text-lg px-8 py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300 rounded-lg font-medium">
              <span>View All Products</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              
              {/* Simple L-shaped decorative extension */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary-600 group-hover:border-white transition-colors duration-300"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gradient-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-secondary-800 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers across Essex.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-secondary-800">{testimonial.name}</p>
                  <p className="text-secondary-600">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-primary text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Home?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Book a free consultation and home assessment. Our experts will help you find 
              the perfect fireplace for your space and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary bg-white text-primary-600 hover:bg-white/90 text-lg px-8 py-4">
                Book Free Consultation
              </Link>
              <Link href="/gallery" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
                View Our Gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
