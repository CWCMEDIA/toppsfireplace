#!/bin/bash

# Tops Fireplaces E-commerce Setup Script
echo "🔥 Setting up Tops Fireplaces E-commerce Website..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create .env.local file
echo "🔧 Creating environment file..."
cat > .env.local << EOF
# Tops Fireplaces Environment Variables
NEXT_PUBLIC_SITE_NAME="Tops Fireplaces"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_CONTACT_EMAIL="topsfireplaces@hotmail.com"
NEXT_PUBLIC_CONTACT_PHONE="01702 510222"

# Admin Configuration
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
JWT_SECRET="your-secret-key-change-in-production"

# Database (for future implementation)
DATABASE_URL="postgresql://username:password@localhost:5432/topsfireplaces"
EOF

echo "✅ Environment file created"

# Create public directory structure
echo "📁 Creating public directory structure..."
mkdir -p public/images/products
mkdir -p public/images/gallery
mkdir -p public/images/hero

echo "✅ Public directories created"

# Display success message
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "🌐 Then open your browser to:"
echo "   http://localhost:3000"
echo ""
echo "🔐 Admin access:"
echo "   URL: http://localhost:3000/admin-login"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "🔥 Welcome to Tops Fireplaces E-commerce!"
