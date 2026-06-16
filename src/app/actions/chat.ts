"use server"

import { createClient } from '@/utils/supabase/server'

export async function getGlobalChatMessages(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching chat messages:', error)
    return { error: error.message }
  }

  return { data }
}

export async function sendGlobalChatMessage(senderId: string, receiverId: string, message: string, fileUrl?: string, fileType?: string) {
  const supabase = await createClient()
  const payload: any = {
    sender_id: senderId,
    receiver_id: receiverId,
    message
  }

  if (fileUrl) payload.file_url = fileUrl;
  if (fileType) payload.file_type = fileType;

  const { data, error } = await supabase
    .from('global_messages')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { error: error.message }
  }

  return { data }
}

export async function getRecentChatContacts(userId: string) {
  const supabase = await createClient()
  
  // This gets all messages where user is sender or receiver
  const { data, error } = await supabase
    .from('global_messages')
    .select('sender_id, receiver_id, message, created_at, is_read')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching chat contacts:', error)
    return { error: error.message }
  }

  // We need to group by partner to find unique recent conversations
  const partnerMap = new Map<string, any>();
  
  for (const msg of data || []) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    if (!partnerMap.has(partnerId)) {
      partnerMap.set(partnerId, {
        partnerId,
        lastMessage: msg.message,
        lastMessageTime: msg.created_at,
        unread: msg.receiver_id === userId && !msg.is_read
      });
    }
  }

  const partners = Array.from(partnerMap.values());
  
  if (partners.length === 0) return { data: [] };

  // Fetch partner profiles
  const partnerIds = partners.map(p => p.partnerId);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .in('id', partnerIds)

  if (profileError) {
    console.error('Error fetching partner profiles:', profileError)
    return { error: profileError.message }
  }

  // Merge profile data
  const merged = partners.map(p => {
    const profile = profiles.find(prof => prof.id === p.partnerId)
    return {
      ...p,
      profile
    }
  })

  return { data: merged }
}

export async function markMessagesAsRead(userId: string, partnerId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('global_messages')
    .update({ is_read: true })
    .eq('receiver_id', userId)
    .eq('sender_id', partnerId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    return { error: error.message }
  }
  return { success: true }
}

export async function searchProfilesForChat(query: string) {
  const supabase = await createClient()
  if (!query.trim()) return { data: [] }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .ilike('full_name', `%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching profiles:', error)
    return { error: error.message }
  }
  return { data }
}

export async function getStudentChatContacts(studentId: string) {
  const supabase = await createClient();
  
  // Fetch linked parents
  const { data: parentLinks, error: parentError } = await supabase
    .from('parent_student_links')
    .select('parent_id, profiles!parent_id(id, full_name, role, avatar_url)')
    .eq('student_id', studentId);

  // Fetch assigned tutors from enrollments
  const { data: tutorLinks, error: tutorError } = await supabase
    .from('enrollments')
    .select('tutor_id, profiles!tutor_id(id, full_name, role, avatar_url)')
    .eq('student_id', studentId)
    .eq('status', 'approved');

  if (parentError) console.error('Error fetching parent contacts:', parentError);
  if (tutorError) console.error('Error fetching tutor contacts:', tutorError);

  const contactsMap = new Map<string, any>();

  if (parentLinks) {
    for (const link of parentLinks) {
      if (link.profiles) {
        contactsMap.set(link.parent_id, {
           partnerId: link.parent_id,
           profile: link.profiles
        });
      }
    }
  }

  if (tutorLinks) {
    for (const link of tutorLinks) {
      if (link.profiles && link.tutor_id) {
        contactsMap.set(link.tutor_id, {
           partnerId: link.tutor_id,
           profile: link.profiles
        });
      }
    }
  }

  return { data: Array.from(contactsMap.values()) };
}

export async function getTutorChatContacts(tutorId: string) {
  const supabase = await createClient();
  
  // Fetch assigned students from enrollments
  const { data: studentLinks, error: studentError } = await supabase
    .from('enrollments')
    .select('student_id, profiles!student_id(id, full_name, role, avatar_url)')
    .eq('tutor_id', tutorId)
    .eq('status', 'approved');

  if (studentError) console.error('Error fetching student contacts:', studentError);

  const contactsMap = new Map<string, any>();

  if (studentLinks) {
    for (const link of studentLinks) {
      if (link.profiles && link.student_id) {
        contactsMap.set(link.student_id, {
           partnerId: link.student_id,
           profile: link.profiles
        });
      }
    }
  }

  return { data: Array.from(contactsMap.values()) };
}
