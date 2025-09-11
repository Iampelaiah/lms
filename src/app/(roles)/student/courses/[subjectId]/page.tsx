import { subjects } from '@/lib/data';
import { notFound } from 'next/navigation';
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
import { BookUser, Clock } from 'lucide-react';

export default function SubjectCoursesPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const subject = subjects.find((s) => s.id === params.subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{subject.name}</h1>
        <p className="text-muted-foreground">{subject.description}</p>
      </div>

      {subject.courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {subject.courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookUser className="mr-2 h-4 w-4" />
                  <span>Tutor: {course.tutor}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>Duration: {course.duration}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/student/courses/${subject.id}/${course.id}`}>
                    View Course
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No Courses Yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Courses for {subject.name} are being prepared. Check back soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
