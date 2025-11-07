import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication - only admins can upload files
    const authResult = await verifyAdmin(request)
    if (!authResult.isValid) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'products'
    const fileType = formData.get('fileType') as string || 'image' // 'image' or 'video'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type based on fileType parameter
    if (fileType === 'video') {
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
      if (!allowedVideoTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid video file type. Allowed: MP4, WebM, MOV, AVI, MPEG' }, { status: 400 })
      }
      
      const maxVideoSize = 50 * 1024 * 1024 // 50MB
      const isUnder50MB = file.size <= maxVideoSize
      
      // Check if YouTube upload is enabled (has credentials)
      const hasYouTubeCredentials = 
        process.env.YOUTUBE_CLIENT_ID && 
        process.env.YOUTUBE_CLIENT_SECRET && 
        process.env.YOUTUBE_REFRESH_TOKEN

      // For videos under 50MB: Upload ONLY to Supabase (skip YouTube)
      if (isUnder50MB) {
        // Upload to Supabase Storage only
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const fileName = `${timestamp}-${randomString}.${fileExtension}`
        const bucketName = folder === 'gallery' ? 'gallery-videos' : 'product-videos'

        const { data: supabaseData, error: supabaseError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(`${folder}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (supabaseError) {
          return NextResponse.json({ error: supabaseError.message }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(supabaseData.path)

        return NextResponse.json({
          url: urlData.publicUrl,
          path: supabaseData.path,
          fileName: fileName,
          isYouTube: false,
        })
      } else {
        // Videos over 50MB: Go directly to YouTube (Supabase has 50MB limit)
        if (!hasYouTubeCredentials) {
          return NextResponse.json({ 
            error: 'Video file too large for Supabase (50MB limit). YouTube upload is required but not configured.' 
          }, { status: 400 })
        }

        const productName = formData.get('productName') as string || 'Product Video'
        const productDescription = formData.get('productDescription') as string || ''
        
        const youtubeFormData = new FormData()
        youtubeFormData.append('file', file)
        youtubeFormData.append('title', productName)
        youtubeFormData.append('description', productDescription)
        youtubeFormData.append('privacyStatus', 'unlisted')

        try {
          const youtubeResponse = await fetch(`${request.nextUrl.origin}/api/youtube/upload`, {
            method: 'POST',
            headers: {
              'Cookie': request.headers.get('Cookie') || '',
            },
            body: youtubeFormData,
          })

          if (youtubeResponse.ok) {
            const youtubeData = await youtubeResponse.json()
            return NextResponse.json({
              url: youtubeData.url,
              videoId: youtubeData.videoId,
              embedUrl: youtubeData.embedUrl,
              isYouTube: true,
            })
          } else {
            const error = await youtubeResponse.json()
            return NextResponse.json({ 
              error: `YouTube upload failed: ${error.error || 'Unknown error'}` 
            }, { status: 500 })
          }
        } catch (youtubeError: any) {
          return NextResponse.json({ 
            error: `YouTube upload error: ${youtubeError.message}` 
          }, { status: 500 })
        }
      }
    } else {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!allowedImageTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }
      // Image size limit: 5MB
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File too large' }, { status: 400 })
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`

    // Determine bucket based on folder and file type
    let bucketName: string
    if (fileType === 'video') {
      bucketName = folder === 'gallery' ? 'gallery-videos' : 'product-videos'
    } else {
      bucketName = folder === 'gallery' ? 'gallery-images' : 'product-images'
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(`${folder}/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
      fileName: fileName
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
