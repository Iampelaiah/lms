import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { studentData } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import { ProgressOverview } from '@/components/app/student/dashboard/progress-overview';
import { QuickSubjects } from '@/components/app/student/dashboard/quick-subjects';
import { AiTutor } from '@/components/app/student/dashboard/ai-tutor';
import { AiRecommendations } from '@/components/app/student/dashboard/ai-recommendations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function AiRecommendationsSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
}

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {studentData.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your learning journey today.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            You have completed {studentData.overallProgress}% of your assigned coursework. Keep it up!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={studentData.overallProgress} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressOverview />
        <QuickSubjects />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiTutor />
        <Suspense fallback={<AiRecommendationsSkeleton />}>
            <AiRecommendations />
        </Suspense>
      </div>
    </div>
  );
}
