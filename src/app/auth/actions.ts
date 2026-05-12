'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const role = formData.get('role') as string
  const authData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data, error } = await supabase.auth.signInWithPassword(authData)

  if (error) {
    return { error: error.message }
  }

  // Fetch role to verify it matches the login attempt
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profile && profile.role !== role) {
    // Sign out immediately if role mismatch
    await supabase.auth.signOut()
    return { error: `This account is registered as a ${profile.role}. Please log in through the correct portal.` }
  }

  revalidatePath('/', 'layout')
  
  // Explicitly redirect based on registered role
  if (profile?.role === 'tutor') {
    return redirect('/tutor')
  }
  if (profile?.role === 'admin') {
    return redirect('/admin')
  }
  if (profile?.role === 'parent') {
    return redirect('/parent')
  }
  
  // Default for students or if no specific role-path exists
  redirect('/student')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = (formData.get('role') as string) || 'student'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account.'))
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
