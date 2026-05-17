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

  // Fetch profile to verify role and approval status
  let { data: profile } = await supabase
    .from('profiles')
    .select('role, is_approved')
    .eq('id', data.user.id)
    .single()

  // FALLBACK: If profile record is missing, use metadata from Auth
  let userRole = profile?.role?.toLowerCase() || data.user.user_metadata?.role?.toLowerCase() || 'student'

  // Normalize 'school admin' to 'admin' for matching the login portal role
  const normalizedUserRole = userRole === 'school admin' ? 'admin' : userRole;

  if (normalizedUserRole !== role.toLowerCase()) {
    // Sign out immediately if role mismatch
    await supabase.auth.signOut()
    return { error: `This account is registered as a ${userRole}. Please log in through the correct portal.` }
  }

  // Check if account is approved
  if (profile && !profile.is_approved) {
    await supabase.auth.signOut()
    return { error: 'Your account is pending admin approval. Please try again once activated.' }
  }

  // Ensure profile exists if it was missing (healing)
  if (!profile) {
    // Note: The database trigger handle_new_user should have created this already,
    // but we keep this as a safe fallback.
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name || '',
      role: userRole.charAt(0).toUpperCase() + userRole.slice(1),
      updated_at: new Date().toISOString(),
    })
  }

  revalidatePath('/', 'layout')
  
  // Explicitly redirect based on determined role
  if (normalizedUserRole === 'tutor') {
    return redirect('/tutor')
  }
  if (normalizedUserRole === 'admin') {
    return redirect('/admin')
  }
  if (normalizedUserRole === 'parent') {
    return redirect('/parent')
  }
  
  // Default for students
  redirect('/student')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = (formData.get('role') as string) || 'student'

  const { data, error } = await supabase.auth.signUp({
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

  // If user is created successfully, the database trigger handle_new_user will
  // automatically create the profile record and enforce role immutability.

  revalidatePath('/', 'layout')
  
  // Even if a session exists, we should redirect to a pending page if they aren't approved
  // For now, redirecting to login with a message is safest.
  if (data.session) {
    await supabase.auth.signOut()
  }

  redirect('/login?message=' + encodeURIComponent('Signup successful! Your account is pending admin approval.'))
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
