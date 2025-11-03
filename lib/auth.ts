import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createAdminUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password)
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert([{
      email,
      password_hash: hashedPassword,
      role: 'admin'
    }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function authenticateAdmin(usernameOrEmail: string, password: string) {
  // Support both username "Dave" and email "dave@topsfireplaces.com"
  // Map "Dave" to "dave@topsfireplaces.com" for database lookup
  const email = usernameOrEmail.toLowerCase() === 'dave' 
    ? 'dave@topsfireplaces.com' 
    : usernameOrEmail.toLowerCase()

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('role', 'admin')
    .single()

  if (error || !data) {
    return null
  }

  const isValid = await verifyPassword(password, data.password_hash)
  if (!isValid) {
    return null
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role
  }
}
