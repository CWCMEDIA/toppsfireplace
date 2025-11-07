# YouTube Upload - Quick Start

## ✅ What's Been Implemented

1. **YouTube API Integration** (`lib/youtube.ts`)
   - Token refresh functionality
   - Video upload to YouTube
   - YouTube URL detection and embedding

2. **API Routes**
   - `/api/youtube/upload` - Handles video uploads to YouTube
   - `/api/youtube/callback` - OAuth callback handler

3. **Automatic Routing**
   - Videos uploaded in admin panel automatically go to YouTube (if configured)
   - Falls back to Supabase if YouTube credentials aren't set

4. **Product Display**
   - YouTube videos are automatically embedded on product pages
   - Works in both main view and lightbox

## 🚀 Setup Steps

### 1. Get YouTube API Credentials

Follow the detailed guide in `YOUTUBE_SETUP.md` or use this quick method:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable **YouTube Data API v3**
4. Create OAuth 2.0 credentials (Web application)
5. Get your **Client ID** and **Client Secret**

### 2. Get Refresh Token

**Easiest method - OAuth Playground:**

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click ⚙️ > "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. Find "YouTube Data API v3" in the left panel
5. Select `https://www.googleapis.com/auth/youtube.upload`
6. Click "Authorize APIs"
7. Click "Exchange authorization code for tokens"
8. **Copy the Refresh Token**

### 3. Add Environment Variables

Add to `.env.local`:

```env
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

For production (Vercel), add these in:
**Settings > Environment Variables**

### 4. Test It!

1. Go to admin panel
2. Edit or create a product
3. Upload a video
4. The video should automatically upload to YouTube
5. You'll see "Video uploaded to YouTube successfully" message
6. The YouTube URL will be stored in the database
7. The video will be embedded on the product page

## 📝 How It Works

1. **Admin uploads video** → ProductForm sends to `/api/upload`
2. **Upload route detects video** → Checks for YouTube credentials
3. **If YouTube configured** → Routes to `/api/youtube/upload`
4. **YouTube upload** → Automatically refreshes token if needed
5. **Returns YouTube URL** → Stored in database
6. **Product page** → Detects YouTube URL and embeds it

## 🔧 Troubleshooting

**"Failed to get YouTube access token"**
- Check your environment variables are set correctly
- Verify your refresh token is valid

**"YouTube upload failed"**
- Check your OAuth credentials
- Verify YouTube Data API v3 is enabled
- Check your API quota in Google Cloud Console

**Videos still going to Supabase**
- Check environment variables are loaded (restart dev server)
- Check console for error messages

## 📌 Notes

- Videos are uploaded as **unlisted** by default
- Large videos may take several minutes to upload
- YouTube has daily upload quotas (check Google Cloud Console)
- If YouTube upload fails, it automatically falls back to Supabase

