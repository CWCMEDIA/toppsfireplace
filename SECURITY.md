# Security Checklist

## Before Deploying to Production

### ✅ Environment Variables
All sensitive credentials MUST be set as environment variables in Vercel:

**Required Environment Variables:**
- `JWT_SECRET` - Secret key for JWT token signing (generate a strong random string)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (KEEP SECRET!)
- `STRIPE_SECRET_KEY` - Stripe secret API key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Generate JWT_SECRET:**
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### ✅ Database Security
1. **Change Default Admin Password**
   - Log into your Supabase admin panel
   - Change the default admin password from the schema
   - Use a strong, unique password

2. **Enable Row Level Security (RLS)**
   - Already configured in `supabase-schema.sql`
   - Verify RLS policies are active in Supabase dashboard

3. **Review Database Access**
   - Service role key should ONLY be used server-side
   - Never expose service role key to client-side code
   - Review and limit API access as needed

### ✅ API Security
1. **Admin Routes Protected**
   - All `/admin/*` routes require authentication
   - JWT tokens verified on every request
   - Tokens expire after 24 hours

2. **File Upload Security**
   - File type validation (images only)
   - File size limits (5MB max)
   - Uploaded to Supabase Storage with proper permissions

3. **Stripe Webhooks**
   - Webhook signature verification required
   - Only process events from Stripe
   - Update webhook URL after domain setup

### ✅ Code Security
1. **No Hardcoded Secrets**
   - ✅ Removed all hardcoded Supabase keys
   - ✅ Removed all hardcoded JWT secrets
   - All secrets come from environment variables

2. **Sensitive Files Excluded**
   - ✅ SQL data files in `.gitignore`
   - ✅ Environment files in `.gitignore`
   - ✅ Backup files excluded

3. **Input Validation**
   - All API routes validate input
   - SQL injection prevention (using Supabase client)
   - XSS protection (React escapes by default)

### ✅ Vercel Deployment
1. **Set All Environment Variables**
   - Add all required variables in Vercel dashboard
   - Mark sensitive variables as "Sensitive"
   - Don't commit `.env` files to git

2. **Domain Security**
   - Use HTTPS (automatic with Vercel)
   - Update Stripe webhook to production domain
   - Configure proper CORS if needed

### 🔒 Security Best Practices
- ✅ Use strong, unique passwords
- ✅ Rotate secrets periodically
- ✅ Monitor API usage and logs
- ✅ Keep dependencies updated
- ✅ Regular security audits
- ✅ Use HTTPS everywhere
- ✅ Implement rate limiting (consider adding)
- ✅ Regular backups of database

### ⚠️ Removed from Repository
The following files have been removed/deleted as they contained sensitive data:
- `bulk-insert-fireplaces.sql`
- `bulk-insert-products.sql`
- `add-missing-fireplaces.sql`

These files should be stored securely outside the repository if needed for future reference.

## Quick Security Check
Before deploying, verify:
- [ ] All environment variables set in Vercel
- [ ] No hardcoded secrets in code
- [ ] Default admin password changed
- [ ] `.gitignore` properly configured
- [ ] No sensitive files committed to git
- [ ] Stripe webhook URL updated for production domain
- [ ] All API routes have proper authentication
- [ ] Database RLS policies enabled

