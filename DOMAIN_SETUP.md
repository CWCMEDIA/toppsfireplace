# Domain Setup Guide: topsfireplaces.shop

This guide will help you connect your custom domain `topsfireplaces.shop` to your Vercel-hosted site.

## 📋 Prerequisites

- ✅ Domain purchased: `topsfireplaces.shop`
- ✅ Vercel account with your project deployed
- ✅ Access to your domain registrar's DNS management panel

---

## 🔧 Step-by-Step Instructions

### Part 1: Add Domain in Vercel

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in to your account

2. **Navigate to Your Project**
   - Click on your project (Tops Fireplaces)

3. **Go to Domains Settings**
   - Click **Settings** (top navigation)
   - Click **Domains** (left sidebar)

4. **Add Your Domain**
   - Click the **Add Domain** button
   - Enter: `topsfireplaces.shop`
   - Click **Add**

5. **Vercel Shows DNS Instructions**
   - Vercel will display DNS records you need to add
   - **Save this information** - you'll need it for the next step
   - Usually shows something like:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```

---

### Part 2: Configure DNS at Your Registrar

The exact steps depend on where you bought your domain. Here are common registrars:

#### If you bought from:
- **Namecheap** → Go to Domain List → Manage → Advanced DNS
- **GoDaddy** → Go to My Products → DNS → Manage DNS
- **Google Domains** → Go to DNS → Custom records
- **Cloudflare** → Go to DNS → Records
- **Other registrars** → Look for "DNS Management", "DNS Settings", or "Nameservers"

#### DNS Records to Add:

**Option A: CNAME Record (Vercel's Preferred Method)**

1. Add a **CNAME** record:
   - **Type**: `CNAME`
   - **Host/Name**: `@` (or leave blank, or `topsfireplaces.shop`)
   - **Value/Points to**: `cname.vercel-dns.com` (or what Vercel shows you)
   - **TTL**: `3600` (or Auto)

2. (Optional) Add `www` subdomain:
   - **Type**: `CNAME`
   - **Host/Name**: `www`
   - **Value/Points to**: `cname.vercel-dns.com`
   - **TTL**: `3600`

**Option B: A Records (If CNAME not supported for root domain)**

Some registrars don't allow CNAME on root domain. In that case:

1. Delete any existing A records for `@` (root domain)
2. Add the A records Vercel provides (usually IP addresses)

---

### Part 3: Verify DNS Propagation

1. **Wait for DNS Propagation**
   - Usually takes 5 minutes to 48 hours
   - Typically happens within 1-2 hours

2. **Check DNS Propagation**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter: `topsfireplaces.shop`
   - Select: `CNAME` record
   - Check if it shows `cname.vercel-dns.com` globally

3. **Check Vercel Dashboard**
   - Go back to Vercel → Settings → Domains
   - Status should change from "Pending" to "Valid" ✅
   - SSL certificate will be automatically provisioned

---

### Part 4: Update Stripe Webhook (IMPORTANT!)

Your Stripe webhook needs to point to your new domain.

1. **Go to Stripe Dashboard**
   - Visit [dashboard.stripe.com](https://dashboard.stripe.com)
   - Sign in

2. **Navigate to Webhooks**
   - Click **Developers** → **Webhooks**
   - Find your existing webhook (or create new one)

3. **Update Webhook Endpoint**
   - Click **Add endpoint** (if new) or **Edit** (if existing)
   - **Endpoint URL**: `https://topsfireplaces.shop/api/stripe/webhook`
   - **Events to send**: Select:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Click **Add endpoint** or **Save**

4. **Copy the New Signing Secret**
   - After creating/editing, click on the webhook
   - Click **Reveal** next to "Signing secret"
   - Copy the secret (starts with `whsec_...`)

5. **Update Vercel Environment Variable**
   - Go back to Vercel → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Click **Edit**
   - Paste the new signing secret
   - Make sure it's set for **Production** environment
   - Click **Save**
   - Vercel will automatically redeploy

---

### Part 5: Test Your Site

1. **Visit Your Domain**
   - Go to `https://topsfireplaces.shop`
   - Should load your site (HTTPS is automatic!)

2. **Test Checkout**
   - Add item to cart
   - Go through checkout flow
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify payment processes correctly

3. **Check SSL Certificate**
   - Look for padlock icon in browser
   - Click padlock → Should show "Connection is secure"

---

## ✅ Verification Checklist

- [ ] Domain added in Vercel dashboard
- [ ] DNS records configured at registrar
- [ ] DNS propagated (check whatsmydns.net)
- [ ] Vercel shows domain as "Valid" ✅
- [ ] Site loads at `https://topsfireplaces.shop`
- [ ] SSL certificate active (padlock icon)
- [ ] Stripe webhook updated to new domain
- [ ] Stripe webhook secret updated in Vercel
- [ ] Test checkout works correctly

---

## 🐛 Troubleshooting

### Domain Not Working?

1. **DNS Not Propagated Yet**
   - Wait longer (up to 48 hours)
   - Check different DNS servers at whatsmydns.net

2. **Vercel Shows "Invalid Configuration"**
   - Double-check DNS records match exactly what Vercel shows
   - Ensure no typos in CNAME value
   - Remove conflicting DNS records

3. **SSL Certificate Not Provisioning**
   - DNS must be fully propagated first
   - Can take additional time after DNS is valid
   - Check Vercel dashboard for SSL status

4. **Stripe Webhook Not Working**
   - Verify webhook URL is correct: `https://topsfireplaces.shop/api/stripe/webhook`
   - Check webhook secret matches in Vercel
   - Check Stripe webhook logs for errors

### Still Having Issues?

- Check Vercel's domain documentation: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)
- Contact Vercel support (they're very helpful!)
- Check your domain registrar's DNS documentation

---

## 🎉 Success!

Once everything is set up, your site will be live at:
- **Primary**: `https://topsfireplaces.shop`
- **WWW** (if configured): `https://www.topsfireplaces.shop`

Both URLs will work automatically with HTTPS! 🔒

