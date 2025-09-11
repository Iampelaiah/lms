import { getLearningRecommendations } from '@/ai/flows/student-dashboard-ai-recommendations';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { studentData } from '@/lib/data';
import { Lightbulb, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function fetchRecommendations() {
  try {
    const recommendations = await getLearningRecommendations({
      studentId: 'student-123',
      recentSubjects: studentData.recentSubjects,
      grades: studentData.progress.reduce(
        (acc, p) => ({ ...acc, [p.subject]: p.grade }),
        {}
      ),
      learningGoals: studentData.learningGoals,
    });
    return recommendations.recommendations;
  } catch (error) {
    console.error('Failed to fetch AI recommendations:', error);
    return [
      // Fallback data
      {
        resourceName: 'Khan Academy: Geometry Basics',
        resourceType: 'video',
        subject: 'Mathematics',
        whyRecommended: 'A great starting point for your goal to improve in Geometry.',
        link: '#',
      },
      {
        resourceName: 'College Board: Full-length SAT Practice Test',
        resourceType: 'practice quiz',
        subject: 'General Prep',
        whyRecommended: 'Provides a baseline for your SAT preparation goal.',
        link: '#',
      },
    ];
  }
}

export async function AiRecommendations() {
  const recommendations = await fetchRecommendations();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary" />
          <span>AI Recommendations</span>
        </CardTitle>
        <CardDescription>
          Personalized resources to help you reach your goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
              <div className="flex-grow">
                <p className="font-semibold">{rec.resourceName}</p>
                <p className="text-sm text-muted-foreground">
                  {rec.whyRecommended}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto shrink-0">
                <Link href={rec.link} target="_blank">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
