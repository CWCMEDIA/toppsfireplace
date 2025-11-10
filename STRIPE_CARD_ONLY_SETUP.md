# Stripe Card-Only Payment Setup

## ✅ Code Configuration (Already Done)

### 1. Payment Intent Creation
**File:** `app/api/stripe/create-payment-intent/route.ts`
- ✅ Set `payment_method_types: ['card']` - This restricts the PaymentIntent to only accept card payments

### 2. Elements Provider Configuration
**File:** `app/checkout/page.tsx`
- ✅ Added `paymentMethodTypes: ['card']` to Elements options
- ✅ Added `paymentMethodTypes: ['card']` to PaymentElement options

## 🔧 Required: Stripe Dashboard Configuration

**IMPORTANT:** Even with code restrictions, you MUST also disable unwanted payment methods in your Stripe Dashboard.

### Steps to Disable Payment Methods in Stripe Dashboard:

1. **Log in to Stripe Dashboard**
   - Go to https://dashboard.stripe.com/
   - Navigate to your account

2. **Access Payment Methods Settings**
   - Click **Settings** (gear icon in top right)
   - Click **Payment methods** in the left sidebar

3. **Disable Unwanted Payment Methods**
   - Find and disable:
     - ❌ **Klarna** (Buy now, pay later)
     - ❌ **Revolut Pay**
     - ❌ **Amazon Pay**
     - ❌ **Link** (Stripe's "Secure, fast checkout with Link" feature)
     - ❌ Any other payment methods you don't want
   - **Keep enabled:**
     - ✅ **Card** (Visa, Mastercard, American Express, etc.)

4. **Disable Stripe Link Specifically**
   - In the **Payment Methods** section, find **Link**
   - Click on **Link**
   - Select **Turn off** to disable the "Secure, fast checkout with Link" feature
   - Provide a reason when prompted and click **Submit**

5. **Save Changes**
   - Click **Save** or **Update** to apply changes

### Alternative: Payment Method Restrictions

If you can't find individual toggles, you can also:
- Go to **Settings** > **Payment methods**
- Look for **Payment method restrictions** or **Allowed payment methods**
- Set it to only allow **Card** payments

## 🧪 Testing

After making Dashboard changes:
1. Clear your browser cache
2. Test the checkout flow
3. Verify that ONLY card payment option appears
4. Confirm Klarna, Revolut Pay, and Amazon Pay are NOT visible

## 🔒 Security Note

**Why both code AND dashboard settings are needed:**
- Code restrictions (`payment_method_types: ['card']`) prevent other payment methods from being processed
- Dashboard settings prevent PaymentElement from showing other payment options in the UI
- Both layers ensure complete restriction

## 📝 Current Code Status

✅ **Payment Intent:** Restricted to card only
✅ **Elements Provider:** Restricted to card only  
✅ **PaymentElement:** Restricted to card only
⚠️ **Stripe Dashboard:** **YOU MUST CONFIGURE THIS**

---

**Next Step:** Log into your Stripe Dashboard and disable Klarna, Revolut Pay, and Amazon Pay in the Payment Methods settings.

