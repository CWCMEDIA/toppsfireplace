# Google API Quotas - Daily vs Monthly Explained

## 📊 How It Works

### Free Tier = Monthly Limits
Google gives you **MONTHLY** free tiers:
- **Geocoding API:** 10,000 requests per **month**
- **Places Autocomplete:** 100,000 requests per **month**

### Quotas = Daily Safety Limits
In Google Cloud Console, you set **DAILY** quotas to prevent exceeding the monthly free tier.

---

## 🧮 The Math

### Geocoding API Example:
- **Monthly free tier:** 10,000 requests
- **Daily quota to set:** 333 requests/day
- **Why?** 333 × 30 days = 9,990 requests/month (stays under 10,000)

### Places API Example:
- **Monthly free tier:** 100,000 requests
- **Daily quota to set:** 3,333 requests/day
- **Why?** 3,333 × 30 days = 99,990 requests/month (stays under 100,000)

---

## ✅ What This Means

### Monthly Free Tier:
- Google resets your free tier every month
- You get 10,000 Geocoding requests per month
- You get 100,000 Places requests per month

### Daily Quota (What You Set):
- **Safety mechanism** to prevent exceeding monthly free tier
- If you use 333 Geocoding requests in one day, it stops (no charges)
- Next day, quota resets and you can use another 333
- This ensures you never exceed 10,000/month total

---

## 🎯 Why Set Daily Quotas?

**Without daily quota:**
- You could use all 10,000 requests in first week
- Then you'd be charged for any additional requests
- No protection!

**With daily quota:**
- Maximum 333 requests per day
- Spreads usage across the month
- Stays within free tier
- No charges possible!

---

## 📅 Example Timeline

### Day 1:
- Use 333 Geocoding requests ✅ (free)
- Quota reached, API stops ✅ (no charges)

### Day 2:
- Quota resets
- Use another 333 requests ✅ (free)
- Quota reached, API stops ✅ (no charges)

### ...continues for 30 days...

### Month Total:
- 333 × 30 = 9,990 requests ✅
- Still under 10,000 free tier ✅
- No charges! ✅

---

## 🔄 Monthly Reset

- **Free tier resets:** First of each month
- **Daily quota:** Resets every day at midnight
- **Your usage:** Tracks monthly total

---

## 💡 Summary

| Type | Frequency | Purpose |
|------|-----------|---------|
| **Free Tier** | Monthly | Google's free allowance |
| **Daily Quota** | Daily | Your safety limit to stay within free tier |
| **Usage Tracking** | Monthly | Google tracks your total monthly usage |

**Think of it like:**
- **Free tier** = Your monthly budget (10,000 requests)
- **Daily quota** = Your daily spending limit (333/day) to stay within budget

---

## ✅ Recommended Settings

Set daily quotas to:
- **Geocoding:** 333 requests/day (protects 10,000/month free tier)
- **Places:** 3,333 requests/day (protects 100,000/month free tier)

This ensures you **never exceed** the monthly free tier and **never get charged**!

