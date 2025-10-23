import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tops Fireplaces - Premium Fireplaces for Essex & Southend',
  description: 'Quality fireplaces in Southend & Essex. Trustworthy, affordable, dependable. Limestone, marble, granite fireplaces, gas & electric fires, and more.',
  keywords: 'fireplaces, Essex, Southend, limestone, marble, granite, gas fires, electric fires, stoves',
  authors: [{ name: 'Tops Fireplaces Ltd' }],
  openGraph: {
    title: 'Tops Fireplaces - Premium Fireplaces for Essex & Southend',
    description: 'Quality fireplaces in Southend & Essex. Trustworthy, affordable, dependable.',
    type: 'website',
    locale: 'en_GB',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}
