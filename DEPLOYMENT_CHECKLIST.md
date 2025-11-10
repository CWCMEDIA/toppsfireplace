# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables
Ensure all these are set in your hosting platform (Vercel/Netlify/etc.):

#### Required Variables:
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `RESEND_API_KEY` - Resend API key for emails
- [ ] `CLIENT_EMAIL` - Email to receive order notifications (default: topsonlineshop@outlook.com)
- [ ] `FROM_EMAIL` - Email to send from (default: noreply@topsfireplaces.shop)
- [ ] `GOOGLE_GEOCODING_API_KEY` - Server-side Google Geocoding API key
- [ ] `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Client-side Google Places API key

#### Optional Variables:
- [ ] `NEXT_PUBLIC_SITE_URL` - Your production URL (defaults to https://topsfireplaces.shop)
- [ ] `YOUTUBE_CLIENT_ID` - Only if using YouTube uploads
- [ ] `YOUTUBE_CLIENT_SECRET` - Only if using YouTube uploads
- [ ] `YOUTUBE_REFRESH_TOKEN` - Only if using YouTube uploads
- [ ] `YOUTUBE_REDIRECT_URI` - Only if using YouTube uploads (should be: https://yourdomain.com/api/youtube/callback)

### 2. Stripe Webhook Configuration
- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Add endpoint: `https://yourdomain.com/api/stripe/webhook`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`
- [ ] Test the webhook with a test payment

### 3. Google API Configuration
- [ ] **Geocoding API Key** (server-side):
  - Restrict to "Geocoding API" only
  - Restrict to your server IPs (or no restrictions if using server-side only)
  - Set daily quota to 300 requests/day (free tier)
  
- [ ] **Places API Key** (client-side):
  - Restrict to "Maps JavaScript API" and "Places API"
  - Add HTTP referrer restrictions:
    - `https://yourdomain.com/*`
    - `https://www.yourdomain.com/*`
    - `http://localhost:3000/*` (for local testing)
  - Set daily quota to 3,000 requests/day (free tier)

### 4. Resend Email Configuration
- [ ] Verify your domain in Resend dashboard
- [ ] Add DNS records (TXT and MX) as instructed by Resend
- [ ] Test email sending from Resend dashboard
- [ ] Ensure `FROM_EMAIL` matches your verified domain

### 5. Database (Supabase)
- [ ] Verify all tables exist (run `database-schema.sql` if needed)
- [ ] Verify admin user exists in `admin_users` table
- [ ] Test database connection from production
- [ ] Set up database backups

### 6. Security Checks
- [ ] Verify HTTPS is enabled on your hosting platform
- [ ] Test that HTTP redirects to HTTPS
- [ ] Verify security headers are being sent (check with securityheaders.com)
- [ ] Test admin login works
- [ ] Test that non-admin users can't access `/admin` routes

### 7. API Routes Testing
- [ ] Test payment intent creation
- [ ] Test order creation
- [ ] Test delivery check
- [ ] Test admin routes (with authentication)
- [ ] Test webhook endpoint (Stripe will test this)

### 8. Frontend Checks
- [ ] Test checkout flow end-to-end
- [ ] Test address autocomplete (Google Places)
- [ ] Test cart functionality
- [ ] Test product pages
- [ ] Test admin panel

---

## 🔧 Post-Deployment Verification

### 1. Test Payment Flow
1. Add item to cart
2. Go to checkout
3. Fill in address (test Google Places autocomplete)
4. Complete test payment
5. Verify:
   - [ ] Customer receives "Payment Processing" email
   - [ ] Customer receives "Order Confirmation" email
   - [ ] Client receives order notification email
   - [ ] Order appears in admin panel
   - [ ] Stripe webhook processes payment

### 2. Test Admin Panel
1. Login to admin panel
2. Verify all tabs work:
   - [ ] Products
   - [ ] Gallery
   - [ ] Brands
   - [ ] Your Orders
   - [ ] Revenue Analytics
3. Test creating/editing products
4. Test file uploads

### 3. Monitor Logs
- [ ] Check for any errors in hosting platform logs
- [ ] Check Stripe webhook logs
- [ ] Check Resend email logs
- [ ] Monitor for any security warnings

---

## 🐛 Common Deployment Issues

### Issue: "API route not found"
**Solution:** 
- Verify Next.js is configured correctly
- Check that API routes are in `app/api/` directory
- Ensure hosting platform supports Next.js App Router

### Issue: "Environment variable not found"
**Solution:**
- Double-check all env vars are set in hosting platform
- Ensure variable names match exactly (case-sensitive)
- Restart/redeploy after adding env vars

### Issue: "Stripe webhook not working"
**Solution:**
- Verify webhook URL is correct in Stripe dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Test webhook endpoint manually
- Check hosting platform logs for errors

### Issue: "Google Maps not loading"
**Solution:**
- Verify `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set
- Check API key restrictions in Google Cloud Console
- Ensure your domain is in HTTP referrer restrictions
- Check browser console for errors

### Issue: "Emails not sending"
**Solution:**
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Verify domain is verified in Resend
- Check `FROM_EMAIL` matches verified domain
- Check rate limits (2 requests/second)

---

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set
- [ ] Stripe webhook configured and tested
- [ ] Google API keys configured and restricted
- [ ] Resend domain verified
- [ ] Test payment completed successfully
- [ ] All emails sending correctly
- [ ] Admin panel accessible and working
- [ ] No errors in logs
- [ ] HTTPS working
- [ ] Security headers verified
- [ ] Database backups configured

---

## 🎉 You're Ready!

Once all checks are complete, your site is ready for production! 🚀

