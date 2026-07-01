'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Layers, 
  Video, 
  FileQuestion, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp, 
  Award, 
  Activity, 
  ArrowUpRight, 
  Download, 
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface CourseDetailTabsProps {
  subject: any;
  modules: any[];
  submissions: any[];
  resources: any[];
  forumPosts: any[];
  completions: any[];
  progress: any[];
  studentDeadlines: any[];
  subjectId: string;
}

export function CourseDetailTabs({
  subject,
  modules,
  submissions,
  resources,
  forumPosts,
  completions,
  progress,
  studentDeadlines = [],
  subjectId
}: CourseDetailTabsProps) {

  // Create submission map for quick status lookup
  const submissionMap = React.useMemo(() => {
    const map = new Map();
    if (submissions) {
      submissions.forEach(sub => {
        map.set(sub.assignment_id, sub);
      });
    }
    return map;
  }, [submissions]);

  // 1. Calculate Grade Dynamic Logic
  const gradeInfo = React.useMemo(() => {
    const gradedSubmissions = submissions?.filter(s => s.status === 'graded' && s.overall_grade);
    let letterGrade = 'N/A';
    let subtext = 'No grades yet';
    let footerText = 'Start submitting assignments!';

    if (gradedSubmissions && gradedSubmissions.length > 0) {
      let sum = 0;
      let count = 0;
      gradedSubmissions.forEach(sub => {
        const gStr = String(sub.overall_grade);
        const clean = gStr.replace('%', '').trim();
        const num = parseFloat(clean);
        if (!isNaN(num)) {
          sum += num;
          count++;
        } else {
          // Map letters to percentage points
          const letterMap: Record<string, number> = {
            'A+': 97, 'A': 93, 'A-': 90,
            'B+': 87, 'B': 83, 'B-': 80,
            'C+': 77, 'C': 73, 'C-': 70,
            'D+': 67, 'D': 63, 'F': 50
          };
          const mapped = letterMap[gStr.toUpperCase()];
          if (mapped !== undefined) {
            sum += mapped;
            count++;
          }
        }
      });

      if (count > 0) {
        const avg = Math.round(sum / count);
        subtext = `${avg}%`;
        
        if (avg >= 97) { letterGrade = 'A+'; footerText = 'Superb work! Keep it up ↗'; }
        else if (avg >= 93) { letterGrade = 'A'; footerText = 'Excellent performance! ↗'; }
        else if (avg >= 90) { letterGrade = 'A-'; footerText = 'Great job! ↗'; }
        else if (avg >= 87) { letterGrade = 'B+'; footerText = 'Excellent progress! ↗'; }
        else if (avg >= 83) { letterGrade = 'B'; footerText = 'Good progress! ↗'; }
        else if (avg >= 80) { letterGrade = 'B-'; footerText = 'Solid work! ↗'; }
        else if (avg >= 77) { letterGrade = 'C+'; footerText = 'Making progress! ↗'; }
        else if (avg >= 73) { letterGrade = 'C'; footerText = 'Passing grade! ↗'; }
        else if (avg >= 70) { letterGrade = 'C-'; footerText = 'Keep practicing ↗'; }
        else { letterGrade = 'D'; footerText = 'Needs improvement ↗'; }
      }
    }

    return { letterGrade, subtext, footerText };
  }, [submissions]);

  // 2. Calculate Progress Dynamic Logic
  const progressInfo = React.useMemo(() => {
    const totalTopics = modules?.reduce((acc, mod) => acc + (mod.items?.length || 0), 0) || 0;
    const completedTopics = completions?.filter(c => c.is_done).length || 0;
    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    
    const completedModules = progress?.filter(p => p.is_completed).length || 0;
    const totalModules = modules?.length || 0;
    const remainingTopics = totalTopics - completedTopics;

    return {
      progressPercent,
      completedModules,
      totalModules,
      remainingTopics
    };
  }, [modules, completions, progress]);

  // Gather all course assignments
  const allAssignments = React.useMemo(() => {
    const list: any[] = [];
    modules?.forEach(mod => {
      mod.items?.forEach((item: any) => {
        item.assignments?.forEach((assign: any) => {
          list.push({
            ...assign,
            topicTitle: item.title,
            topicId: item.id,
            moduleId: mod.id,
            moduleOrder: mod.sequence_order
          });
        });
      });
    });
    return list;
  }, [modules]);

  // 3. Calculate Upcoming Tasks Dynamic Logic
  const upcomingInfo = React.useMemo(() => {
    const unsubmittedCurriculum = allAssignments.filter(a => {
      const sub = submissionMap.get(a.id);
      return !sub; // No submission record exists
    });

    const pendingDirect = studentDeadlines?.filter(d => d.status === 'pending') || [];

    const count = unsubmittedCurriculum.length + pendingDirect.length;
    let subtext = 'All caught up!';
    let footerText = 'Good job staying on track.';

    if (count > 0) {
      subtext = `${count} assignment${count > 1 ? 's' : ''} due soon`;
      if (unsubmittedCurriculum.length > 0) {
        const nextTask = unsubmittedCurriculum[0];
        footerText = `Next: #${nextTask.assignment_number} "${nextTask.title}"`;
      } else if (pendingDirect.length > 0) {
        const nextTask = pendingDirect[0];
        footerText = `Next: "${nextTask.title}" (Direct)`;
      }
    }

    return { count, subtext, footerText };
  }, [allAssignments, submissionMap, studentDeadlines]);

  // 4. Activity Timeline dynamic generation
  const timelineActivities = React.useMemo(() => {
    const acts: any[] = [];

    // Submissions activity
    submissions?.forEach(sub => {
      const assign = allAssignments.find(a => a.id === sub.assignment_id);
      const date = new Date(sub.created_at || sub.updated_at);
      if (assign) {
        if (sub.status === 'graded') {
          acts.push({
            id: `grade-${sub.id || sub.assignment_id}`,
            type: 'grade',
            title: `Assignment Graded: #${assign.assignment_number} "${assign.title}"`,
            subtext: `Result: ${sub.overall_grade}`,
            date
          });
        } else {
          acts.push({
            id: `submit-${sub.id || sub.assignment_id}`,
            type: 'submit',
            title: `Assignment Submitted: #${assign.assignment_number} "${assign.title}"`,
            subtext: `Submitted for review`,
            date
          });
        }
      }
    });

    // Item completions
    completions?.forEach(comp => {
      let itemTitle = 'Topic';
      let itemType = 'topic';
      
      // Find item in modules
      modules?.forEach(mod => {
        mod.items?.forEach((mi: any) => {
          if (mi.id === comp.item_id) {
            itemTitle = mi.title;
            itemType = mi.item_type;
          }
        });
      });

      const date = new Date(comp.completed_at);
      if (itemType === 'test') {
        acts.push({
          id: `test-${comp.id}`,
          type: 'test',
          title: `Quiz Completed: "${itemTitle}"`,
          subtext: comp.score_achieved !== null ? `Score: ${comp.score_achieved}` : 'Completed',
          date
        });
      }
    });

    // Direct assignment activity
    studentDeadlines?.forEach(dl => {
      const date = new Date(dl.updated_at || dl.created_at);
      if (dl.status === 'completed') {
        acts.push({
          id: `dl-complete-${dl.id}`,
          type: 'grade',
          title: `Direct Assignment Completed: "${dl.title}"`,
          subtext: `Marked complete by tutor`,
          date
        });
      } else if (dl.status === 'pending') {
        acts.push({
          id: `dl-assign-${dl.id}`,
          type: 'submit',
          title: `Direct Assignment Assigned: "${dl.title}"`,
          subtext: `Approved by admin, pending completion`,
          date: new Date(dl.created_at)
        });
      }
    });

    // Sort by date descending
    acts.sort((a, b) => b.date.getTime() - a.date.getTime());

    return acts.slice(0, 10); // show top 10
  }, [submissions, completions, modules, allAssignments, studentDeadlines]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // Extract all quizzes
  const allQuizzes = React.useMemo(() => {
    const quizzes: any[] = [];
    modules?.forEach(mod => {
      mod.items?.forEach((item: any) => {
        if (item.item_type === 'test') {
          quizzes.push({
            ...item,
            moduleId: mod.id,
            moduleTitle: mod.title
          });
        }
      });
    });
    return quizzes;
  }, [modules]);

  // Filter and map student deadlines that are approved (status !== 'pending_admin_review' and status !== 'rejected')
  const approvedStudentDeadlines = React.useMemo(() => {
    if (!studentDeadlines) return [];
    return studentDeadlines
      .filter(d => d.status !== 'pending_admin_review' && d.status !== 'rejected')
      .map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        status: d.status,
        due_date: d.due_date,
        isDirect: true
      }));
  }, [studentDeadlines]);

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="overview" className="w-full space-y-6">
        {/* premium tabs nav wrapper */}
        <div className="border border-border/40 dark:border-zinc-800/40 bg-muted/30 dark:bg-[#111318]/30 rounded-xl p-1.5 backdrop-blur-sm">
          <TabsList className="w-full flex h-auto bg-transparent p-0 flex-wrap justify-start gap-1">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="syllabus" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Syllabus
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Resources
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger 
              value="discussions" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Discussions
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes" 
              className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-zinc-900/80 data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/60 border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10 shrink-0"
            >
              Quizzes
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Current Grade Card */}
            <div className="bg-card border border-border/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all duration-300 relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Current Grade</span>
                  <div className="text-primary/70 bg-primary/5 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight">{gradeInfo.letterGrade}</span>
                  {gradeInfo.letterGrade !== 'N/A' && (
                    <span className="text-sm font-bold text-muted-foreground">{gradeInfo.subtext}</span>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 dark:border-zinc-800/50 flex items-center text-xs font-semibold text-emerald-500">
                <span>{gradeInfo.footerText}</span>
              </div>
            </div>

            {/* Course Progress Card */}
            <div className="bg-card border border-border/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all duration-300 relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Course Progress</span>
                  <div className="text-primary/70 bg-primary/5 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold tracking-tight">{progressInfo.progressPercent}%</span>
                  <p className="text-sm font-bold text-muted-foreground mt-1">Completed modules: {progressInfo.completedModules}/{progressInfo.totalModules}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 dark:border-zinc-800/50 flex items-center text-xs font-semibold text-muted-foreground">
                <span>{progressInfo.remainingTopics} topics remaining.</span>
              </div>
            </div>

            {/* Upcoming Tasks Card */}
            <div className="bg-card border border-border/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/20 transition-all duration-300 relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">Upcoming Tasks</span>
                  <div className="text-primary/70 bg-primary/5 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div>
                  <span className="text-4xl font-extrabold tracking-tight">{upcomingInfo.count}</span>
                  <p className="text-sm font-bold text-muted-foreground mt-1">{upcomingInfo.subtext}</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50 dark:border-zinc-800/50 flex items-center text-xs font-semibold text-muted-foreground line-clamp-1">
                <span>{upcomingInfo.footerText}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline Section */}
          <div className="bg-card border border-border/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold">My Activity Timeline</h3>
              <p className="text-sm text-muted-foreground">A quick view of your recent course engagements.</p>
            </div>

            {timelineActivities.length > 0 ? (
              <div className="relative border-l border-border dark:border-zinc-800 pl-6 ml-3 space-y-6 py-2">
                {timelineActivities.map((act) => (
                  <div key={act.id} className="relative flex gap-4 items-start">
                    {/* timeline bullet */}
                    <div className="absolute -left-[31px] bg-background border border-border dark:border-zinc-850 w-5 h-5 rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-foreground/90">{act.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(act.date)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{act.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
                <Activity className="w-8 h-8 text-muted-foreground/35" />
                <p>No recent activity. Get started with the course syllabus!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Syllabus (Course Curriculum) */}
        <TabsContent value="syllabus" className="outline-none">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Syllabus Curriculum
            </h2>
            
            {modules && modules.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {modules.map((mod: any) => (
                  <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl bg-card shadow-sm px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 text-left gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">Module {mod.sequence_order}</span>
                            {mod.course_level && <Badge variant="outline">{mod.course_level}</Badge>}
                          </div>
                          <h3 className="text-lg font-semibold">{mod.title}</h3>
                          {mod.description && <p className="text-sm text-muted-foreground line-clamp-1">{mod.description}</p>}
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {mod.items?.length || 0} Content Items
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-6 border-t mt-2">
                      <div className="space-y-4">
                        {mod.items?.sort((a:any, b:any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()).map((item: any) => (
                          <div key={item.id} className="p-4 rounded-lg bg-muted/30 border space-y-3 relative group">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  {item.item_type === 'topic' ? (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20"><BookOpen className="w-3 h-3 mr-1"/> Topic</Badge>
                                  ) : item.item_type === 'test' ? (
                                    <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20"><FileQuestion className="w-3 h-3 mr-1"/> Test</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-500 hover:bg-amber-500/20"><Video className="w-3 h-3 mr-1"/> Live Class</Badge>
                                  )}
                                  
                                  {item.metadata?.exam_allocation_2026 && (
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border px-2 py-0.5 rounded">
                                      {item.metadata.exam_allocation_2026}
                                   </span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-base">{item.title}</h4>
                              </div>
                              
                              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
                                <div className="flex flex-row sm:flex-col gap-3 sm:gap-1 text-xs text-muted-foreground whitespace-nowrap bg-background p-2 rounded-md border sm:border-0 sm:bg-transparent sm:p-0">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(item.start_date).toLocaleDateString()}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {item.duration_minutes} mins
                                  </div>
                                </div>
                                {item.item_type === 'test' && (
                                    <Link 
                                      href={`/student/quiz?topicId=${item.id}`}
                                      className="inline-flex items-center justify-center shrink-0 h-8 px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
                                    >
                                      Start Test
                                    </Link>
                                )}
                              </div>
                            </div>

                            {/* Key Objectives */}
                            {item.metadata?.key_questions && item.metadata.key_questions.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Objectives</p>
                                <ul className="grid gap-1 pl-4 list-disc text-sm text-foreground/80">
                                  {item.metadata.key_questions.map((q: string, i: number) => (
                                    <li key={i}>{q}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Assignments */}
                            {item.assignments && item.assignments.length > 0 && (
                              <div className="space-y-2 pt-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assignments</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {item.assignments.map((assignment: any) => {
                                    const sub = submissionMap.get(assignment.id);
                                    const status = sub ? (sub.status === 'graded' ? 'marked' : 'pending_review') : 'not_submitted';
                                    const grade = sub?.overall_grade || '';

                                    let statusBadge = null;
                                    if (status === 'pending_review') {
                                      statusBadge = <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-500" title="Pending Review" /></div>;
                                    } else if (status === 'marked') {
                                      statusBadge = <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-green-500" title="Marked" /></div>;
                                    }

                                    let buttonClass = "";
                                    let buttonText = "";
                                    if (status === 'not_submitted') {
                                      buttonClass = "border-primary text-primary hover:bg-primary/10";
                                      buttonText = "Submit";
                                    } else if (status === 'pending_review') {
                                      buttonClass = "border-amber-500/30 text-amber-600 bg-amber-500/10";
                                      buttonText = "Pending Review";
                                    } else if (status === 'marked') {
                                      buttonClass = "border-green-500 text-green-600 hover:bg-green-50";
                                      buttonText = grade ? `Grade: [${grade}]` : "View Grade";
                                    }

                                    return (
                                      <Link href={`/student/assignments/${assignment.id}`} key={assignment.id} className="group/assign flex items-center justify-between gap-2 p-3 rounded-md bg-background border hover:border-primary/50 transition-colors">
                                        <div className="flex items-start gap-2">
                                          <div className="mt-0.5 shrink-0">
                                            {statusBadge || <FileText className="w-4 h-4 text-primary shrink-0" />}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium group-hover/assign:text-primary transition-colors">#{assignment.assignment_number}: {assignment.title}</p>
                                            {assignment.description && <p className="text-xs text-muted-foreground line-clamp-1">{assignment.description}</p>}
                                          </div>
                                        </div>
                                        <div className={`shrink-0 flex items-center justify-center h-7 px-2 text-xs font-medium border rounded-md transition-colors ${buttonClass}`}>
                                          {buttonText}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {(!mod.items || mod.items.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">No content has been added to this module yet.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="py-12 text-center border border-dashed rounded-xl bg-muted/10">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-medium text-lg text-foreground/80">No Content Available Yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back later once the tutor's curriculum is approved.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 3: Resources */}
        <TabsContent value="resources" className="outline-none">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Subject Resources
              </h2>
              <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-full">{resources?.length || 0} Files</span>
            </div>

            {resources && resources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map((res) => (
                  <div key={res.id} className="bg-card border border-border/50 dark:border-zinc-800/80 rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">{res.format || 'pdf'}</Badge>
                        {res.size_mb && <span className="text-xs text-muted-foreground">{res.size_mb} MB</span>}
                      </div>
                      <h3 className="font-bold text-base line-clamp-1">{res.title}</h3>
                      {res.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{res.description}</p>}
                    </div>

                    <div className="mt-5 pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{new Date(res.created_at).toLocaleDateString()}</span>
                      <a 
                        href={res.file_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed rounded-xl bg-muted/10 space-y-3">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="font-semibold text-foreground/80">No Resources Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Tutor hasn't uploaded study materials yet.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Assignments */}
        <TabsContent value="assignments" className="outline-none">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Course Assignments
            </h2>

            {(allAssignments.length > 0 || approvedStudentDeadlines.length > 0) ? (
              <div className="grid grid-cols-1 gap-4">
                {/* Curriculum Assignments */}
                {allAssignments.map((assign) => {
                  const sub = submissionMap.get(assign.id);
                  const status = sub ? (sub.status === 'graded' ? 'marked' : 'pending_review') : 'not_submitted';
                  
                  let badgeColor = "bg-muted text-muted-foreground";
                  let statusText = "Not Submitted";
                  if (status === 'pending_review') {
                    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20";
                    statusText = "Pending Review";
                  } else if (status === 'marked') {
                    badgeColor = "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20";
                    statusText = `Graded [${sub?.overall_grade || ''}]`;
                  }

                  return (
                    <div key={assign.id} className="bg-card border border-border/50 dark:border-zinc-800/80 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded tracking-wide">Module {assign.moduleOrder}</span>
                          <Badge variant="outline" className={badgeColor}>{statusText}</Badge>
                        </div>
                        <h3 className="font-bold text-base">#{assign.assignment_number}: {assign.title}</h3>
                        {assign.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{assign.description}</p>}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
                        <span className="text-xs text-muted-foreground font-semibold sm:hidden">Task Action</span>
                        <Link 
                          href={`/student/assignments/${assign.id}`}
                          className="inline-flex items-center justify-center h-9 px-4 text-xs font-semibold border rounded-lg hover:bg-primary/10 text-primary border-primary transition-colors shrink-0"
                        >
                          {status === 'not_submitted' ? 'Submit Assignment' : 'View Submission'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {/* Direct Student Deadlines / Assignments */}
                {approvedStudentDeadlines.map((dl) => {
                  let badgeColor = "bg-muted text-muted-foreground";
                  let statusText = "Pending";
                  if (dl.status === 'completed') {
                    badgeColor = "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20";
                    statusText = "Completed";
                  } else if (dl.status === 'pending') {
                    badgeColor = "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20";
                    statusText = "Pending";
                  }

                  return (
                    <div key={dl.id} className="bg-card border border-border/50 dark:border-zinc-800/80 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded tracking-wide">Direct Assignment</span>
                          <Badge variant="outline" className={badgeColor}>{statusText}</Badge>
                        </div>
                        <h3 className="font-bold text-base">{dl.title}</h3>
                        {dl.description && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{dl.description}</p>}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30 text-xs text-muted-foreground font-semibold">
                        <span>Due: {new Date(dl.due_date).toLocaleDateString()}</span>
                        <Link 
                          href={`/student/assignments/${dl.id}`}
                          className="inline-flex items-center justify-center h-9 px-4 text-xs font-semibold border rounded-lg hover:bg-primary/10 text-primary border-primary transition-colors shrink-0"
                        >
                          {dl.status === 'completed' ? 'View Submission' : 'Submit Assignment'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed rounded-xl bg-muted/10 space-y-3">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="font-semibold text-foreground/80">No Assignments Programmed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Stay tuned as your syllabus updates with coursework assignments.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 5: Discussions */}
        <TabsContent value="discussions" className="outline-none">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Forums & Discussions
              </h2>
              
              <Link 
                href="/student/community"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Go to Forums
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {forumPosts && forumPosts.length > 0 ? (
              <div className="space-y-4">
                {forumPosts.map((post) => (
                  <div key={post.id} className="bg-card border border-border/50 dark:border-zinc-800/80 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                          {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} alt={post.profiles.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-primary">{post.profiles?.full_name?.[0] || 'A'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground/90">{post.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[9px] px-2 py-0.5">{post.tag || 'Discussion'}</Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base leading-snug">{post.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{post.content}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-2 border-t border-border/30">
                      <span>{post.votes || 0} Votes</span>
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed rounded-xl bg-muted/10 space-y-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div className="space-y-1">
                  <p className="font-semibold text-foreground/80">No forum threads yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Be the first to create a forum topic under the student community channel!</p>
                </div>
                <Link 
                  href="/student/community"
                  className="inline-flex items-center justify-center h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Create Discussion Post
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 6: Quizzes */}
        <TabsContent value="quizzes" className="outline-none">
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-primary" />
              Quizzes & Tests
            </h2>

            {allQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allQuizzes.map((quiz) => {
                  const completion = completions?.find(c => c.item_id === quiz.id);
                  const isDone = completion?.is_done;
                  
                  return (
                    <div key={quiz.id} className="bg-card border border-border/50 dark:border-zinc-800/80 rounded-xl p-5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase border px-2 py-0.5 rounded tracking-wide">{quiz.moduleTitle}</span>
                          <Badge variant="outline" className={isDone ? "bg-green-500/10 text-green-600 dark:text-green-500 border border-green-500/20" : "bg-muted text-muted-foreground"}>
                            {isDone ? `Score: ${completion?.score_achieved ?? '100'}%` : 'Not Started'}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-base">{quiz.title}</h3>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{quiz.duration_minutes} mins</div>
                          {quiz.metadata?.exam_allocation_2026 && <div className="text-xs uppercase tracking-wide font-semibold text-primary">{quiz.metadata.exam_allocation_2026}</div>}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-border/30 flex justify-end">
                        <Link 
                          href={`/student/quiz?topicId=${quiz.id}`}
                          className="inline-flex items-center justify-center h-8 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                        >
                          {isDone ? 'Retake Test' : 'Start Test'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed rounded-xl bg-muted/10 space-y-3">
                <FileQuestion className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="font-semibold text-foreground/80">No Quizzes Scheduled</p>
                  <p className="text-xs text-muted-foreground mt-0.5">There are no quizzes scheduled for this curriculum module yet.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
