# Exact Ionos DNS Steps for topsfireplaces.shop

## ✅ Your Vercel DNS Configuration:
- **A Record**: `@` → `216.198.79.1`
- **CNAME**: `www` → `557f7fe3688d3f31.vercel-dns-017.com`

---

## 📋 Step-by-Step Actions in Ionos:

### 1️⃣ EDIT the A Record (Root Domain)

- Find the **A record** with:
  - HOST NAME: `@`
  - VALUE: `217.160.0.9`
- Click the **Edit icon** (pencil ✏️)
- Change VALUE from `217.160.0.9` to: `216.198.79.1`
- Click **Save**

---

### 2️⃣ DELETE the AAAA Record

- Find the **AAAA record** with:
  - HOST NAME: `@`
  - VALUE: `2001:8d8:100f:f000:0:0:0:200`
- Click the **Delete icon** (trash can 🗑️)
- Confirm deletion

---

### 3️⃣ DELETE the TXT Record (_dep_ws_mutex)

- Find the **TXT record** with:
  - HOST NAME: `_dep_ws_mutex`
  - VALUE: `"9b2554af7969ae557d7e563719ddd4774227...`
- Click the **Delete icon** (trash can 🗑️)
- Confirm deletion

---

### 4️⃣ DELETE the CNAME Record (_domainconnect)

- Find the **CNAME record** with:
  - HOST NAME: `_domainconnect`
  - VALUE: `_domainconnect.ionos.com`
- Click the **Delete icon** (trash can 🗑️)
- Confirm deletion

---

### 5️⃣ ADD CNAME for WWW Subdomain

- Click **"Add record"** button (top left)
- **TYPE**: Select `CNAME`
- **HOST NAME**: Enter `www`
- **VALUE**: Enter `557f7fe3688d3f31.vercel-dns-017.com`
- **SERVICE**: Leave blank or set to "Web"
- Click **Save** or **Add**

**Note:** If there's already a `www` CNAME record, edit it instead of adding a new one.

---

### ✅ KEEP ALL THESE (Email Records):

**DO NOT DELETE OR MODIFY:**
- ✅ 2 MX Records (`mx00.ionos.co.uk` and `mx01.ionos.co.uk`)
- ✅ 1 TXT Record (SPF: `v=spf1 include:_spf-eu.ionos.com ~all`)
- ✅ 3 DKIM CNAME Records (`s1-ionos._domainkey`, `s2-ionos._domainkey`, `s42582890._domainkey`)
- ✅ 1 Autodiscover CNAME (`autodiscover`)

---

## 🎯 Final Result:

After changes, you should have:

1. ✅ **A Record** - `@` → `216.198.79.1` (pointing to Vercel)
2. ✅ **CNAME** - `www` → `557f7fe3688d3f31.vercel-dns-017.com` (pointing to Vercel)
3. ✅ All 7 email records (MX, SPF, DKIM, Autodiscover)

**Total records:** ~9-10 records

---

## ⏱️ After Saving:

1. **Wait 5 minutes - 2 hours** for DNS propagation
2. **Check Vercel Dashboard:**
   - Go to Settings → Domains
   - Status should change from "Pending" to "Valid" ✅
   - SSL certificate will auto-provision
3. **Test your site:**
   - Visit: `https://topsfireplaces.shop`
   - Visit: `https://www.topsfireplaces.shop`
   - Both should work!

---

## ✅ Verification:

**Check DNS Propagation:**
- Visit [whatsmydns.net](https://www.whatsmydns.net)
- Check `topsfireplaces.shop` → A record should show `216.198.79.1`
- Check `www.topsfireplaces.shop` → CNAME should show `557f7fe3688d3f31.vercel-dns-017.com`

---

## 🚨 If Something Goes Wrong:

- **Email stops working?** → Make sure you didn't delete the MX/TXT/DKIM records
- **Domain not working?** → Double-check A record value is exactly `216.198.79.1`
- **WWW not working?** → Verify CNAME value matches exactly (no extra spaces)

---

## 💡 About Nameservers (NOT NEEDED):

Vercel also provided nameservers (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). 

**You DON'T need to change nameservers** because:
- ✅ Using DNS records at Ionos keeps email working perfectly
- ✅ Ionos continues managing your DNS
- ✅ You have full control over all records

Only change nameservers if you want Vercel to manage ALL DNS (which would break email unless you reconfigure it at Vercel).

