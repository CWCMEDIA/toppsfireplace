# Email Setup Guide

This guide will help you set up email notifications for order confirmations.

## 📧 Email Service: Resend

We're using [Resend](https://resend.com) for sending transactional emails. It's reliable, easy to use, and has a generous free tier.

## 🚀 Quick Setup

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Tops Fireplaces Production")
4. Copy the API key (starts with `re_`)

### 3. Add Domain (Production Only)

For production, you'll need to verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter `topsfireplaces.shop`
4. Add the DNS records Resend provides to your domain registrar (IONOS)
5. Wait for verification (usually takes a few minutes)

**For testing/development:** You can use Resend's test domain without verification.

### 4. Add Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here

# Email Configuration
CLIENT_EMAIL=topsonlineshop@outlook.com
FROM_EMAIL=noreply@topsfireplaces.shop
```

**For Vercel Production:**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add all three variables:
   - `RESEND_API_KEY` (Sensitive, Production and Preview)
   - `CLIENT_EMAIL` (All Environments)
   - `FROM_EMAIL` (All Environments)

**Note:** For development, you can use Resend's test domain:
- `FROM_EMAIL=onboarding@resend.dev` (works without domain verification)

## 📨 Email Templates

### Customer Email
- **Subject:** "Order Confirmation - [ORDER_NUMBER]"
- **Recipient:** Customer's email address
- **Content:** Order details, items, delivery info, order number

### Client Email
- **Subject:** "🛒 New Order: [ORDER_NUMBER] - £[AMOUNT]"
- **Recipient:** `topsonlineshop@outlook.com` (configurable via `CLIENT_EMAIL`)
- **Content:** Full order details, customer info, shipping address, customer ID

## 🔑 Key Features

1. **Matching Order IDs:** Both emails use the same `order_number` (e.g., `ORD-1762789524776-KBWI0DSQ4`) and `order.id` (UUID) for tracking
2. **Customer ID:** The client email includes the order UUID as the "Customer ID" for database tracking
3. **Delivery Info:** Both emails show delivery distance and quote requirements
4. **Error Handling:** Email failures won't block order creation (emails are sent asynchronously)

## 🧪 Testing

1. Place a test order
2. Check your email inbox (customer email)
3. Check `topsonlineshop@outlook.com` (client email)
4. Verify both emails have the same order number

## 🐛 Troubleshooting

### Emails not sending?

1. **Check API Key:** Make sure `RESEND_API_KEY` is set correctly
2. **Check Domain:** For production, ensure your domain is verified in Resend
3. **Check Logs:** Look at your server console for email errors
4. **Test API Key:** You can test your API key at [Resend API Keys](https://resend.com/api-keys)

### Email going to spam?

1. **Verify Domain:** Make sure your domain is verified in Resend
2. **SPF/DKIM Records:** Resend provides these when you add a domain - make sure they're added to your DNS
3. **From Address:** Use a verified domain in the `FROM_EMAIL` variable

## 📊 Resend Limits

- **Free Tier:** 3,000 emails/month
- **Paid Plans:** Start at $20/month for 50,000 emails

For a small e-commerce site, the free tier should be sufficient initially.

## 🔒 Security Notes

- Never commit your `RESEND_API_KEY` to git
- Keep it in `.env.local` (already in `.gitignore`)
- Use different keys for development and production if needed

