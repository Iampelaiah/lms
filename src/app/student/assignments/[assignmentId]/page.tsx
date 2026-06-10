import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssignmentUploader } from './AssignmentUploader'

export default async function AssignmentPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  const supabase = await createClient()

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch the assignment
  const { data: assignment } = await supabase
    .from('curriculum_assignments')
    .select('*, item:curriculum_items(*, module:curriculum_modules(*))')
    .eq('id', assignmentId)
    .single()

  if (!assignment) {
    return (
      <div className="min-h-screen p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Assignment Not Found</h1>
        <Button asChild><Link href="/student/courses">Back to Courses</Link></Button>
      </div>
    )
  }

  const subjectId = assignment.item?.module?.subject_id

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 font-sans">
      <Link 
        href={subjectId ? `/student/courses/${subjectId}` : '/student/courses'} 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Course
      </Link>

      <div className="bg-card border rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4 border-b pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
              Assignment #{assignment.assignment_number}
            </div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description || "No description provided."}</p>
        </div>

        <div className="pt-8 border-t">
          <AssignmentUploader assignmentId={assignment.id} />
        </div>
      </div>
    </div>
  )
}
