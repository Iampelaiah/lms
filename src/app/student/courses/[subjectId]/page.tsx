'use client';

import { createClient } from '@/utils/supabase/client';
import { notFound, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookUser, Clock, PlayCircle, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CoursePage() {
  const params = useParams();
  const courseId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          *,
          tutor:profiles (
            full_name
          )
        `)
        .eq('id', courseId)
        .single();
      
      if (courseData) {
        setCourse(courseData);
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });
        
        if (lessonData) setLessons(lessonData);
      }
      setLoading(false);
    };

    if (courseId) fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading course content...</p>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

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
            <span>{lessons.length} Lessons</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Curriculum</h2>
        {lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
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
