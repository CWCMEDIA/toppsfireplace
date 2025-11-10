# Google APIs Used - Pricing & Explanation

## 1. **Radius Calculation API**

### API Used: **Google Geocoding API** (Server-Side)

**What it does:**
- Converts addresses to coordinates (latitude/longitude)
- Used in: `lib/geocoding.ts`

**How it works:**
1. Customer enters address → Geocoding API converts to coordinates
2. We calculate distance using **Haversine formula** (FREE - just math, no API call)
3. Compare distance to 20-mile radius

**Pricing:**
- ✅ **FREE:** 10,000 requests per month
- 💰 **After free tier:** $5.00 per 1,000 requests
- **Cost per delivery check:** 2 requests (one for business address, one for customer address)
- **Free tier covers:** ~5,000 delivery checks per month

**Environment Variable:**
```bash
GOOGLE_GEOCODING_API_KEY=your_key_here
```

---

## 2. **Address Autocomplete API**

### API Used: **Google Places API - Autocomplete** (Client-Side)

**What it does:**
- Provides address suggestions as user types
- Used in: `app/checkout/page.tsx`

**Pricing:**
- ✅ **FREE:** First 100,000 requests per month (Session-based Autocomplete)
- 💰 **After free tier:** $2.83 per 1,000 requests
- **Note:** There are different Places API SKUs:
  - **Autocomplete (Per Session):** $2.83 per 1,000 sessions (FREE up to 100k/month)
  - **Autocomplete (Per Request):** Different pricing model

**Environment Variable:**
```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
```

---

## Summary

### Free Tier Coverage:
- **Geocoding API:** 10,000 requests/month = ~5,000 delivery checks/month
- **Places Autocomplete:** 100,000 requests/month = plenty for most small businesses

### Cost After Free Tier:
- **Geocoding:** $5.00 per 1,000 requests
- **Places Autocomplete:** $2.83 per 1,000 sessions

### What You're Seeing:
The "100m" and "200m" you mentioned might be:
- **100,000 requests/month** (Places Autocomplete free tier)
- Or different API SKUs in the Google Cloud Console

### Recommendation:
For a small business, you'll likely stay within the free tiers. Monitor usage in Google Cloud Console to track consumption.

---

## Current Implementation

✅ **Radius Calculation:** Uses Geocoding API (server-side) + Haversine formula (free math)
✅ **Address Autocomplete:** Uses Places API Autocomplete (client-side)

Both are configured and working. Just need to ensure both API keys are set in your environment variables.

