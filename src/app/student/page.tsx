'use client'

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  BrainCircuit, Lightbulb, Video, Calendar, Clock, Shield, Search, Bell, Sparkles, 
  ChevronRight, BookOpen, ShieldAlert, X 
} from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

function AiStudyPanel() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-xl shadow-purple-500/20 transition-transform duration-300 hover:-translate-y-1 group"
    >
      <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
        <Sparkles className="w-32 h-32" />
      </div>
      <div className="relative z-10 max-w-sm lg:max-w-md">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium mb-4 border border-white/20">
          <Sparkles className="w-4 h-4" />
          Premium Feature
        </div>
        <h2 className="text-2xl font-bold mb-2">AI-Powered Study Panel</h2>
        <p className="text-white/80 mb-6 line-clamp-2">Unlock tailored insights, instant concept breakdowns, and personalized quizzes powered by your AI Study Buddy.</p>
        <Button asChild className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-lg w-fit h-auto">
          <Link href="/student/study-panel">
            Enter Study Panel
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

function AiTutorAssistant({ courses }: { courses: any[] }) {
  return (
    <motion.div layout className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] p-5 border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
         <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
           <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
         </div>
         <h3 className="font-bold">AI Tutor Assistant</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Have a quick question? Your AI tutor is ready to help instantly.</p>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask anything..." 
          className="w-full bg-neutral-100/80 dark:bg-neutral-800/80 border-none rounded-2xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-xl hover:scale-105 transition-transform">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function UpcomingLiveClass({ upcomingClass, loading }: { upcomingClass: LiveClass | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] p-5 border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-40">
      </div>
    );
  }

  return (
    <motion.div layout className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] p-5 border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold">Upcoming Events</h3>
        <Link href="/student/live-classes" className="text-xs font-medium text-primary hover:underline">View All</Link>
      </div>
      
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-neutral-700 before:to-transparent flex-1">
        
        {upcomingClass ? (
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-neutral-900 bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Video className="w-3 h-3" />
            </div>
            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 shadow-sm border border-neutral-100 dark:border-neutral-800 transition-transform duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => window.location.href = `/classroom/${upcomingClass.id}`}>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                <Clock className="w-3 h-3" />
                {upcomingClass.schedule ? new Date(upcomingClass.schedule).toLocaleDateString() : 'TBD'}
              </div>
              <h4 className="text-sm font-bold mb-1">{upcomingClass.title}</h4>
              <p className="text-xs text-muted-foreground">with {upcomingClass.tutor?.full_name || 'Tutor'}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-muted-foreground text-sm py-4">No upcoming events scheduled.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SecurityAlert() {
  const { user } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is logged in via Google (OAuth)
    if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
      setIsVisible(true);
    }
  }, [user]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          layoutId="security-banner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
          className="relative bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-md border border-amber-200/50 dark:border-amber-900/50 rounded-[2rem] p-5 shadow-sm"
        >
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-amber-600/50 hover:text-amber-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex gap-3 mb-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl h-fit">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Secure Your Account</h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 pr-4">We noticed you logged in via Google. Set a password for backup access.</p>
            </div>
          </div>
          <Button asChild className="w-full bg-amber-200/50 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-xs font-semibold py-2 rounded-xl transition-colors h-auto">
            <Link href="/student/settings?tab=security">Setup Password</Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
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
        const [enrollmentsResult, upcomingClassResult] = await Promise.all([
          supabase
            .from('enrollments')
            .select(`
              subject:subjects (
                id,
                name
              )
            `)
            .eq('student_id', profile.id)
            .eq('status', 'approved'),
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
            .map(e => e.subject)
            .filter(Boolean)
            .map((subject: any) => {
              return {
                name: subject.name,
                overallProgress: 0,
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
    <div className="min-h-screen text-neutral-900 dark:text-neutral-100 font-sans font-[family-name:var(--font-inter)] selection:bg-primary/30">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[66%_34%] gap-6 h-full">
        
        {/* =========================================
            MIDDLE COLUMN: Main Learning Feed
            ========================================= */}
        <main className="flex flex-col gap-8 h-full pr-2 pb-24 lg:pb-0">
          
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

          <motion.header 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="pt-2 lg:pt-4 hidden sm:block"
          >
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Welcome back, {userName.split(' ')[0]}!</h1>
            <p className="text-neutral-500 dark:text-neutral-400">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
          </motion.header>

          <AiStudyPanel />

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <h3 className="text-xl font-bold mb-4">Your Enrolled Subjects</h3>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:snap-none sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {loadingCourses ? (
                  [1, 2].map((i) => (
                    <div key={i} className="animate-pulse shrink-0 w-[85vw] snap-center sm:w-auto rounded-[2rem] bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 h-64" />
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
                  <div className="col-span-full flex flex-col items-center justify-center text-center p-8 rounded-[2rem] bg-white/40 dark:bg-neutral-900/20 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 min-h-[300px]">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-5 rounded-[2rem] mb-6 shadow-inner">
                        <BookOpen className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">No Subjects Enrolled</h4>
                      <p className="text-muted-foreground max-w-sm mb-8">
                        Your learning journey starts here. Discover new topics, enroll in subjects, and track your progress effortlessly.
                      </p>
                      <Button asChild className="bg-primary text-primary-foreground px-8 py-6 rounded-2xl font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/25">
                        <Link href="/student/courses">Browse Subjects</Link>
                      </Button>
                  </div>
                )}
            </div>
          </motion.div>
        </main>

        {/* =========================================
            RIGHT COLUMN: Utility & Notification Panel
            ========================================= */}
        <aside className="flex flex-col gap-6 h-full pb-6">
          <SecurityAlert />
          <AiTutorAssistant courses={courses} />
          <UpcomingLiveClass upcomingClass={upcomingClass} loading={loadingUpcoming} />
        </aside>
      </div>
    </div>
  );
}
