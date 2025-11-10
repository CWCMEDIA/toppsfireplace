# Legal Compliance Guide for UK E-commerce

## Current Cookie & Data Usage Analysis

### Cookies Currently Used:

1. **`admin-token`** (Essential Cookie)
   - **Purpose**: Admin authentication session
   - **Type**: Essential/Strictly Necessary
   - **Lifespan**: 24 hours
   - **HTTP-Only**: Yes (secure, not accessible via JavaScript)
   - **Secure**: Yes (HTTPS only in production)
   - **Consent Required**: No (essential for site functionality)

### LocalStorage Usage:

1. **`cart`** - Shopping cart data
   - **Purpose**: Storing cart items locally in browser
   - **Note**: This is NOT a cookie, but should be mentioned in Privacy Policy

### Third-Party Services:

1. **Stripe** (Payment Processing)
   - May set cookies during checkout process
   - Processes payment data (handled by Stripe's secure infrastructure)
   - Must be disclosed in Privacy Policy

2. **Supabase** (Database/Backend)
   - Your data storage backend
   - No cookies set by Supabase client

3. **Google Fonts** (Inter font)
   - Loaded from `fonts.googleapis.com`
   - **Important**: May set cookies depending on your implementation
   - Currently loaded via Next.js `next/font/google` (should not set cookies)
   - Verify: Check your browser's developer tools to confirm

### Data Collection:

- Customer name, email, address (for orders)
- Payment information (processed by Stripe)
- Order history (stored in Supabase)
- Contact form submissions (if applicable)

---

## Legal Requirements & Approach

### 1. Cookie Consent Banner

**Status: ✅ LIKELY NOT REQUIRED**

- You currently only use **essential cookies** (`admin-token` for admin functionality)
- Users don't access admin features, so this cookie isn't relevant to customers
- **Action**: 
  - If you add analytics (Google Analytics, Facebook Pixel, etc.) → **REQUIRED**
  - If Google Fonts sets cookies → May require consent
  - For now: **No banner needed**, but document in Cookie Policy

### 2. Cookie Policy Page

**Status: ⚠️ REQUIRED**

**Content needed:**
- List all cookies used (currently just `admin-token` if applicable to customers)
- Explain what each cookie does
- Distinguish essential vs non-essential
- State that you only use essential cookies currently
- Mention Stripe's cookies (if applicable during checkout)
- Explain local storage usage (cart)
- Contact information for questions

**Location**: `/cookies` (already linked in footer ✓)

### 3. Privacy Policy Page

**Status: ⚠️ REQUIRED**

**Content needed:**
- **Data Controller**: Tops Fireplaces Ltd details
- **What data you collect**: Name, email, address, payment info, order history
- **Why you collect it**: Order processing, delivery, customer service
- **Legal basis**: Contract performance (GDPR Article 6(1)(b))
- **How you store it**: Supabase database, Stripe for payments
- **Third parties**: Stripe (payment processing), Supabase (hosting)
- **Data retention**: How long you keep customer data
- **Customer rights**: Access, deletion, correction (GDPR rights)
- **Contact**: How to exercise rights
- **Cookies**: Brief mention (link to Cookie Policy)

**Location**: `/privacy` (already linked in footer ✓)

### 4. Terms & Conditions Page

**Status: ⚠️ REQUIRED**

**Content needed (Consumer Contracts Regulations 2013):**
- **Company information**: Trading name, registered address, email, phone
- **Products**: Description, prices (including VAT), availability
- **Order process**: How orders work, confirmation
- **Payment**: Accepted methods, when payment is taken
- **Delivery**: 
  - Timeframes for delivery
  - Who pays delivery costs
  - What happens if delivery fails
  - Delivery areas (Essex/Southend?)
- **Right to cancel**: 
  - 14-day cooling-off period (distance selling)
  - How to cancel
  - Refunds for cancelled orders
- **Returns**: Conditions, timeframes, who pays return postage
- **Refunds**: When refunds are issued, how long they take
- **Warranty**: Product warranties/guarantees
- **Liability**: Limitations of liability
- **Complaints**: How to make complaints
- **Governing law**: UK law, English courts

**Location**: `/terms` (already linked in footer ✓)

### 5. Company Details (Footer)

**Status: ⚠️ PARTIALLY COMPLETE**

**Currently shown:**
- ✅ Trading name: Tops Fireplaces
- ✅ Address: 332 Bridgwater Drive, Westcliff-on-Sea, Essex SS0 0EZ
- ✅ Email: topsonlineshop@outlook.com
- ✅ Phone: 01702 510222

**May need (if Ltd company):**
- ⚠️ Company number (if Tops Fireplaces Ltd is a registered company)
- ⚠️ VAT number (if VAT registered)
- Consider adding to footer or Terms page

### 6. SSL Certificate

**Status: ✅ LIKELY HANDLED**

- If deploying on Vercel/Netlify → Automatic HTTPS/SSL
- If custom hosting → Ensure SSL certificate installed
- **Action**: Verify HTTPS works in production (should be automatic on Vercel)

---

## Recommended Implementation Order

1. ✅ **Company Details** - Verify/update footer with all legal details
2. ✅ **Terms & Conditions** - Most critical for e-commerce
3. ✅ **Privacy Policy** - Required by GDPR
4. ✅ **Cookie Policy** - Required by UK Privacy Regulations
5. ⚠️ **Cookie Banner** - Only if adding analytics later

---

## Notes

### Google Fonts Check:
Your site uses `next/font/google` which typically self-hosts fonts and shouldn't set cookies. However, verify in production:
- Open browser DevTools → Network tab
- Filter by "font" or "googleapis"
- Check response headers for Set-Cookie
- If cookies present → May need consent banner

### Stripe Cookies:
During checkout, Stripe may set cookies. Check:
- During checkout flow, inspect cookies in DevTools
- Stripe's terms require you to disclose their data processing
- Usually Stripe cookies are essential for payment processing (no consent needed)

### Future Considerations:
If you add:
- Google Analytics → Cookie consent banner REQUIRED
- Facebook Pixel → Cookie consent banner REQUIRED
- Email marketing tracking → Cookie consent banner REQUIRED
- Any advertising/tracking → Cookie consent banner REQUIRED

---

## Quick Checklist

- [ ] Create `/terms` page with full Terms & Conditions
- [ ] Create `/privacy` page with Privacy Policy
- [ ] Create `/cookies` page with Cookie Policy
- [ ] Verify company details in footer (add company number if applicable)
- [ ] Test HTTPS in production
- [ ] Verify Google Fonts doesn't set cookies
- [ ] Document Stripe's cookie usage (if any)
- [ ] Consider adding cookie consent banner IF you add analytics

