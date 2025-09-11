import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { subjects } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Subjects</h1>
        <p className="text-muted-foreground">
          Choose a subject to see available courses and start learning.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Link href={`/student/courses/${subject.id}`} key={subject.id} className="group block">
            <Card className="h-full overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:-translate-y-1">
              <div className="relative h-40 w-full">
                <Image
                  src={subject.imageUrl}
                  alt={subject.name}
                  fill
                  className="object-cover"
                  data-ai-hint={subject.imageHint}
                />
              </div>
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{subject.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
