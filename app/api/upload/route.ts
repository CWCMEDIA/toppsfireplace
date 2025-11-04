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
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
      if (!allowedVideoTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid video file type. Allowed: MP4, WebM, MOV, AVI' }, { status: 400 })
      }
      // Video size limit: 50MB for free tier, increase if needed
      const maxVideoSize = 50 * 1024 * 1024
      if (file.size > maxVideoSize) {
        return NextResponse.json({ error: 'Video file too large. Maximum size: 50MB' }, { status: 400 })
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
