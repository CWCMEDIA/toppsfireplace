import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    products: [
      { name: 'Limestone Fireplaces', href: '/products?category=limestone' },
      { name: 'Marble Fireplaces', href: '/products?category=marble' },
      { name: 'Granite Fireplaces', href: '/products?category=granite' },
      { name: 'Gas Fires', href: '/products?category=gas-electric' },
      { name: 'Electric Fires', href: '/products?category=gas-electric' },
      { name: 'Wood Stoves', href: '/products?category=stoves' },
    ],
    services: [
      { name: 'Installation Service', href: '/services/installation' },
      { name: 'Home Assessment', href: '/services/assessment' },
      { name: 'Maintenance', href: '/services/maintenance' },
      { name: 'Repairs', href: '/services/repairs' },
      { name: 'Showroom Visit', href: '/showroom' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/about#story' },
      { name: 'Gallery', href: '/gallery' },
      { name: 'Testimonials', href: '/testimonials' },
      { name: 'Contact Us', href: '/contact' },
    ],
    support: [
      { name: 'FAQ', href: '/faq' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Installation Guide', href: '/installation-guide' },
      { name: 'Care Instructions', href: '/care-instructions' },
      { name: 'Warranty', href: '/warranty' },
    ],
  }

  return (
    <footer className="bg-secondary-900 text-white">
      {/* Main footer content */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 relative">
                <Image
                  src="/tops.png"
                  alt="Tops Fireplaces"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Tops Fireplaces</h3>
                <p className="text-secondary-300">Quality Fireplaces in Essex</p>
              </div>
            </div>
            <p className="text-secondary-300 mb-6 leading-relaxed">
              Established in 1988, we provide high-quality fireplaces, stoves, and accessories 
              to homes across Southend and Essex. Trustworthy, affordable, and dependable service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <span>01702 510222</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <span>topsfireplaces@hotmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-1" />
                <div>
                  <p>332 Bridgwater Drive</p>
                  <p>Westcliff-on-Sea, Essex</p>
                  <p>SS0 0EZ</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-400" />
                <div>
                  <p>Monday-Saturday: 09:00-17:30</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-secondary-400 text-sm">
              © {currentYear} Tops Fireplaces Ltd. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-secondary-400 hover:text-primary-400 transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
