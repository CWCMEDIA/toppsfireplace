# Vercel Deployment Guide

## Domain Setup (topsfireplaces.shop)

### Step 1: Add Domain to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `topsfireplaces.shop`
6. Click **Add**
7. Vercel will show you DNS records to configure

### Step 2: Configure DNS Records

You'll need to add DNS records at your domain registrar (where you bought `topsfireplaces.shop`).

**For most registrars, you'll need:**

1. **A Record** (if Vercel provides one):
   - Type: `A`
   - Name: `@` (or root domain)
   - Value: Vercel's IP address (Vercel will show this)

2. **CNAME Record** (Vercel's preferred method):
   - Type: `CNAME`
   - Name: `@` (or root domain)
   - Value: `cname.vercel-dns.com` (or what Vercel shows you)

3. **WWW Subdomain** (optional but recommended):
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com` (or what Vercel shows you)

**Important Notes:**
- DNS changes can take 24-48 hours to propagate (usually much faster)
- You can check DNS propagation at [whatsmydns.net](https://www.whatsmydns.net)
- Vercel will automatically provision SSL certificates once DNS is configured
- Your site will be available at `https://topsfireplaces.shop` once DNS propagates

### Step 3: Update Stripe Webhook URL

After your domain is live, update Stripe webhook:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **Webhooks**
3. Edit your existing webhook or create a new one
4. Update the endpoint URL to: `https://topsfireplaces.shop/api/stripe/webhook`
5. Save the webhook
6. **Important**: Update the `STRIPE_WEBHOOK_SECRET` environment variable in Vercel with the new signing secret

---

## Environment Variables Setup

### Step 1: Go to Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable

#### 1. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** Generate using `openssl rand -base64 32` (see SECURITY.md)
- **Sensitive:** ✅ Yes
- **Environments:** Production, Preview (Development not allowed for sensitive variables)

#### 2. NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://mcgpfzczikkomhuhhlxw.supabase.co`
- **Sensitive:** ❌ No
- **Environments:** Production, Preview, Development

#### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `[Get from Supabase Dashboard → Settings → API]`
- **Sensitive:** ❌ No
- **Environments:** Production, Preview, Development

#### 4. SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `[Get from Supabase Dashboard → Settings → API]`
- **Sensitive:** ✅ Yes
- **Environments:** Production, Preview, Development

#### 5. STRIPE_SECRET_KEY
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** `[Get from Stripe Dashboard → Developers → API Keys]`
- **Sensitive:** ✅ Yes
- **Environments:** Production, Preview, Development

#### 6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** `[Get from Stripe Dashboard → Developers → API Keys]`
- **Sensitive:** ❌ No
- **Environments:** Production, Preview, Development

#### 7. STRIPE_WEBHOOK_SECRET
- **Key:** `STRIPE_WEBHOOK_SECRET`
- **Value:** `[Get from Stripe Dashboard → Developers → Webhooks]`
- **Sensitive:** ✅ Yes
- **Environments:** Production, Preview, Development

#### 8. NEXT_PUBLIC_SITE_URL (Optional but Recommended)
- **Key:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `https://topsfireplaces.shop`
- **Sensitive:** ❌ No
- **Environments:** Production, Preview, Development
- **Note:** Used for metadata and SEO. Defaults to `https://topsfireplaces.shop` if not set.

### Step 3: Where to Find Values

#### Supabase Values:
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

#### Stripe Values:
1. Go to [stripe.com](https://stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. For webhook secret:
   - Go to **Developers** → **Webhooks**
   - Select your webhook → **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 4: Deploy
1. After adding all variables, Vercel will automatically redeploy
2. Check the deployment logs for any errors
3. Test your live site!

## Important Notes:
- ✅ Mark sensitive variables as "Sensitive" (JWT_SECRET, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- ❌ Don't mark public variables as sensitive (NEXT_PUBLIC_*)
- Set all variables for Production, Preview, and Development environments
