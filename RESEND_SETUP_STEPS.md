# Resend Email Setup - Step by Step Guide

Follow these steps to fully set up email sending with your domain.

## Step 1: Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" (top right)
3. Sign up with your email (use `topsonlineshop@outlook.com` or your preferred email)
4. Verify your email address

## Step 2: Get Your API Key

1. Once logged in, go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key" button
3. Give it a name: **"Tops Fireplaces Production"**
4. Copy the API key (starts with `re_`)
   - ⚠️ **Save this key - you'll only see it once!**

## Step 3: Add Your Domain

1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain" button
3. Enter: `topsfireplaces.shop`
4. Click "Add Domain"

## Step 4: Get DNS Records

After adding the domain, Resend will show you DNS records to add. You'll see something like:

```
Type: TXT
Name: @
Value: resend._domainkey.topsfireplaces.shop TXT "p=..."

Type: TXT  
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

**Copy all of these records** - you'll need them for IONOS.

## Step 5: Add DNS Records to IONOS

1. Log into your IONOS account
2. Go to **Domains & SSL** → **topsfireplaces.shop** → **DNS**
3. Click **"Add Record"** for each record:

### Record 1: SPF (TXT)
- **Type:** TXT
- **Host Name:** `@` (or leave blank)
- **Value:** `"v=spf1 include:_spf.resend.com ~all"`
- **TTL:** 3600 (or default)
- Click **Save**

### Record 2: DKIM (TXT)
- **Type:** TXT
- **Host Name:** `@` (or leave blank)
- **Value:** (The long DKIM value from Resend - starts with `resend._domainkey.topsfireplaces.shop TXT "p=...`)
- **TTL:** 3600 (or default)
- Click **Save**

### Record 3: DKIM (CNAME)
- **Type:** CNAME
- **Host Name:** `resend._domainkey`
- **Value:** `resend._domainkey.resend.com`
- **TTL:** 3600 (or default)
- Click **Save**

## Step 6: Wait for Verification

1. Go back to Resend → Domains
2. You'll see "Pending Verification" status
3. Wait 5-15 minutes (DNS propagation can take time)
4. Refresh the page - it should change to "Verified" ✅

## Step 7: Update Environment Variables

### Local (.env.local)
Add these lines:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
CLIENT_EMAIL=topsonlineshop@outlook.com
FROM_EMAIL=noreply@topsfireplaces.shop
```

### Vercel Production
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:

**RESEND_API_KEY**
- Key: `RESEND_API_KEY`
- Value: `re_your_api_key_here`
- Environment: ✅ Production ✅ Preview
- Click "Save"

**CLIENT_EMAIL**
- Key: `CLIENT_EMAIL`
- Value: `topsonlineshop@outlook.com`
- Environment: ✅ Production ✅ Preview ✅ Development
- Click "Save"

**FROM_EMAIL**
- Key: `FROM_EMAIL`
- Value: `noreply@topsfireplaces.shop`
- Environment: ✅ Production ✅ Preview ✅ Development
- Click "Save"

## Step 8: Test It!

1. Restart your dev server (if running locally)
2. Place a test order
3. Check:
   - Customer email inbox (should receive confirmation)
   - `topsonlineshop@outlook.com` (should receive client notification)
4. Verify both emails show the same order number

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key generated and saved
- [ ] Domain `topsfireplaces.shop` added to Resend
- [ ] DNS records added to IONOS
- [ ] Domain verified in Resend (green checkmark)
- [ ] Environment variables added to `.env.local`
- [ ] Environment variables added to Vercel
- [ ] Test order placed
- [ ] Both emails received successfully

## 🐛 Troubleshooting

### Domain not verifying?
- Wait longer (DNS can take up to 24 hours, usually 5-15 minutes)
- Double-check DNS records in IONOS match Resend exactly
- Make sure there are no typos in the values
- Try removing and re-adding records

### Emails not sending?
- Check API key is correct
- Check environment variables are set
- Check server logs for errors
- Verify domain is verified in Resend

### Emails going to spam?
- Make sure domain is verified
- Check SPF/DKIM records are correct
- Wait a few days for domain reputation to build

## 📊 Free Tier Limits

- **3,000 emails/month** - Perfect for starting out
- **No credit card required**
- **All features included**

Need help? Let me know which step you're on!

