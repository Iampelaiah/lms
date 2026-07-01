import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { CourseDetailTabs } from './course-detail-tabs'

export default async function CoursePage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params
  const supabase = await createClient()
  
  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch enrollment status for THIS subject AND user
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('status, subjects(*)')
    .eq('student_id', user.id)
    .eq('subject_id', subjectId)
    .single()

  // 3. Authorization Logic: Deny access if not approved
  if (!enrollment || enrollment.status !== 'approved') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lock w-8 h-8 text-destructive"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">
              {enrollment?.status === 'pending' 
                ? "Your enrollment is currently pending admin approval. You will gain access once approved."
                : "You do not have access to this course. Please enroll first."}
            </p>
          </div>
          <Link 
            href="/student/courses"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course Catalog
          </Link>
        </div>
      </div>
    )
  }

  const subject = enrollment.subjects as any

  // 4. Fetch Approved Curriculum Modules
  const { data: modules } = await supabase
    .from('curriculum_modules')
    .select(`
      *,
      items:curriculum_items(
        *,
        assignments:curriculum_assignments(*)
      )
    `)
    .eq('subject_id', subjectId)
    .eq('approval_status', 'approved')
    .order('sequence_order', { ascending: true })

  // 5. Fetch submissions to track assignment status
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, assignment_id, status, overall_grade, created_at, updated_at')
    .eq('student_id', user.id)

  // 6. Fetch resources linked to this subject
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })

  // 7. Fetch forum posts for this subject
  const { data: forumPosts } = await supabase
    .from('forum_posts')
    .select(`
      id, title, content, tag, image_url, votes, created_at,
      profiles:user_id (full_name, avatar_url),
      comments:forum_comments(
        id, text, created_at, votes,
        profiles:user_id (full_name, avatar_url)
      )
    `)
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })

  // 8. Fetch student completions and module progress
  const { data: completions } = await supabase
    .from('student_item_completions')
    .select('*')
    .eq('student_id', user.id)

  const { data: progress } = await supabase
    .from('student_module_progress')
    .select('*')
    .eq('student_id', user.id)

  // Fetch student deadlines (direct assignments) for this student and subject
  const { data: rawStudentDeadlines } = await supabase
    .from('student_deadlines')
    .select('*')
    .eq('student_id', user.id)
    .eq('subject_id', subjectId)

  const studentDeadlines = (rawStudentDeadlines || []).map((dl: any) => {
    if (dl.description && dl.description.trim().startsWith('{') && dl.description.includes('"_richAssignment":true')) {
      try {
        const parsed = JSON.parse(dl.description);
        return {
          ...dl,
          description: parsed.originalDescription,
          image_url: parsed.imageUrl,
          past_paper_tag: parsed.pastPaperTag,
          topic_tag: parsed.topicTag,
          total_points: parsed.totalPoints,
          questions: parsed.questions
        };
      } catch (err) {
        console.error("Error parsing fallback JSON description:", err);
      }
    }
    return dl;
  });

  // 9. Render protected content
  return (
    <div className="space-y-6 font-sans pb-24">
      <Link href="/student/courses" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Catalog
      </Link>
      <div>
        <div className="flex items-center gap-3 text-primary mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold tracking-wide uppercase text-sm">
            {subject?.level} • {subject?.category}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{subject?.name}</h1>
        <p className="text-muted-foreground mt-2">Welcome to the protected course materials for {subject?.name}.</p>
      </div>

      <CourseDetailTabs 
        subject={subject}
        modules={modules || []}
        submissions={submissions || []}
        resources={resources || []}
        forumPosts={forumPosts || []}
        completions={completions || []}
        progress={progress || []}
        studentDeadlines={studentDeadlines || []}
        subjectId={subjectId}
      />
    </div>
  )
}

