# Step-by-Step: Setting Environment Variables in Vercel

Follow these steps to securely configure all environment variables for your deployment.

## Step 1: Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click on your project **"toppsfireplace"** (or whatever you named it)

## Step 2: Navigate to Environment Variables

1. Click on **"Settings"** in the top menu
2. In the left sidebar, click **"Environment Variables"**
3. You'll see a page where you can add variables

## Step 3: Generate JWT_SECRET First

Before adding variables, generate a secure JWT_SECRET:

### Option A: Using Terminal (Recommended)
```bash
openssl rand -base64 32
```

**Copy the output** - you'll need it in the next step.

### Option B: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Add Each Environment Variable

For each variable below, follow these steps:
1. Click **"Add New"** button
2. Enter the **Key** (variable name)
3. Enter the **Value** (the actual value)
4. **Check "Sensitive"** if marked with ✅ below
   - ⚠️ **IMPORTANT:** For sensitive variables, you can ONLY select Production and Preview (NOT Development)
   - For non-sensitive variables, you can select all three (Production, Preview, Development)
5. Select **Environments**: 
   - **Sensitive variables:** ✅ Production, ✅ Preview, ❌ Development
   - **Non-sensitive variables:** ✅ Production, ✅ Preview, ✅ Development
6. Click **"Save"**

### Variable 1: JWT_SECRET ⚠️ SENSITIVE

**Key:** `JWT_SECRET`

**Value:** Paste the value you generated in Step 3 (the long random string)

**Sensitive:** ✅ YES - Check this box!

**Environments:** ✅ Production, ✅ Preview, ❌ Development (Development NOT allowed for sensitive variables)

---

### Variable 2: NEXT_PUBLIC_SUPABASE_URL

**Key:** `NEXT_PUBLIC_SUPABASE_URL`

**Value:** `https://mcgpfzczikkomhuhhlxw.supabase.co`

**Sensitive:** ❌ NO

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get:** 
- Go to [supabase.com](https://supabase.com)
- Select your project
- Settings → API
- Copy "Project URL"

---

### Variable 3: NEXT_PUBLIC_SUPABASE_ANON_KEY

**Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Value:** [Get from Supabase - see instructions below]

**Sensitive:** ❌ NO (this is a public key)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click **Settings** (gear icon) → **API**
4. Under "Project API keys"
5. Find **"anon public"** key
6. Click the copy icon 📋
7. Paste into Vercel

---

### Variable 4: SUPABASE_SERVICE_ROLE_KEY ⚠️ VERY SENSITIVE

**Key:** `SUPABASE_SERVICE_ROLE_KEY`

**Value:** [Get from Supabase - see instructions below]

**Sensitive:** ✅ YES - MUST CHECK THIS!

**Environments:** ✅ Production, ✅ Preview, ❌ Development (Development NOT allowed for sensitive variables)

**How to get:**
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click **Settings** → **API**
4. Under "Project API keys"
5. Find **"service_role"** key
6. ⚠️ **WARNING:** This key has admin access - never share it!
7. Click the copy icon 📋
8. Paste into Vercel
9. **MAKE SURE "Sensitive" is checked!**

---

### Variable 5: STRIPE_SECRET_KEY ⚠️ SENSITIVE

**Key:** `STRIPE_SECRET_KEY`

**Value:** [Get from Stripe - see instructions below]

**Sensitive:** ✅ YES

**Environments:** ✅ Production, ✅ Preview, ❌ Development (Development NOT allowed for sensitive variables)

**How to get:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Find **"Secret key"** (starts with `sk_live_` for production or `sk_test_` for testing)
4. Click **"Reveal test key"** or **"Reveal live key"**
5. Copy the key
6. Paste into Vercel

---

### Variable 6: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

**Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Value:** [Get from Stripe - see instructions below]

**Sensitive:** ❌ NO (this is a public key)

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to get:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** → **API keys**
3. Find **"Publishable key"** (starts with `pk_live_` or `pk_test_`)
4. Copy the key
5. Paste into Vercel

---

### Variable 7: STRIPE_WEBHOOK_SECRET ⚠️ SENSITIVE

**Key:** `STRIPE_WEBHOOK_SECRET`

**Value:** [Get from Stripe - see instructions below]

**Sensitive:** ✅ YES

**Environments:** ✅ Production, ✅ Preview, ❌ Development (Development NOT allowed for sensitive variables)

**How to get:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Click **Developers** → **Webhooks**
3. If you don't have a webhook yet:
   - Click **"Add endpoint"**
   - Endpoint URL: `https://[your-vercel-url].vercel.app/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Click **"Add endpoint"**
4. Click on your webhook endpoint
5. Under **"Signing secret"**, click **"Reveal"**
6. Copy the secret (starts with `whsec_`)
7. Paste into Vercel
8. **MAKE SURE "Sensitive" is checked!**
9. **Only select Production and Preview environments (Development is not allowed for sensitive variables)**

**Note:** After you set up your custom domain, you'll need to update the webhook URL to use your domain instead of the Vercel URL.

---

## Step 5: Verify All Variables Are Added

After adding all 7 variables, your Vercel Environment Variables page should show:

✅ `JWT_SECRET` (Sensitive)
✅ `NEXT_PUBLIC_SUPABASE_URL`
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
✅ `SUPABASE_SERVICE_ROLE_KEY` (Sensitive)
✅ `STRIPE_SECRET_KEY` (Sensitive)
✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
✅ `STRIPE_WEBHOOK_SECRET` (Sensitive)

## Step 6: Redeploy

1. After adding all variables, Vercel will automatically detect changes
2. Go to **"Deployments"** tab
3. Click the **"..."** menu on the latest deployment
4. Click **"Redeploy"**
5. Or push a new commit to trigger a new deployment

## Step 7: Verify Deployment

1. Once deployment completes, click on the deployment
2. Check the **"Build Logs"** for any errors
3. If you see errors about missing environment variables, double-check you added them all
4. Test your live site!

## Troubleshooting

### Error: "Missing required JWT_SECRET"
- ✅ Make sure you added `JWT_SECRET` in Vercel
- ✅ Check it's enabled for all environments (Production, Preview, Development)

### Error: "Missing required Supabase environment variables"
- ✅ Verify all three Supabase variables are added:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Missing required SUPABASE_SERVICE_ROLE_KEY"
- ✅ Check you copied the **service_role** key (not the anon key)
- ✅ Make sure there are no extra spaces when pasting

### Stripe Webhook Not Working
- ✅ Make sure webhook URL in Stripe matches your Vercel deployment URL
- ✅ After setting custom domain, update webhook URL to use your domain
- ✅ Copy the new webhook secret and update `STRIPE_WEBHOOK_SECRET` in Vercel

## Security Checklist

Before going live, verify:
- [ ] All 7 environment variables are added
- [ ] All sensitive variables are marked as "Sensitive" (4 total)
- [ ] Sensitive variables only have Production + Preview selected (NOT Development)
- [ ] Non-sensitive variables have all 3 environments selected
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] SUPABASE_SERVICE_ROLE_KEY is correct and marked sensitive
- [ ] STRIPE_SECRET_KEY is the correct key (live vs test)
- [ ] Deployment completed successfully
- [ ] No errors in build logs

## Next Steps

After environment variables are set:
1. Test the admin login: `/admin-login`
2. Test product pages
3. Test cart functionality
4. Set up custom domain (if needed)
5. Update Stripe webhook URL to use custom domain

---

**Need Help?** If you run into issues, check the deployment logs in Vercel for specific error messages.

