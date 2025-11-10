# 🚀 Stripe Live Mode Setup Guide

## ✅ Ready to Go Live?

Before switching from **Test Mode** to **Live Mode**, make sure you've completed all testing and everything works correctly.

---

## 📋 Pre-Switch Checklist

### 1. **Complete Testing in Test Mode** ✅
- [ ] Test payment flow works end-to-end
- [ ] Customer receives all emails (Payment Processing, Confirmation)
- [ ] Client receives order notification emails
- [ ] Orders appear correctly in admin panel
- [ ] Webhooks are processing correctly
- [ ] Stripe fees are being calculated correctly
- [ ] Delivery distance check works
- [ ] Address autocomplete works
- [ ] Cart functionality works
- [ ] All product pages load correctly

### 2. **Verify Test Payments** ✅
- [ ] Made at least 2-3 test payments
- [ ] Verified webhooks fire correctly
- [ ] Verified emails send correctly
- [ ] Verified orders save to database
- [ ] Verified admin panel shows orders correctly

---

## 🔄 Switching to Live Mode

### Step 1: Activate Your Stripe Account

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com
2. **Complete Account Setup:**
   - [ ] Add business information
   - [ ] Add bank account details (for payouts)
   - [ ] Complete identity verification (if required)
   - [ ] Accept Stripe's terms of service
3. **Wait for Activation:**
   - Stripe will review your account (usually instant, but can take a few days)
   - You'll receive an email when activated

### Step 2: Get Your Live API Keys

1. **In Stripe Dashboard:**
   - Click the **"Test mode"** toggle in the top right
   - Switch it to **"Live mode"** (toggle will turn green)
2. **Go to Developers → API Keys:**
   - Copy your **Live Publishable Key** (starts with `pk_live_...`)
   - Copy your **Live Secret Key** (starts with `sk_live_...`)
   - ⚠️ **Keep these secret!** Never commit them to git

### Step 3: Update Environment Variables

**In your hosting platform (Vercel/Netlify/etc.):**

1. **Update Stripe Keys:**
   - [ ] Replace `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with live publishable key
   - [ ] Replace `STRIPE_SECRET_KEY` with live secret key
   - [ ] **DO NOT** delete test keys yet (keep for future testing)

2. **Set Up Live Webhook:**
   - [ ] Go to **Developers → Webhooks** in Stripe Dashboard
   - [ ] Click **"Add endpoint"**
   - [ ] Enter your production webhook URL:
     ```
     https://topsfireplaces.shop/api/stripe/webhook
     ```
   - [ ] Select events to listen to:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
   - [ ] Click **"Add endpoint"**
   - [ ] Copy the **Webhook signing secret** (starts with `whsec_...`)
   - [ ] Update `STRIPE_WEBHOOK_SECRET` in your environment variables

### Step 4: Test Live Mode (Small Test Payment)

**⚠️ IMPORTANT: Make a small real payment first!**

1. **Make a test purchase:**
   - Use a real card (your own)
   - Make a small purchase (e.g., £1 if possible, or minimum order)
   - Complete the checkout
2. **Verify everything works:**
   - [ ] Payment processes successfully
   - [ ] Customer receives emails
   - [ ] Client receives order notification
   - [ ] Order appears in admin panel
   - [ ] Webhook processes correctly
   - [ ] Stripe dashboard shows the payment
3. **If everything works:** ✅ You're live!
4. **If something fails:** Switch back to test mode and debug

---

## 🔐 Security Checklist for Live Mode

- [ ] All environment variables updated in hosting platform
- [ ] Live keys are NOT in `.env.local` (keep test keys there for local dev)
- [ ] Webhook URL is your production domain
- [ ] Webhook signing secret is updated
- [ ] HTTPS is enabled on your site
- [ ] Test mode toggle is OFF in Stripe dashboard

---

## 📊 What Changes in Live Mode

### What Stays the Same:
- ✅ Code structure (no code changes needed)
- ✅ API endpoints (same URLs)
- ✅ Webhook handling (same logic)
- ✅ Email sending (same templates)

### What Changes:
- 🔄 API keys (test → live)
- 🔄 Webhook secret (test → live)
- 🔄 Real money (test payments → real payments)
- 🔄 Real customer data (test data → real data)

---

## ⚠️ Important Notes

### 1. **Keep Test Keys for Development**
- Don't delete your test keys
- Keep them in `.env.local` for local development
- Use live keys only in production environment variables

### 2. **Webhook URL Must Match**
- Test webhook: Can use Stripe CLI or ngrok
- Live webhook: Must be your production domain
- Update webhook URL in Stripe dashboard

### 3. **Monitor First Few Payments**
- Watch Stripe dashboard for first real payments
- Check webhook logs for any errors
- Verify emails are sending correctly
- Check admin panel for orders

### 4. **Test Cards Don't Work in Live Mode**
- Test cards (4242 4242 4242 4242) only work in test mode
- In live mode, you need real cards
- Make a small real purchase to test

---

## 🧪 Testing Strategy

### Option 1: Small Real Payment (Recommended)
1. Make a small real purchase with your own card
2. Verify everything works
3. Refund the payment if needed (in Stripe dashboard)
4. Go live!

### Option 2: Staged Rollout
1. Keep test mode for a few more days
2. Do more thorough testing
3. Switch to live when 100% confident

---

## 🔄 Switching Back to Test Mode (If Needed)

If you need to switch back:
1. Toggle "Live mode" back to "Test mode" in Stripe dashboard
2. Update environment variables back to test keys
3. Redeploy your application
4. Test mode webhooks will work again

---

## ✅ Post-Switch Verification

After switching to live mode:

- [ ] Make a small test purchase
- [ ] Verify payment appears in Stripe dashboard
- [ ] Verify customer receives emails
- [ ] Verify client receives order notification
- [ ] Verify order appears in admin panel
- [ ] Verify webhook processes correctly
- [ ] Check Stripe dashboard for any errors
- [ ] Monitor for first 24 hours

---

## 🎉 You're Live!

Once everything is verified:
- ✅ Your site is accepting real payments
- ✅ Customers can make real purchases
- ✅ You'll receive real money (minus Stripe fees)
- ✅ Monitor your Stripe dashboard regularly

---

## 📞 Support

If you encounter issues:
1. Check Stripe dashboard → Logs
2. Check your hosting platform logs
3. Check webhook delivery logs in Stripe
4. Contact Stripe support if needed

---

**Good luck with your launch! 🚀**

