import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcgpfzczikkomhuhhlxw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZ3BmemN6aWtrb21odWhobHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMTQ1MTcsImV4cCI6MjA3Njc5MDUxN30.YThseXYu4aFdrFwLWwpSVgcQ4d-bo2ocqr7QJakCVhQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key for server-side operations
const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mcgpfzczikkomhuhhlxw.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jZ3BmemN6aWtrb21odWhobHh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIxNDUxNywiZXhwIjoyMDc2NzkwNTE3fQ.ckD1bW-u443qVTPm0dvFeVHXx2vaEbLO3o-H46jOQSM'

export const supabaseAdmin = createClient(supabaseAdminUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
