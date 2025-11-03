# Ionos DNS Setup for topsfireplaces.shop

## ⚠️ IMPORTANT: Get CNAME Value from Vercel First

Before making changes, go to Vercel → Settings → Domains → Add `topsfireplaces.shop`. Vercel will show you the exact CNAME value to use. It's usually `cname.vercel-dns.com`, but **always use what Vercel shows you**.

---

## 📋 Exact Changes Needed

### 🔄 RECORDS TO UPDATE/EDIT:

1. **A Record** - EDIT to point to Vercel:
   - TYPE: `A`
   - HOST NAME: `@`
   - CURRENT VALUE: `217.160.0.9`
   - **Action:** Click Edit ✏️ (pencil icon)
   - **NEW VALUE:** `216.198.79.1` ← **Use this exact IP from Vercel**
   - Click **Save**
   - This routes your root domain to Vercel

2. **AAAA Record** - DELETE this (not needed):
   - TYPE: `AAAA`
   - HOST NAME: `@`
   - CURRENT VALUE: `2001:8d8:100f:f000:0:0:0:200`
   - **Action:** Click Delete ❌
   - Note: IPv6 record not needed for Vercel

### 🗑️ RECORDS TO DELETE:

3. **TXT Record** (Dependency mutex)
   - TYPE: `TXT`
   - HOST NAME: `_dep_ws_mutex`
   - VALUE: `"9b2554af7969ae557d7e563719ddd4774227...`
   - SERVICE: `Default Site`
   - **Action:** Click Delete ❌

4. **CNAME Record** (Domain Connect)
   - TYPE: `CNAME`
   - HOST NAME: `_domainconnect`
   - VALUE: `_domainconnect.ionos.com`
   - SERVICE: `Domain Connect`
   - **Action:** Click Delete ❌

---

### ✅ RECORDS TO KEEP (Don't touch these - they're for email):

**Keep ALL of these Mail records:**

1. **MX Record** (Mail server 1)
   - TYPE: `MX`
   - HOST NAME: `@`
   - VALUE: `mx00.ionos.co.uk`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

2. **MX Record** (Mail server 2)
   - TYPE: `MX`
   - HOST NAME: `@`
   - VALUE: `mx01.ionos.co.uk`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

3. **TXT Record** (SPF for email)
   - TYPE: `TXT`
   - HOST NAME: `@`
   - VALUE: `"v=spf1 include:_spf-eu.ionos.com ~all"`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

4. **CNAME Record** (DKIM 1)
   - TYPE: `CNAME`
   - HOST NAME: `s1-ionos._domainkey`
   - VALUE: `s1.dkim.ionos.com`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

5. **CNAME Record** (DKIM 2)
   - TYPE: `CNAME`
   - HOST NAME: `s2-ionos._domainkey`
   - VALUE: `s2.dkim.ionos.com`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

6. **CNAME Record** (DKIM 3)
   - TYPE: `CNAME`
   - HOST NAME: `s42582890._domainkey`
   - VALUE: `s42582890.dkim.ionos.com`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

7. **CNAME Record** (Autodiscover)
   - TYPE: `CNAME`
   - HOST NAME: `autodiscover`
   - VALUE: `adsredir.ionos.info`
   - SERVICE: `Mail`
   - **Action:** Keep ✅

---

### ➕ RECORDS TO ADD (Click "Add record" button):

**Step 1: Edit A Record (Already done above)**
✅ You should have already edited the A record to `216.198.79.1`

**Step 2: Add WWW Subdomain CNAME**
- Click **"Add record"** button (top left)
- **TYPE:** Select `CNAME`
- **HOST NAME:** Enter `www`
- **VALUE:** Enter `557f7fe3688d3f31.vercel-dns-017.com` ← **Exact value from Vercel**
- **SERVICE:** Can leave blank or set to "Web"
- Click **Save** or **Add**
- This makes `www.topsfireplaces.shop` work too

**Note:** You might see an existing `www` CNAME record. If so, edit it to use the Vercel value instead.

---

## 📝 Summary Checklist

After making changes, your DNS records should look like:

✅ **Root Domain A Record** (`@` → `216.198.79.1`) - **EDITED** ✅
✅ **WWW CNAME** (`www` → `557f7fe3688d3f31.vercel-dns-017.com`) - **ADDED** ✅
✅ **2 MX Records** (for email) - **KEEP** ✅
✅ **1 SPF TXT Record** (for email) - **KEEP** ✅
✅ **3 DKIM CNAME Records** (for email) - **KEEP** ✅
✅ **1 Autodiscover CNAME** (for email) - **KEEP** ✅

❌ **AAAA Record** - **DELETED** ❌
❌ **TXT Record** (`_dep_ws_mutex`) - **DELETED** ❌
❌ **CNAME Record** (`_domainconnect`) - **DELETED** ❌

---

## ⏱️ After Making Changes

1. **Wait 5 minutes - 48 hours** for DNS to propagate
2. **Check Vercel Dashboard** - Domain status should change from "Pending" to "Valid" ✅
3. **Test your site** - Visit `https://topsfireplaces.shop`
4. **Email still works** - Your email with Ionos will continue working

---

## 🔍 How to Verify

**Check DNS Propagation:**
- Visit [whatsmydns.net](https://www.whatsmydns.net)
- Enter: `topsfireplaces.shop`
- Select: `CNAME`
- Should show your Vercel CNAME value globally

**Check Vercel Status:**
- Vercel Dashboard → Settings → Domains
- Status should show "Valid" with green checkmark ✅
- SSL certificate will be automatically provisioned

---

## ⚠️ Troubleshooting

**If domain doesn't work after 24 hours:**
- Double-check CNAME value matches exactly what Vercel shows
- Ensure you deleted the A and AAAA records
- Verify no typos in HOST NAME or VALUE fields

**If email stops working:**
- Make sure you kept all the Mail records listed above
- Check MX records are still present
- Contact Ionos support if issues persist

