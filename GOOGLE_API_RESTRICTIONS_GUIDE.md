# 🔒 Google API Key Restrictions - Production Setup Guide

## ✅ Good News: You CAN Restrict AND Keep Localhost Working!

You need **TWO separate API keys** with different restrictions. Here's how to set them up properly:

---

## 🔑 Key 1: Geocoding API (Server-Side Only)

**Environment Variable:** `GOOGLE_GEOCODING_API_KEY`

### Restrictions Setup:

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Find your Geocoding API key** (or create a new one)
3. **Click "Edit"** on the key
4. **Under "API restrictions":**
   - Select **"Restrict key"**
   - Check ONLY: **"Geocoding API"**
   - ✅ **DO NOT** check "Maps JavaScript API" or "Places API"
5. **Under "Application restrictions":**
   - Select **"IP addresses"** (recommended for server-side)
   - OR select **"None"** if your server IP changes (less secure but more flexible)
   - If using IP restrictions, add your hosting platform's IP ranges:
     - **Vercel IPs:** Check Vercel docs for current IP ranges
     - **Your server IP:** If you know it
6. **Click "Save"**

### Why This Works:
- ✅ Server-side only = No browser restrictions needed
- ✅ IP restrictions = Only your server can use it
- ✅ Works in both dev and production (as long as IPs are allowed)

---

## 🔑 Key 2: Places API (Client-Side)

**Environment Variable:** `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

### Restrictions Setup:

1. **Go to Google Cloud Console** → **APIs & Services** → **Credentials**
2. **Find your Places API key** (or create a new one)
3. **Click "Edit"** on the key
4. **Under "API restrictions":**
   - Select **"Restrict key"**
   - Check: **"Maps JavaScript API"** ✅
   - Check: **"Places API"** ✅
   - ✅ **BOTH are required!** (Places Autocomplete needs both)
5. **Under "Application restrictions":**
   - Select **"HTTP referrers (websites)"**
   - Add these referrers (one per line):
     ```
     http://localhost:3000/*
     https://topsfireplaces.shop/*
     https://www.topsfireplaces.shop/*
     https://*.vercel.app/*
     ```
   - **Important:** Include `localhost` for development AND your production domain
6. **Click "Save"**

### Why This Works:
- ✅ HTTP referrers = Browser checks the page URL
- ✅ Multiple domains = Works in both dev and production
- ✅ Wildcards = Covers all subdomains and paths

---

## 📋 Step-by-Step: Setting Up Restrictions

### For Geocoding API Key (Server-Side):

```
1. Google Cloud Console → APIs & Services → Credentials
2. Click on your Geocoding API key
3. Under "API restrictions":
   ✅ Restrict key
   ✅ Check: Geocoding API only
4. Under "Application restrictions":
   ✅ IP addresses (recommended)
   OR
   ✅ None (if IP changes frequently)
5. Save
```

### For Places API Key (Client-Side):

```
1. Google Cloud Console → APIs & Services → Credentials
2. Click on your Places API key
3. Under "API restrictions":
   ✅ Restrict key
   ✅ Check: Maps JavaScript API
   ✅ Check: Places API
4. Under "Application restrictions":
   ✅ HTTP referrers (websites)
   ✅ Add:
      - http://localhost:3000/*
      - https://topsfireplaces.shop/*
      - https://www.topsfireplaces.shop/*
      - https://*.vercel.app/* (if using Vercel)
5. Save
```

---

## ⚠️ Common Mistakes to Avoid

### ❌ Mistake 1: Restricting Places Key to IP Addresses
- **Problem:** Client-side keys can't use IP restrictions (browsers don't send IP)
- **Solution:** Use HTTP referrers for client-side keys

### ❌ Mistake 2: Not Including Both APIs for Places Key
- **Problem:** Places Autocomplete needs BOTH "Maps JavaScript API" AND "Places API"
- **Solution:** Check both in API restrictions

### ❌ Mistake 3: Forgetting Localhost
- **Problem:** Can't test locally after deployment
- **Solution:** Always include `http://localhost:3000/*` in referrers

### ❌ Mistake 4: Wrong Referrer Format
- **Problem:** `http://localhost:3000` (missing `/*`)
- **Solution:** Use `http://localhost:3000/*` (with wildcard)

---

## 🧪 Testing Restrictions

### Test Geocoding API (Server-Side):
```bash
# This should work from your server
curl "https://maps.googleapis.com/maps/api/geocode/json?address=London&key=YOUR_GEOCODING_KEY"
```

### Test Places API (Client-Side):
1. Open `http://localhost:3000/checkout`
2. Start typing an address
3. Should see autocomplete suggestions
4. If you see errors, check browser console

---

## 🚀 Production Deployment Checklist

Before deploying:

- [ ] Geocoding API key restricted to "Geocoding API" only
- [ ] Geocoding API key restricted to IP addresses (or None)
- [ ] Places API key restricted to "Maps JavaScript API" + "Places API"
- [ ] Places API key restricted to HTTP referrers
- [ ] HTTP referrers include:
  - [ ] `http://localhost:3000/*` (for development)
  - [ ] `https://topsfireplaces.shop/*` (production)
  - [ ] `https://www.topsfireplaces.shop/*` (production with www)
  - [ ] `https://*.vercel.app/*` (if using Vercel previews)
- [ ] Both keys tested locally
- [ ] Both keys tested in production

---

## 🔍 How to Verify Restrictions Are Working

### Check Geocoding API:
1. Try using the key from a different IP → Should fail
2. Try using the key for a different API → Should fail
3. Use from your server → Should work ✅

### Check Places API:
1. Try using the key from a different domain → Should fail
2. Try using the key for a different API → Should fail
3. Use from localhost → Should work ✅
4. Use from production domain → Should work ✅

---

## 💡 Pro Tips

1. **Use Separate Keys:** Don't reuse the same key for different purposes
2. **Test After Restrictions:** Always test after applying restrictions
3. **Keep Localhost:** Always include localhost for development
4. **Monitor Usage:** Check Google Cloud Console regularly for usage
5. **Set Quotas:** Set daily quotas to prevent unexpected charges

---

## 🆘 Troubleshooting

### Error: "RefererNotAllowedMapError"
- **Cause:** Your domain isn't in the HTTP referrer restrictions
- **Fix:** Add your domain to the referrer list

### Error: "ApiTargetBlockedMapError"
- **Cause:** API not enabled or not in API restrictions
- **Fix:** Check that "Maps JavaScript API" AND "Places API" are both checked

### Error: "REQUEST_DENIED"
- **Cause:** API key restrictions too strict or billing not enabled
- **Fix:** Check restrictions and ensure billing is enabled (with quotas set)

---

## ✅ Summary

**You CAN restrict your keys AND keep localhost working!**

- **Geocoding Key:** Restrict to IP addresses (server-side)
- **Places Key:** Restrict to HTTP referrers (include localhost + production)
- **Both Keys:** Restrict to specific APIs only
- **Result:** Secure in production, works in development! 🎉

