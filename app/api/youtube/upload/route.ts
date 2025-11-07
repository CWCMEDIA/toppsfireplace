import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin } from '@/lib/admin-auth'
import { uploadVideoToYouTube, getYouTubeAccessToken } from '@/lib/youtube'

/**
 * POST /api/youtube/upload
 * Uploads a video file to YouTube
 * Requires: YouTube OAuth access token in environment or request
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || 'Product Video'
    const description = formData.get('description') as string || ''
    const privacyStatus = (formData.get('privacyStatus') as string) || 'unlisted'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate video file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
    if (!allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid video file type. Allowed: MP4, WebM, MOV, AVI, MPEG' 
      }, { status: 400 })
    }

    // Get YouTube access token (automatically refreshes if needed)
    let accessToken: string
    try {
      accessToken = await getYouTubeAccessToken()
    } catch (error: any) {
      return NextResponse.json({ 
        error: `Failed to get YouTube access token: ${error.message}. Please check your YouTube credentials.` 
      }, { status: 401 })
    }

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to YouTube
    const result = await uploadVideoToYouTube(
      buffer,
      {
        title,
        description,
        privacyStatus: privacyStatus as 'public' | 'unlisted' | 'private',
      },
      accessToken
    )

    return NextResponse.json({
      success: true,
      videoId: result.videoId,
      url: result.url,
      embedUrl: `https://www.youtube.com/embed/${result.videoId}`,
    })
  } catch (error: any) {
    console.error('YouTube upload error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to upload video to YouTube' 
    }, { status: 500 })
  }
}

