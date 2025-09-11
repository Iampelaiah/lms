import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { subjects } from '@/lib/data';
import { ArrowRight, BookMarked } from 'lucide-react';
import Link from 'next/link';

export function QuickSubjects() {
  const quickSubjects = subjects.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookMarked className="text-primary" />
            <span>My Subjects</span>
        </CardTitle>
        <CardDescription>
          Jump back into your learning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {quickSubjects.map((subject) => (
            <li key={subject.id}>
              <Link
                href={`/student/courses/${subject.id}`}
                className="flex items-center justify-between p-3 -m-3 rounded-md hover:bg-secondary transition-colors"
              >
                <span className="font-medium">{subject.name}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
