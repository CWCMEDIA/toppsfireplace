# How to Prevent Google API Charges - Billing Protection Setup

## ⚠️ Important Note

**You CANNOT completely disable billing** - Google requires billing to be enabled to use their APIs. However, you CAN set up **quotas and alerts** to prevent any charges.

---

## 🛡️ Step-by-Step: Prevent Charges

### 1. **Set Daily Quotas (Most Important!)**

This will **automatically disable** the APIs when you hit the free tier limit.

#### For Geocoding API:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Quotas**
3. Search for **"Geocoding API"**
4. Find **"Geocoding requests per day"**
5. Click **Edit Quotas**
6. Set to **333 requests/day** (10,000/month ÷ 30 days = ~333/day)
7. Click **Save**

#### For Places API:
1. In **Quotas**, search for **"Places API"**
2. Find **"Autocomplete (Per Session) requests per day"**
3. Click **Edit Quotas**
4. Set to **3,333 requests/day** (100,000/month ÷ 30 days = ~3,333/day)
5. Click **Save**

**Result:** APIs will automatically stop working when you hit the daily limit (no charges!)

---

### 2. **Set Up Billing Alerts**

Get notified BEFORE any charges occur:

1. Go to **Billing** > **Budgets & alerts**
2. Click **Create Budget**
3. Set budget amount to **$0.01** (1 cent)
4. Set alert threshold to **50%** ($0.005)
5. Add your email for notifications
6. Click **Create**

**Result:** You'll get an email if you're about to exceed free tier.

---

### 3. **Set Project-Wide Budget**

1. Go to **Billing** > **Budgets & alerts**
2. Click **Create Budget**
3. Budget amount: **$0.01**
4. Alert at: **50%** and **90%**
5. Add email notifications
6. **Important:** Check **"Disable billing"** option (if available)

---

### 4. **Monitor Usage Regularly**

Check your usage weekly:

1. Go to **APIs & Services** > **Dashboard**
2. Check **"Geocoding API"** usage
3. Check **"Places API"** usage
4. Ensure you're staying within free tiers

---

## 📊 Free Tier Limits (Current)

| API | Free Tier | Daily Limit (Safe) |
|-----|-----------|-------------------|
| **Geocoding API** | 10,000/month | 333/day |
| **Places Autocomplete** | 100,000/month | 3,333/day |

---

## 🚨 What Happens When Quota is Reached?

- ✅ **API calls will fail** (no charges)
- ✅ **You'll get an error** in your app
- ✅ **No money will be charged**

You'll need to either:
- Wait until next month (quota resets)
- Or manually increase quota (if you want to pay)

---

## ✅ Recommended Setup

1. ✅ Set daily quotas to safe limits
2. ✅ Set billing alerts at $0.01
3. ✅ Monitor usage weekly
4. ✅ Keep billing enabled (required by Google)

**This setup ensures you'll NEVER be charged unexpectedly!**

---

## 🔍 How to Check Current Usage

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Dashboard**
3. View usage graphs for each API
4. Check if you're approaching limits

---

## ⚠️ Important Reminders

- **Billing must be enabled** to use APIs (Google requirement)
- **Quotas prevent charges** by stopping API calls
- **Alerts notify you** before any charges
- **Monitor regularly** to stay within free tier

With these settings, you're protected from unexpected charges! 🛡️

