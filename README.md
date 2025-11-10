# Tops Fireplaces E-commerce Website

A modern, responsive e-commerce website for Tops Fireplaces, featuring a beautiful design inspired by premium fireplace retailers. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Customer-Facing Features
- **Modern Homepage** - Hero section with company branding and featured products
- **Product Catalog** - Advanced filtering, search, and sorting capabilities
- **Product Details** - Comprehensive product pages with image galleries and specifications
- **Shopping Cart** - Full cart functionality with quantity management
- **Contact Forms** - Multiple contact methods and enquiry types
- **Responsive Design** - Mobile-first approach with beautiful animations
- **Loading Animations** - Custom loading states with company branding

### Admin Features
- **Secure Admin Panel** - Protected admin area for product management
- **Product Management** - Add, edit, delete, and manage product inventory
- **Dashboard** - Overview of products, orders, and business metrics
- **Authentication** - Secure login system for admin access

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd toppsfireplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

To access the admin panel:

1. Navigate to `/admin-login`
2. Contact the administrator for login credentials

## 📁 Project Structure

```
toppsfireplace/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── admin-login/       # Admin authentication
│   ├── cart/              # Shopping cart
│   ├── contact/           # Contact page
│   ├── products/          # Product catalog
│   │   └── [id]/         # Individual product pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   └── Footer.tsx         # Site footer
├── public/               # Static assets
└── ...config files
```

## 🎨 Design Features

### Color Scheme
- **Primary**: Warm orange/amber tones (#ed7c3a)
- **Secondary**: Professional grays (#64748b)
- **Accent**: Cool blues (#0ea5e9)

### Typography
- **Headings**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)

### Animations
- Smooth page transitions
- Hover effects on interactive elements
- Loading animations with company branding
- Scroll-triggered animations

## 🛒 E-commerce Features

### Product Management
- Product categories (Limestone, Marble, Granite, etc.)
- Subcategories (Fireplaces, Stoves, Electric Fires)
- Material and fuel type filtering
- Price range filtering
- Search functionality

### Shopping Experience
- Product image galleries
- Detailed specifications
- Customer reviews and ratings
- Stock management
- Price comparisons with savings

### Admin Panel
- Product CRUD operations
- Inventory management
- Order tracking (placeholder)
- Business analytics dashboard

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Customization

### Adding New Products
1. Access the admin panel at `/admin`
2. Click "Add Product"
3. Fill in product details
4. Save the product

### Modifying Styles
- Edit `tailwind.config.js` for theme customization
- Modify `app/globals.css` for global styles
- Update component files for specific styling

### Adding New Pages
1. Create a new folder in the `app` directory
2. Add a `page.tsx` file
3. Update navigation in `components/Header.tsx`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Compatible with Next.js
- **AWS**: Use AWS Amplify or custom setup
- **DigitalOcean**: Use App Platform

## 🔒 Security Considerations

- Admin authentication (implement proper JWT in production)
- Input validation on all forms
- XSS protection
- CSRF protection
- Secure file uploads (for product images)

## 📈 Future Enhancements

- **Payment Integration**: Stripe, PayPal, or other payment processors
- **Database Integration**: PostgreSQL, MongoDB, or similar
- **Image Upload**: Cloudinary or AWS S3 for product images
- **Email Service**: SendGrid or similar for notifications
- **Analytics**: Google Analytics or similar
- **SEO Optimization**: Meta tags, sitemaps, structured data
- **Multi-language Support**: Internationalization
- **Advanced Search**: Elasticsearch or similar
- **Inventory Management**: Real-time stock updates
- **Order Management**: Complete order processing system

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   npm run dev -- -p 3001
   ```

2. **TypeScript errors**
   ```bash
   npm run build
   ```

3. **Tailwind not working**
   ```bash
   npm run dev
   ```

## 📞 Support

For technical support or questions:
- **Email**: topsonlineshop@outlook.com
- **Phone**: 01702 510222

## 📄 License

This project is proprietary software for Tops Fireplaces Ltd.

---

**Built with ❤️ for Tops Fireplaces**
