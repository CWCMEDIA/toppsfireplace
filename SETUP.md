# Tops Fireplaces E-commerce Setup Guide

This guide will help you set up the complete backend system for Tops Fireplaces e-commerce website.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Admin Configuration
ADMIN_EMAIL=admin@topsfireplaces.com
ADMIN_PASSWORD_HASH=your_hashed_password_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Tops Fireplaces"
```

### 2. Database Setup (Supabase)

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Set up the Database:**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase-schema.sql`
   - Run the SQL script to create all tables and sample data

3. **Configure Storage:**
   - Go to Storage in your Supabase dashboard
   - The `product-images` bucket should be created automatically
   - Set the bucket to public if you want images to be publicly accessible

4. **Get your API Keys:**
   - Go to Settings > API in your Supabase dashboard
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

### 3. Stripe Setup

1. **Create a Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Create an account or log in
   - Complete the account setup

2. **Get API Keys:**
   - Go to Developers > API keys in your Stripe dashboard
   - Copy the Publishable key and Secret key
   - Use test keys for development, live keys for production

3. **Set up Webhooks:**
   - Go to Developers > Webhooks in your Stripe dashboard
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook signing secret

### 4. Admin User Setup

The database schema includes a default admin user:
- **Email:** admin@topsfireplaces.com
- **Password:** admin123

**⚠️ IMPORTANT:** Change this password immediately in production!

To create a new admin user, you can use the Supabase dashboard or create a script.

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Development Server

```bash
npm run dev
```

## 🔧 Features Included

### ✅ Complete Admin System
- **Secure Authentication:** JWT-based admin login
- **Product Management:** Add, edit, delete products with full details
- **Image Upload:** Direct image upload to Supabase storage
- **Order Management:** View and manage customer orders
- **Real-time Updates:** Changes appear instantly

### ✅ E-commerce Features
- **Product Catalog:** Browse products with filtering and search
- **Shopping Cart:** Add/remove items, quantity management
- **Checkout Process:** Complete Stripe payment integration
- **Order Tracking:** Real-time order status updates

### ✅ Payment Processing
- **Stripe Integration:** Secure payment processing
- **Webhook Handling:** Automatic order confirmation
- **Multiple Payment Methods:** Cards, digital wallets, etc.

### ✅ Database Features
- **PostgreSQL:** Robust, scalable database
- **File Storage:** Secure image storage
- **Real-time:** Live updates across the platform
- **Security:** Row-level security policies

## 📁 File Structure

```
├── app/
│   ├── api/
│   │   ├── products/          # Product management API
│   │   ├── orders/            # Order management API
│   │   ├── upload/            # Image upload API
│   │   ├── auth/              # Authentication API
│   │   └── stripe/            # Stripe payment API
│   ├── admin/                 # Admin dashboard
│   ├── checkout/              # Checkout page
│   └── products/              # Product catalog
├── components/
│   ├── ProductForm.tsx        # Product management form
│   └── LoadingSpinner.tsx     # Custom loading animation
├── lib/
│   ├── supabase.ts           # Database client
│   ├── types.ts              # TypeScript types
│   └── auth.ts               # Authentication utilities
└── supabase-schema.sql       # Database schema
```

## 🛡️ Security Features

- **JWT Authentication:** Secure admin access
- **Password Hashing:** bcrypt for password security
- **Row Level Security:** Database-level access control
- **Input Validation:** Server-side validation
- **CORS Protection:** Secure API endpoints

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify:** Similar to Vercel
- **Railway:** Good for full-stack apps
- **DigitalOcean:** More control, requires more setup

## 📞 Support

If you need help with setup or have questions:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase and Stripe are properly configured
4. Check the browser network tab for API errors

## 🔄 Next Steps

1. **Customize the design** to match your brand
2. **Add more product categories** as needed
3. **Set up email notifications** for orders
4. **Configure shipping** and tax calculations
5. **Add customer accounts** and order history
6. **Implement reviews** and ratings system

---

**🎉 Congratulations!** You now have a complete, production-ready e-commerce backend system that your client can use to manage their fireplace business online.
