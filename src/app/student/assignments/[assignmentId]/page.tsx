import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  let { data: assignment } = await supabase
    .from('curriculum_assignments')
    .select('*, item:curriculum_items(*, module:curriculum_modules(*))')
    .eq('id', assignmentId)
    .single()

  let questions: any[] = []
  let isDirectAssignment = false

  if (assignment) {
    // Fetch questions from assignment_questions
    const { data: qData } = await supabase
      .from('assignment_questions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('sequence_order', { ascending: true })
    questions = qData || []
  } else {
    // Fallback: Check if it is a direct student deadline
    const { data: dlData } = await supabase
      .from('student_deadlines')
      .select('*, subjects(name, level)')
      .eq('id', assignmentId)
      .single()

    if (dlData) {
      isDirectAssignment = true
      
      let finalDescription = dlData.description;
      let finalImageUrl = dlData.image_url;
      let finalPastPaperTag = dlData.past_paper_tag;
      let finalTopicTag = dlData.topic_tag;
      let finalTotalPoints = dlData.total_points;
      let finalQuestions = dlData.questions || [];

      if (dlData.description && dlData.description.trim().startsWith('{') && dlData.description.includes('"_richAssignment":true')) {
        try {
          const parsed = JSON.parse(dlData.description);
          finalDescription = parsed.originalDescription;
          finalImageUrl = parsed.imageUrl;
          finalPastPaperTag = parsed.pastPaperTag;
          finalTopicTag = parsed.topicTag;
          finalTotalPoints = parsed.totalPoints;
          finalQuestions = parsed.questions || [];
        } catch (err) {
          console.error("Error parsing fallback description:", err);
        }
      }

      assignment = {
        id: dlData.id,
        assignment_number: 1,
        title: dlData.title,
        description: finalDescription,
        image_url: finalImageUrl,
        past_paper_tag: finalPastPaperTag,
        topic_tag: finalTopicTag,
        total_points: finalTotalPoints,
        item: {
          module: {
            subject_id: dlData.subject_id
          }
        }
      } as any
      questions = finalQuestions
    }
  }

  // 3. Fetch the submission status for this user
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', user.id)
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
        {assignment.image_url && (
          <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-border shadow-sm">
            <img 
              src={assignment.image_url} 
              alt="Assignment Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-start gap-4 border-b pb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">
              Assignment #{assignment.assignment_number}
            </div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {assignment.past_paper_tag && (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1.5 px-3 py-1 font-semibold text-xs rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Past Exam Paper: {assignment.past_paper_tag}
                </Badge>
              )}
              {assignment.topic_tag && (
                <Badge variant="outline" className="bg-amber-500/5 text-amber-600 dark:text-amber-500 border-amber-500/20 flex items-center gap-1.5 px-3 py-1 font-semibold text-xs rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Topic: {assignment.topic_tag}
                </Badge>
              )}
              {(assignment.total_points || (questions && questions.length > 0)) && (
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 flex items-center gap-1.5 px-3 py-1 font-semibold text-xs rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Total Points: {questions && questions.length > 0 ? questions.reduce((sum: number, q: any) => sum + q.points, 0) : assignment.total_points}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description || "No description provided."}</p>
        </div>

        {questions && questions.length > 0 && (
          <div className="pt-6 border-t space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Assignment Questions
            </h2>
            <div className="grid gap-4">
              {questions.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className="bg-muted/10 border border-border/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                      Question {qIdx + 1}
                    </h3>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
                      {q.points} Points
                    </Badge>
                  </div>
                  <p className="text-base text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {q.question_text}
                  </p>
                  {q.image_url && (
                    <div className="relative max-w-lg rounded-lg overflow-hidden border border-border/60 shadow-sm mt-2">
                      <img 
                        src={q.image_url} 
                        alt={`Question ${qIdx + 1} Diagram`} 
                        className="w-full object-contain max-h-[300px]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {submission?.status === 'graded' && (
          <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-green-800 dark:text-green-300 mb-2">
              Grade: {submission.overall_grade || 'Not specified'}
            </h2>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">Tutor Comments</p>
              <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-wrap">
                {submission.overall_feedback || 'No feedback provided.'}
              </p>
            </div>
          </div>
        )}

        <div className="pt-8 border-t">
          <AssignmentUploader 
            assignmentId={assignment.id} 
            initialStatus={submission?.status || 'not_submitted'} 
          />
        </div>
      </div>
    </div>
  )
}
