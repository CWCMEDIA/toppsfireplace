import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/youtube/callback
 * OAuth callback handler for YouTube authorization
 * Exchanges authorization code for access and refresh tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.json({ error: `Authorization failed: ${error}` }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
    }

    const clientId = process.env.YOUTUBE_CLIENT_ID
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET
    // Use environment variable or construct from request URL (works in both dev and production)
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${request.nextUrl.origin}/api/youtube/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.json({ 
        error: 'YouTube credentials not configured. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET.' 
      }, { status: 500 })
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      return NextResponse.json({ error: `Token exchange failed: ${error}` }, { status: 500 })
    }

    const tokens = await tokenResponse.json()

    // In production, you should store these tokens securely (e.g., in database)
    // For now, we'll return them (you'll need to save the refresh_token)
    return NextResponse.json({
      success: true,
      message: 'Authorization successful!',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      note: 'Save the refresh_token to YOUTUBE_REFRESH_TOKEN in your environment variables',
    })
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

