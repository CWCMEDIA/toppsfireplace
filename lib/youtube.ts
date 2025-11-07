/**
 * YouTube API utilities for video uploads
 * Requires Google OAuth 2.0 credentials
 */

interface YouTubeUploadOptions {
  title: string
  description?: string
  tags?: string[]
  privacyStatus?: 'public' | 'unlisted' | 'private'
  categoryId?: string
}

/**
 * Refresh YouTube access token using refresh token
 */
export async function refreshYouTubeToken(): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YouTube credentials not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * Get valid YouTube access token (refreshes if needed)
 */
export async function getYouTubeAccessToken(): Promise<string> {
  // For now, always refresh (in production, you'd cache the token)
  // TODO: Implement token caching with expiration check
  return await refreshYouTubeToken()
}

/**
 * Upload video to YouTube using resumable upload
 * @param videoFile - The video file to upload (Buffer)
 * @param options - YouTube upload options
 * @param accessToken - OAuth 2.0 access token
 * @returns YouTube video ID and URL
 */
export async function uploadVideoToYouTube(
  videoFile: Buffer,
  options: YouTubeUploadOptions,
  accessToken: string
): Promise<{ videoId: string; url: string }> {
  // Step 1: Initialize resumable upload session
  const initResponse = await fetch(
    `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/*',
        'X-Upload-Content-Length': videoFile.length.toString(),
      },
      body: JSON.stringify({
        snippet: {
          title: options.title,
          description: options.description || '',
          tags: options.tags || [],
          categoryId: options.categoryId || '22', // People & Blogs
        },
        status: {
          privacyStatus: options.privacyStatus || 'unlisted',
        },
      }),
    }
  )

  if (!initResponse.ok) {
    const error = await initResponse.text()
    throw new Error(`YouTube upload initialization failed: ${error}`)
  }

  // Step 2: Get the resumable upload URL from Location header
  const uploadUrl = initResponse.headers.get('Location')
  if (!uploadUrl) {
    throw new Error('No upload URL received from YouTube')
  }

  // Step 3: Upload the actual video file
  // Convert Buffer to Uint8Array for fetch compatibility
  const uint8Array = new Uint8Array(videoFile)
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/*',
      'Content-Length': videoFile.length.toString(),
    },
    body: uint8Array,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`Video upload failed: ${error}`)
  }

  const videoData = await uploadResponse.json()
  const videoId = videoData.id

  if (!videoId) {
    throw new Error('No video ID returned from YouTube')
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
  }
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/.test(url)
}

/**
 * Get YouTube embed URL from video ID or URL
 */
export function getYouTubeEmbedUrl(videoIdOrUrl: string): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl
  return `https://www.youtube.com/embed/${videoId}`
}

