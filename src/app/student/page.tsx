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
  ChevronRight, BookOpen, ShieldAlert, X, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
      className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl shadow-purple-500/20 transition-transform duration-300 hover:-translate-y-1 group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
        <Sparkles className="w-24 h-24" />
      </div>
      <div className="relative z-10 max-w-sm lg:max-w-md">
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3 border border-white/20 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Premium Feature
        </div>
        <h2 className="text-xl font-bold mb-1.5">AI-Powered Study Panel</h2>
        <p className="text-sm text-white/80 mb-5 line-clamp-2 leading-relaxed">Unlock tailored insights, instant concept breakdowns, and personalized quizzes powered by your AI Study Buddy.</p>
        <Button asChild className="bg-white text-purple-600 px-5 py-2.5 h-auto rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-neutral-50 transition-colors shadow-md w-fit">
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
    <motion.div layout className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[1.5rem] p-5 border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-3">
         <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
           <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
         </div>
         <h3 className="font-bold text-sm">AI Tutor Assistant</h3>
      </div>
      <p className="text-[13px] text-muted-foreground mb-4">Have a quick question? Your AI tutor is ready to help instantly.</p>
      <div className="relative">
        <input 
          type="text" 
          placeholder="Ask anything..." 
          className="w-full bg-neutral-100/80 dark:bg-neutral-800/80 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
        />
        <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-lg hover:scale-105 transition-transform">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function UpcomingLiveClass({ upcomingClass, loading }: { upcomingClass: any | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="animate-pulse bg-[#1e2532] rounded-3xl p-5 h-40 border border-white/5 flex-1"></div>
    );
  }

  if (!upcomingClass) {
    return (
      <motion.div layout className="bg-[#1e2532] text-white rounded-[2rem] p-6 shadow-2xl relative">
        <h3 className="font-bold text-lg mb-2">Upcoming Timeline</h3>
        <p className="text-neutral-400 text-sm bg-white/5 p-4 rounded-xl text-center">No upcoming lessons scheduled.</p>
      </motion.div>
    );
  }

  const startTime = upcomingClass.start_date ? new Date(upcomingClass.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '10:00 am';
  const duration = upcomingClass.duration_minutes || 60;
  const endTime = upcomingClass.start_date ? new Date(new Date(upcomingClass.start_date).getTime() + duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : '11:00 am';
  const subjectName = upcomingClass.module?.subject?.name || upcomingClass.title;

  return (
    <motion.div layout className="bg-[#1e2532] text-white rounded-[2rem] p-6 flex flex-col shadow-2xl relative">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg tracking-tight">Timeline Manager</h3>
        <span className="text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 bg-white/10 rounded-full">Next Up</span>
      </div>

      {/* Horizontal Date Selector (Dynamically centered around today) */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-3 mb-6 w-full">
        {Array.from({ length: 5 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (i - 2)); // i=0 => -2 days, i=2 => 0 (today)
          const isToday = i === 2;
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = date.getDate();
          
          return (
            <div key={i} className={`flex flex-col items-center justify-center transition-all duration-300 ${
              isToday 
              ? 'w-12 h-16 sm:w-14 sm:h-20 bg-[#d2f34c] text-[#1e2532] rounded-[1.25rem] sm:rounded-full shadow-lg scale-105 z-10' 
              : 'w-10 h-14 sm:w-10 sm:h-16 bg-white/5 text-neutral-400 rounded-full hover:bg-white/10 cursor-pointer'
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${isToday ? 'text-[#1e2532]/70' : 'opacity-60'}`}>{dayName}</span>
              <span className={`font-extrabold text-lg sm:text-xl leading-none ${!isToday ? 'opacity-90' : ''}`}>{dayNumber}</span>
            </div>
          );
        })}
      </div>

      <div className="rounded-[1.25rem] bg-[#d2f34c] text-[#1e2532] p-4 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e2532] text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10">
            <Clock className="w-5 h-5 text-[#d2f34c]" />
          </div>
          <div className="pr-2 flex-1">
            <h4 className="font-extrabold text-[15px] leading-tight mb-0.5 text-[#1e2532] truncate">{upcomingClass.title}</h4>
            <p className="text-[10px] font-bold opacity-70 text-[#1e2532] uppercase tracking-wide">{subjectName}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#1e2532]/10 text-xs font-bold text-[#1e2532]">
          <span className="opacity-80 uppercase tracking-wider text-[10px]">
            {new Date(upcomingClass.start_date || new Date()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="bg-[#1e2532]/5 px-2 py-1 rounded-md">{startTime} - {endTime}</span>
        </div>
      </div>
    </motion.div>
  )
}

function NotificationBell() {
  const { user } = useUser();
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  useEffect(() => {
    // Check if user is logged in via Google (OAuth)
    if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
      setIsAlertVisible(true);
    }
  }, [user]);

  const hasNotifications = isAlertVisible;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 relative hover:bg-secondary/70">
          {hasNotifications && <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy rounded-full animate-pulse shadow-sm"></span>}
          <Bell className="w-4 h-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 mr-4 sm:mr-8 mt-2 border border-white/10 shadow-2xl rounded-[1.5rem] bg-white/80 dark:bg-[#1a1f2c]/90 backdrop-blur-xl z-50" align="end">
        <h3 className="font-bold text-lg mb-4 px-1">Notifications</h3>
        {hasNotifications ? (
          <div className="flex flex-col gap-3">
             {isAlertVisible && (
                <div className="relative bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-md border border-amber-200/50 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm">
                  <button 
                    onClick={() => setIsAlertVisible(false)}
                    className="absolute top-3 right-3 text-amber-600/50 hover:text-amber-600 transition-colors p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex gap-3 mb-3">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl h-fit">
                      <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm leading-none mb-1">Secure Your Account</h4>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 pr-4 leading-tight">We noticed you logged in via Google. Set a password for backup access.</p>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-amber-200/50 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold py-2 rounded-xl transition-colors h-auto uppercase tracking-wide">
                    <Link href="/student/settings?tab=security">Setup Password</Link>
                  </Button>
                </div>
             )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-5 h-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">You're all caught up</p>
            <p className="text-[11px] text-muted-foreground mt-1">Check back later for new alerts</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
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
                name,
                modules (
                  title
                )
              )
            `)
            .eq('student_id', profile.id)
            .eq('status', 'approved'),
          supabase
            .from('curriculum_items')
            .select(`
              *,
              module:curriculum_modules (
                subject:subjects (name)
              )
            `)
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
            .limit(1)
            .maybeSingle()
        ]);

        const enrollments = enrollmentsResult.data;
        if (enrollments) {
          const formatted = enrollments
            .map(e => e.subject)
            .filter(Boolean)
            .map((subject: any) => {
              // Fetch modules if available, otherwise use placeholders for the carousel
              const fetchedTopics = subject.modules?.map((m: any) => ({ name: m.title, progress: 0 })) || [];
              const defaultTopics = [
                { name: "Introduction to " + subject.name, progress: 15 },
                { name: "Core Concepts", progress: 0 }
              ];
              
              return {
                name: subject.name,
                overallProgress: 0,
                topics: fetchedTopics.length > 0 ? fetchedTopics : defaultTopics
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
              <NotificationBell />
            </div>
          </div>

          <motion.header 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="pt-2 lg:pt-4 hidden sm:flex items-start justify-between"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">Welcome back, {userName.split(' ')[0]}!</h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">"The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice."</p>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <NotificationBell />
            </div>
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
        <aside className="flex flex-col gap-4 h-full pb-6">
          <AiTutorAssistant courses={courses} />
          <UpcomingLiveClass upcomingClass={upcomingClass} loading={loadingUpcoming} />
        </aside>
      </div>
    </div>
  );
}

