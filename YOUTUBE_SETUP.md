# YouTube Upload Setup Guide

This guide will help you set up automatic YouTube video uploads for your product videos.

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (unless you have Google Workspace)
   - App name: Tops Fireplaces
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `https://www.googleapis.com/auth/youtube.upload`
   - Save and continue through the steps
4. Create OAuth client:
   - Application type: **Web application**
   - Name: Tops Fireplaces Upload
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/youtube/callback` (for development)
     - `https://yourdomain.com/api/youtube/callback` (for production)
   - Click "Create"
5. **Save your credentials:**
   - Client ID
   - Client Secret

## Step 3: Get Access Token (One-time setup)

You need to authorize the app to upload videos to your YouTube channel.

### Option A: Manual OAuth Flow (Recommended for setup)

1. Visit this URL (replace with your Client ID):
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/api/youtube/callback&response_type=code&scope=https://www.googleapis.com/auth/youtube.upload&access_type=offline&prompt=consent
```

2. Authorize the application
3. You'll be redirected to `/api/youtube/callback` with a code
4. Exchange the code for access and refresh tokens

### Option B: Use OAuth Playground (Easier)

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) > "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In the left panel, find "YouTube Data API v3"
5. Select `https://www.googleapis.com/auth/youtube.upload`
6. Click "Authorize APIs"
7. Click "Exchange authorization code for tokens"
8. Copy the **Refresh Token** (this is what you'll store)

## Step 4: Environment Variables

Add these to your `.env.local` file:

```env
# YouTube API Credentials
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
```

For production (Vercel), add these in your Vercel dashboard under Settings > Environment Variables.

## Step 5: Token Refresh

The access token expires after 1 hour. We need to automatically refresh it using the refresh token.

## Next Steps

After setting up the credentials, the system will:
1. Automatically refresh the access token when needed
2. Upload videos to YouTube when you upload them in the admin panel
3. Store the YouTube URL in the database
4. Embed YouTube videos on product pages

## Testing

Once set up, try uploading a video in the admin panel. It should:
1. Upload to YouTube (may take a few minutes for large files)
2. Return a YouTube URL
3. Display the embedded video on the product page

## Troubleshooting

- **"Invalid credentials"**: Check your Client ID and Secret
- **"Token expired"**: The refresh token should automatically get a new access token
- **"Upload failed"**: Check file size and format (YouTube accepts most video formats)
- **"Quota exceeded"**: YouTube has daily upload limits (check your quota in Google Cloud Console)

