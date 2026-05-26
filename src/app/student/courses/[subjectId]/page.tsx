import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookUser, Clock, PlayCircle, FileText } from 'lucide-react';

export default async function CoursePage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId: courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      tutor:profiles (
        full_name
      ),
      lessons (*)
    `)
    .eq('id', courseId)
    .single();

  if (!course) {
    notFound();
  }

  const lessons = course.lessons || [];
  const sortedLessons = [...lessons].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground mt-2">{course.description}</p>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookUser className="h-4 w-4" />
            <span>Tutor: {course.tutor?.full_name || 'TBA'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{sortedLessons.length} Lessons</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        {sortedLessons.length > 0 ? (
          <div className="space-y-4">
            {sortedLessons.map((lesson: any, index: number) => (
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
                    <Link href={`/student/courses/${course.id}/${lesson.id}`}>
                      Start Lesson
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-muted/50">
            <p className="text-muted-foreground">No lessons have been added to this course yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
