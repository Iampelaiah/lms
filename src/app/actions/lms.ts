"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Subjects ---

export async function getSubjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('category')
    .order('level')
    .order('name')

  if (error) {
    console.error('Error fetching subjects:', error)
    return { error: error.message }
  }

  return { data }
}

// --- Enrollments ---

export async function getMyEnrollments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, subjects(*)')
    .eq('student_id', user.id)

  if (error) {
    console.error('Error fetching enrollments:', error)
    return { error: error.message }
  }

  return { data }
}

export async function enrollInSubject(subjectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('enrollments')
    .insert({
      student_id: user.id,
      subject_id: subjectId,
      status: 'pending'
    })

  if (error) {
    console.error('Error enrolling:', error)
    return { error: error.message }
  }

  revalidatePath('/student')
  return { success: true }
}

// --- Admin ---

export async function getPendingEnrollments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { data, error } = await supabase
    .from('enrollments')
    .select('*, subjects(*), profiles(*)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending enrollments:', error)
    return { error: error.message }
  }

  return { data }
}

export async function updateEnrollmentStatus(enrollmentId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Ensure user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const { error } = await supabase
    .from('enrollments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', enrollmentId)

  if (error) {
    console.error('Error updating enrollment:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
