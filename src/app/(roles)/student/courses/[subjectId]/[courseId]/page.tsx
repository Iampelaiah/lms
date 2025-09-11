import { subjects } from '@/lib/data';
import { notFound } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { BookUser, Clock, PlayCircle, FileText, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const lessonIcons = {
  video: PlayCircle,
  reading: FileText,
  quiz: HelpCircle,
};

export default function CourseDetailsPage({
  params,
}: {
  params: { subjectId: string; courseId: string };
}) {
  const subject = subjects.find((s) => s.id === params.subjectId);
  const course = subject?.courses.find((c) => c.id === params.courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{course.name}</h1>
        <p className="text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
                <BookUser className="mr-2 h-4 w-4" />
                <span>Tutor: {course.tutor}</span>
            </div>
            <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Duration: {course.duration}</span>
            </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Curriculum</CardTitle>
        </CardHeader>
        <CardContent>
          {course.curriculum.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {course.curriculum.map((lesson, index) => {
                const Icon = lessonIcons[lesson.type];
                return (
                  <AccordionItem value={`item-${index}`} key={lesson.id}>
                    <AccordionTrigger>
                        <div className="flex items-center gap-4">
                            <Icon className="h-5 w-5 text-primary" />
                            <span>{lesson.title}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-11">
                      <div className="flex items-center justify-between">
                        <p>Lesson content will appear here.</p>
                        <Badge variant="secondary">{lesson.duration} min</Badge>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <p className="text-muted-foreground">The curriculum for this course is not yet available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
