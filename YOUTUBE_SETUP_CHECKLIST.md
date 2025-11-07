# YouTube Auto-Upload Setup Checklist ✅

Follow these steps in order to enable automatic YouTube uploads:

## Step 1: Google Cloud Console Setup (5-10 minutes)

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project (or select existing)
  - Click "Select a project" → "New Project"
  - Name it: "Tops Fireplaces" (or your choice)
  - Click "Create"
- [ ] Enable YouTube Data API v3
  - Go to "APIs & Services" → "Library"
  - Search for "YouTube Data API v3"
  - Click on it → Click "Enable"
  - Wait for it to enable (usually instant)

## Step 2: Create OAuth Credentials (5 minutes)

- [ ] Go to "APIs & Services" → "Credentials"
- [ ] Click "Create Credentials" → "OAuth client ID"
- [ ] If prompted to configure OAuth consent screen:
  - User Type: **External** (unless you have Google Workspace)
  - App name: **Tops Fireplaces**
  - User support email: **Your email**
  - Developer contact: **Your email**
  - Click "Save and Continue"
  - Scopes: Click "Add or Remove Scopes"
    - Search for: `youtube.upload`
    - Check: `https://www.googleapis.com/auth/youtube.upload`
    - Click "Update" → "Save and Continue"
  - Test users: Add your email (if in testing mode)
  - Click "Save and Continue" → "Back to Dashboard"
- [ ] Create OAuth Client:
  - Application type: **Web application**
  - Name: **Tops Fireplaces Upload**
  - Authorized redirect URIs:
    - For development: `http://localhost:3000/api/youtube/callback`
    - For production: `https://yourdomain.com/api/youtube/callback`
  - Click "Create"
- [ ] **IMPORTANT:** Copy and save:
  - ✅ **Client ID** (looks like: `123456789-abc.apps.googleusercontent.com`)
  - ✅ **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

## Step 3: Get Refresh Token (5 minutes) - EASIEST METHOD

- [ ] Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [ ] Click the gear icon (⚙️) in top right
- [ ] Check "Use your own OAuth credentials"
- [ ] Enter your **Client ID** and **Client Secret** from Step 2
- [ ] In the left panel, scroll to find "YouTube Data API v3"
- [ ] Expand it and check: `https://www.googleapis.com/auth/youtube.upload`
- [ ] Click "Authorize APIs" button
- [ ] Sign in with the Google account that owns the YouTube channel
- [ ] Click "Allow" to grant permissions
- [ ] Click "Exchange authorization code for tokens"
- [ ] **IMPORTANT:** Copy the **Refresh Token** (long string, starts with `1//`)
- [ ] Save it somewhere safe!

## Step 4: Add Environment Variables (2 minutes)

- [ ] Open your `.env.local` file in the project root
- [ ] Add these lines (replace with your actual values):

```env
YOUTUBE_CLIENT_ID=your_client_id_from_step_2
YOUTUBE_CLIENT_SECRET=your_client_secret_from_step_2
YOUTUBE_REFRESH_TOKEN=your_refresh_token_from_step_3
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

- [ ] Save the file
- [ ] **Restart your development server** (important!)
  - Stop the server (Ctrl+C)
  - Run `npm run dev` again

## Step 5: Test It! (2 minutes)

- [ ] Go to your admin panel: `http://localhost:3000/admin`
- [ ] Edit an existing product or create a new one
- [ ] Upload a test video (under 50MB for now)
- [ ] Watch the console/network tab for upload progress
- [ ] You should see: "Video uploaded to YouTube successfully"
- [ ] Check your YouTube channel - the video should appear as "Unlisted"
- [ ] Go to the product page - the video should be embedded

## Step 6: Production Setup (When ready to deploy)

- [ ] Go to your Vercel dashboard (or hosting platform)
- [ ] Go to your project → Settings → Environment Variables
- [ ] Add all 4 environment variables:
  - `YOUTUBE_CLIENT_ID`
  - `YOUTUBE_CLIENT_SECRET`
  - `YOUTUBE_REFRESH_TOKEN`
  - `YOUTUBE_REDIRECT_URI` (use your production domain)
- [ ] Redeploy your application

## ✅ You're Done!

Once all steps are complete:
- Videos under 50MB → Upload to Supabase first, then YouTube
- Videos over 50MB → Upload directly to YouTube
- All videos will be embedded on product pages automatically

## 🆘 Need Help?

**Common Issues:**

1. **"Failed to get YouTube access token"**
   - Check all environment variables are set correctly
   - Make sure you restarted the dev server after adding env vars
   - Verify the refresh token is correct (copy it again from OAuth Playground)

2. **"YouTube upload failed"**
   - Check YouTube Data API v3 is enabled in Google Cloud
   - Verify your OAuth credentials are correct
   - Check your API quota in Google Cloud Console

3. **"Videos still going to Supabase only"**
   - Check environment variables are loaded (restart server)
   - Check browser console for error messages
   - Verify all 3 credentials are set (Client ID, Secret, Refresh Token)

4. **"Quota exceeded"**
   - YouTube has daily upload limits
   - Check your quota in Google Cloud Console → APIs & Services → Dashboard
   - You may need to request a quota increase

---

**Quick Reference:**
- Google Cloud Console: https://console.cloud.google.com/
- OAuth Playground: https://developers.google.com/oauthplayground/
- YouTube Data API Docs: https://developers.google.com/youtube/v3

