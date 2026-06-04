import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, BookOpen } from 'lucide-react'
import { CurriculumTree } from './curriculum-tree'

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
            <Lock className="w-8 h-8 text-destructive" />
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

  // Fetch Curriculum Modules and Items
  const { data: modulesData } = await supabase
    .from('curriculum_modules')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('approval_status', 'approved')
    .order('sequence_order', { ascending: true })

  let modules = []
  if (modulesData && modulesData.length > 0) {
    const { data: itemsData } = await supabase
      .from('curriculum_items')
      .select('*, assignments:curriculum_assignments(*)')
      .in('module_id', modulesData.map(m => m.id))
      .order('start_date', { ascending: true })
    
    modules = modulesData.map(m => ({
      ...m,
      items: (itemsData || []).filter(i => i.module_id === m.id)
    }))
  }

  // Fetch Progress and Completions
  const { data: progressData } = await supabase
    .from('student_module_progress')
    .select('*')
    .eq('student_id', user.id)

  const { data: itemCompletionsData } = await supabase
    .from('student_item_completions')
    .select('*')
    .eq('student_id', user.id)

  // 4. Render protected content
  return (
    <div className="space-y-6 font-sans">
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

      <div className="grid gap-6 mt-8">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        <CurriculumTree 
          modules={modules} 
          progress={progressData || []} 
          itemCompletions={itemCompletionsData || []} 
        />
      </div>
    </div>
  )
}
