'use client';

import { ProgressCharts } from "@/components/app/student/progress/progress-charts";
import { Search, Bell, MoreHorizontal, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/user-context";

export default function ProgressPage() {
  const { profile } = useUser();
  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'Student';

  return (
    <div className="space-y-8 bg-neutral-50/50 dark:bg-neutral-900/10 min-h-screen p-2 sm:p-6 rounded-[2rem]">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Welcome Back {userName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            You've completed 3 lessons today — keep it up!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative hover:bg-neutral-100">
                <MessageSquare className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold border-2 border-white dark:border-neutral-900">9</span>
             </Button>
             <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-neutral-100">
                <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
             </Button>
          </div>
          <div className="relative max-w-sm w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input 
               placeholder="Search for Courses, Resources etc.." 
               className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-full h-10 text-xs shadow-sm"
             />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 shadow-sm hover:bg-neutral-100">
             <MoreHorizontal className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </Button>
        </div>
      </div>

      <ProgressCharts />
    </div>
  );
}
