
'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BrainCircuit, Lightbulb, Video, Calendar, Clock, Loader2, Shield, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SchoolHeader } from '@/components/app/school-header';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { LiveClass } from '@/lib/types';
import React, { useEffect, useState } from 'react';

function AiStudyPanel() {
  return (
    <Card className="bg-secondary/50 rounded-[2rem] border-none shadow-md">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-primary/10 p-4 rounded-full">
                <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-bold">AI-Powered Study Panel</h3>
                <p className="text-muted-foreground text-sm mt-1">Choose a subject to get key concepts, resources, and answers from your AI Study Buddy.</p>
            </div>
            <Button asChild size="lg" className="rounded-full w-full sm:w-auto font-semibold">
                <Link href="/student/study-panel">Go to Study Panel</Link>
            </Button>
        </CardContent>
    </Card>
  )
}

function AiTutorAssistant({ courses }: { courses: any[] }) {
  return (
    <Card className="rounded-[2rem] shadow-sm">
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
        <Button className="w-full rounded-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}

function UpcomingLiveClass({ upcomingClass, loading }: { upcomingClass: LiveClass | null; loading: boolean }) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader><div className="h-6 w-32 bg-muted rounded" /></CardHeader>
        <CardContent><div className="aspect-[3/2] bg-muted rounded mb-4" /></CardContent>
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
    <Card className="rounded-[2rem] shadow-sm">
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
        <Button className="w-full rounded-full font-semibold" asChild>
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
    // Check if user is logged in via Google (OAuth)
    // Most OAuth users won't have a local password set initially
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
  const [courses, setCourses] = React.useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [upcomingClass, setUpcomingClass] = useState<LiveClass | null>(null);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const supabase = React.useMemo(() => createClient(), []);
  const userName = profile?.full_name || 'Student';

  const fetchDashboardData = React.useCallback(async () => {
      if (!profile?.id) {
        setLoadingCourses(false);
        setLoadingUpcoming(false);
        return;
      }

      try {
        // Run student progress fetch and upcoming live class fetch in parallel
        const [enrollmentsResult, upcomingClassResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              course:courses (
                id,
                title,
                lessons (id),
                student_progress (completed)
              )
            `)
            .eq('student_id', profile.id),
          supabase
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
            .maybeSingle()
        ]);

        const enrollments = enrollmentsResult.data;
        if (enrollments) {
          const formatted = enrollments
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
          setCourses(formatted);
        }

        if (upcomingClassResult.data) {
          setUpcomingClass(upcomingClassResult.data as any);
        } else {
          setUpcomingClass(null);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoadingCourses(false);
        setLoadingUpcoming(false);
      }
  }, [profile?.id, supabase]);

  React.useEffect(() => {
    fetchDashboardData();

    // Real-time: instantly reflect when admin adds/removes enrollments
    if (!profile?.id) return;
    const channel = supabase
      .channel(`student-enrollments-${profile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enrollments',
        filter: `student_id=eq.${profile.id}`,
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDashboardData, profile?.id, supabase]);
  return (
    <div className="space-y-6">
        <SchoolHeader />
        <SecurityAlert />
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between sm:hidden mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt={userName} />
            <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground leading-none">Good morning,</p>
            <h1 className="text-lg font-bold">Hi, {userName.split(' ')[0]}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <Search className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Desktop Welcome Header */}
      <div className="hidden sm:block">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here's your learning snapshot for today. Keep up the great work!
        </p>
      </div>

     <AiStudyPanel />

      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:snap-none sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {loadingCourses ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse shrink-0 w-[85vw] snap-center sm:w-auto rounded-[2rem]">
              <CardHeader><div className="h-6 w-32 bg-muted rounded" /></CardHeader>
              <CardContent><div className="h-32 bg-muted rounded" /></CardContent>
            </Card>
          ))
        ) : courses.length > 0 ? (
          courses.map((course, index) => (
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
                <h3 className="font-bold text-lg">No Subjects Enrolled</h3>
                <p className="text-muted-foreground text-sm">Enroll in a subject to track your progress and access AI study tools.</p>
             </div>
             <Button asChild variant="outline">
                <Link href="/student/courses">Browse Subjects</Link>
             </Button>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AiTutorAssistant courses={courses} />
        </div>
        <div>
            <UpcomingLiveClass upcomingClass={upcomingClass} loading={loadingUpcoming} />
        </div>
      </div>

    </div>
  );
}
