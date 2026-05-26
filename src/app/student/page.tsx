
'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit, Lightbulb, Video, Calendar, Clock, Shield } from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { SchoolHeader } from '@/components/app/school-header';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Skeleton } from "@/components/ui/skeleton";

function AiStudyPanel() {
  return (
    <Card className="bg-secondary/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-primary/10 p-3 rounded-full">
                <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow">
                <h3 className="text-xl font-bold">AI-Powered Study Panel</h3>
                <p className="text-muted-foreground">Choose a subject to get key concepts, resources, and answers from your AI Study Buddy.</p>
            </div>
            <Button asChild size="lg">
                <Link href="/student/study-panel">Go to Study Panel</Link>
            </Button>
        </CardContent>
    </Card>
  )
}

function AiTutorAssistant({ courses, isLoading }: { courses: any[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-md">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <CardTitle>AI Tutor Assistant</CardTitle>
            <CardDescription>Get personalized learning resource recommendations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Skeleton className="h-10 w-full rounded-md" />
             <Skeleton className="h-10 w-full rounded-md" />
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.name} value={course.name.toLowerCase()}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Focus Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conceptual">Conceptual Understanding</SelectItem>
                <SelectItem value="problem-solving">Problem Solving</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="exam-prep">Exam Preparation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <Button className="w-full" disabled={isLoading}>
          <Lightbulb className="mr-2 h-4 w-4" />
          {isLoading ? 'Preparing...' : 'Get Recommendations'}
        </Button>
      </CardContent>
    </Card>
  );
}

function UpcomingLiveClass() {
  const supabase = createClient();

  const { data: upcomingClass, error, isLoading } = useSWR('upcoming-class', async () => {
    const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          tutor:profiles!classes_tutor_id_fkey (
            full_name
          )
        `)
        .or('status.eq.ongoing,status.eq.upcoming')
        .order('schedule', { ascending: true })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="aspect-[3/2] w-full rounded-lg" />
          <Skeleton className="h-6 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (!upcomingClass) {
    return (
       <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-md">
                <Video className="w-6 h-6 text-blue-500" />
              </div>
              <CardTitle>Upcoming Live Class</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-12">No upcoming classes scheduled.</p>
          </CardContent>
       </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-md">
            <Video className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle>Upcoming Live Class</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[3/2] rounded-lg overflow-hidden relative">
          {upcomingClass.imageUrl ? (
            <Image src={upcomingClass.imageUrl} alt="Live class thumbnail" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Video className="w-12 h-12 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg">{upcomingClass.title}</h3>
          <p className="text-sm text-muted-foreground">with {upcomingClass.tutor?.full_name || 'Tutor'}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{upcomingClass.schedule ? new Date(upcomingClass.schedule).toLocaleDateString() : 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{upcomingClass.schedule ? new Date(upcomingClass.schedule).toLocaleTimeString() : 'TBD'}</span>
          </div>
        </div>
        <Button className="w-full" asChild>
          <Link href={`/classroom/${upcomingClass.id}`}>Join Classroom</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function SecurityAlert() {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
      setIsVisible(true);
    }
  }, [user]);

  if (!isVisible) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">Secure Your Account</p>
            <p className="text-xs text-muted-foreground">Since you signed in with Google, we recommend setting up a permanent password for extra security.</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>Later</Button>
           <Button size="sm" asChild>
             <Link href="/student/settings?tab=security">Set Password</Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboardPage() {
  const { profile } = useUser();
  const supabase = createClient();
  const userName = profile?.full_name || 'Student';

  const { data: courses = [], isLoading: loadingCourses } = useSWR(
    profile?.id ? `student-progress-${profile.id}` : null,
    async () => {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          course:courses (
            id,
            title,
            lessons (id),
            student_progress (completed)
          )
        `)
        .eq('student_id', profile?.id);

      if (!enrollments) return [];

      return enrollments
        .map(e => e.course)
        .filter(Boolean)
        .map((course: any) => {
          const totalLessons = course.lessons?.length || 0;
          const completedLessons = course.student_progress?.filter((p: any) => p.completed).length || 0;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          return {
            name: course.title,
            overallProgress: progress,
            topics: []
          };
        });
    }
  );

  return (
    <div className="space-y-6">
        <SchoolHeader />
        <SecurityAlert />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here's your learning snapshot for today. Keep up the great work!
        </p>
      </div>

     <AiStudyPanel />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loadingCourses ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full rounded-md" />
                <div className="flex gap-2">
                   <Skeleton className="h-4 w-12" />
                   <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : courses.length > 0 ? (
          courses.map((course: any, index: number) => (
              <DetailedProgressCard 
                  key={course.name} 
                  subject={course.name}
                  overallProgress={course.overallProgress}
                  topics={course.topics}
                  autoplayDelay={2000 + index * 500}
              />
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 p-12 text-center bg-muted/10 border-dashed border-2 flex flex-col items-center gap-4">
             <div className="bg-muted p-4 rounded-full">
                <Lightbulb className="w-8 h-8 text-muted-foreground/40" />
             </div>
             <div className="space-y-1">
                <h3 className="font-bold text-lg">No Courses Enrolled</h3>
                <p className="text-muted-foreground text-sm">Enroll in a course to track your progress and access AI study tools.</p>
             </div>
             <Button asChild variant="outline">
                <Link href="/student/courses">Browse Courses</Link>
             </Button>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AiTutorAssistant courses={courses} isLoading={loadingCourses} />
        </div>
        <div>
            <UpcomingLiveClass />
        </div>
      </div>

    </div>
  );
}
