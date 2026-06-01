"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTutorStudents(tutorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('enrollments')
    .select('id, student_id, subject_id, status, tutor_id, profiles!student_id!inner(id, full_name, email, avatar_url), subjects!inner(id, name, level, category)')
    .eq('tutor_id', tutorId)
    .eq('status', 'approved')

  if (error) {
    console.error('Error fetching tutor students:', error)
    return { error: error.message }
  }

  return { data }
}

export async function getChatMessages(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_tutor_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return { error: error.message }
  }

  return { data }
}

export async function sendChatMessage(senderId: string, receiverId: string, message: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_tutor_messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: error.message }
  }

  return { data }
}

export async function getStudentDeadlines(tutorId: string, studentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .select('*, subjects!inner(name, level)')
    .eq('tutor_id', tutorId)
    .eq('student_id', studentId)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching student deadlines:', error)
    return { error: error.message }
  }

  return { data }
}

export async function createStudentDeadline(
  tutorId: string,
  studentId: string,
  subjectId: string,
  title: string,
  description: string,
  dueDate: string
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .insert({
      tutor_id: tutorId,
      student_id: studentId,
      subject_id: subjectId,
      title,
      description,
      due_date: dueDate,
      status: 'pending'
    })
    .select('*, subjects(name, level)')
    .single()

  if (error) {
    console.error('Error creating student deadline:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { data }
}

export async function toggleDeadlineStatus(deadlineId: string, status: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('student_deadlines')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', deadlineId)
    .select()
    .single()

  if (error) {
    console.error('Error updating deadline status:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { data }
}

export async function deleteDeadline(deadlineId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('student_deadlines')
    .delete()
    .eq('id', deadlineId)

  if (error) {
    console.error('Error deleting deadline:', error)
    return { error: error.message }
  }

  revalidatePath('/tutor/students')
  return { success: true }
}
