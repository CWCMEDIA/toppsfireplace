/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#DF2C28', // Main red from their site
          600: '#c91c1a', // Darker red for hover
          700: '#b01514', // Even darker
          800: '#991012',
          900: '#7f0f11',
        },
        secondary: {
          50: '#f5f5f5', // Light gray
          100: '#EAE1D8', // Light beige from their site
          200: '#EADED5', // Dominant beige from their site
          300: '#d4c9c1',
          400: '#827977', // Medium gray from their site
          500: '#8F9195', // Gray from their site
          600: '#6b6d71',
          700: '#1D1D1D', // Dark text from their site
          800: '#1a1a1a',
          900: '#0f0f0f',
        },
        accent: {
          50: '#f0f3f2',
          100: '#d9e3e0',
          200: '#AAB9B3', // Sage green from their site
          300: '#8fa69f',
          400: '#72938b',
          500: '#5a7a72',
          600: '#4a6560',
          700: '#3d514e',
          800: '#32403e',
          900: '#2a3432',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
