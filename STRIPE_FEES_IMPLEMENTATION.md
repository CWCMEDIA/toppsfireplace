# Stripe Fees Implementation Guide

## ✅ Best Practice: Pull Net Amount from Stripe (NOT Hardcode)

### Why NOT Hardcode Fees?

**Stripe fees vary based on:**
- Payment method (card, bank transfer, etc.)
- Card type (debit vs credit)
- Country of card issuer
- Currency
- Stripe account type (standard vs express)

**Example fee variations:**
- UK debit card: 1.4% + 20p
- UK credit card: 1.4% + 20p
- EU card: 1.4% + 20p
- Non-UK/EU card: 2.9% + 20p
- Bank transfer: Different fees

**Hardcoding would be inaccurate and could lead to:**
- ❌ Incorrect profit calculations
- ❌ Accounting discrepancies
- ❌ Tax reporting errors

## ✅ Secure Solution: Pull from Stripe API

### How It Works:

1. **When payment succeeds**, Stripe sends a webhook
2. **We retrieve the Charge object** from Stripe (secure, server-side)
3. **Extract the net amount** (amount after fees)
4. **Store it in the database** for accurate record-keeping

### Security:

- ✅ **Server-side only** - API calls happen on your server
- ✅ **Authenticated** - Uses your Stripe secret key
- ✅ **Real-time** - Gets actual amount received
- ✅ **Accurate** - Reflects actual Stripe fees charged

## 📊 Database Schema

We'll add a new field to store the net amount:

```sql
ALTER TABLE orders ADD COLUMN net_amount_received DECIMAL(10,2);
```

This stores:
- `total_amount` = Gross amount (what customer paid)
- `net_amount_received` = Net amount (what you actually received after Stripe fees)

## 🔍 How to Get Net Amount

From Stripe's PaymentIntent, we can:
1. Get the latest charge
2. Get the balance transaction
3. Extract the net amount (amount - fees)

**Stripe API:**
```typescript
const charge = await stripe.charges.retrieve(paymentIntent.latest_charge)
const balanceTransaction = await stripe.balanceTransactions.retrieve(charge.balance_transaction)
const netAmount = balanceTransaction.net // This is what you actually received
```

## 💡 Implementation

The webhook handler will:
1. Receive `payment_intent.succeeded` event
2. Fetch the charge and balance transaction
3. Store `net_amount_received` in the order
4. Calculate and store `stripe_fee` (total_amount - net_amount_received)

This gives you:
- ✅ Accurate profit tracking
- ✅ Real-time fee calculation
- ✅ No hardcoding needed
- ✅ Secure server-side retrieval

