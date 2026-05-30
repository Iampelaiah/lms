import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, BookOpen, PlayCircle, FileText } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  const subject = enrollment.subjects

  // Optional: Fetch lessons if using a lessons table
  let lessons: any[] = []
  try {
    const res = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', subjectId)
      .order('order_index', { ascending: true })
    if (res.data) lessons = res.data
  } catch (e) {
    // fallback if lessons table doesn't map yet
  }

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

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        {lessons && lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson: any, index: number) => (
              <Card key={lesson.id} className="hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {lesson.video_url ? (
                          <>
                            <PlayCircle className="h-3 w-3" />
                            <span>Video Lesson</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3" />
                            <span>Reading Material</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/student/courses/${subject.id}/${lesson.id}`}>
                      Start Lesson
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-muted/50">
            <p className="text-muted-foreground">Course modules are currently being prepared by the instructor.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
