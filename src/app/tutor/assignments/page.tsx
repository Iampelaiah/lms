'use client';

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, CheckCircle, Award, CalendarClock } from "lucide-react";
import { SchoolHeader } from "@/components/app/school-header";
import { useUser } from "@/components/providers/user-context";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getTutorUnmarkedAssignments, gradeAssignment } from "@/app/actions/student-assignments";
import { createClient } from "@/utils/supabase/client";
import GradingHeader from "@/components/TutorGrading/GradingHeader";
import LeftPanel from "@/components/TutorGrading/LeftPanel";
import RightPanel from "@/components/TutorGrading/RightPanel";
import GradingEditor from "@/components/TutorGrading/GradingEditor";

export default function TutorAssignmentsPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const tutorId = profile?.id || '';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Grading Dialog State
  const [isMarkingDialogOpen, setIsMarkingDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [feedback, setFeedback] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    let dbSubmissions: any[] = [];

    if (tutorId) {
      const supabase = createClient();
      const { data: dbData } = await supabase
        .from('student_assignments')
        .select('*, profiles(full_name, email, avatar_url), subjects(name, level), module_items(title)')
        .eq('tutor_id', tutorId)
        .order('submitted_at', { ascending: false });
        
      if (dbData) {
        dbSubmissions = dbData;
      }
    }

    // Local Storage Fallback
    const localSubmissions: any[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('drmax_submissions_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsedList = JSON.parse(stored);
            if (Array.isArray(parsedList)) {
              parsedList.forEach((sub: any) => {
                if (sub.status === 'unmarked' || sub.status === 'completed' || sub.status === 'graded') {
                  localSubmissions.push({
                    id: sub.id || `${sub.student_id}_${sub.module_item_id}_${sub.assignment_number}`,
                    student_id: sub.student_id,
                    subject_id: sub.subject_id,
                    module_item_id: sub.module_item_id,
                    assignment_number: sub.assignment_number,
                    status: sub.status,
                    student_submission: sub.student_submission,
                    submitted_at: sub.submitted_at,
                    profiles: {
                      full_name: sub.student_name || 'Pelaiah Tadiwanashe Tapera Ngarande',
                      email: 'student@pelaiah.com',
                      avatar_url: ''
                    },
                    subjects: {
                      name: sub.subject_name || 'History',
                      level: 'A-Level'
                    },
                    module_items: {
                      title: sub.topic_title || 'France, 1774–1814'
                    },
                    isLocal: true
                  });
                }
              });
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse local storage submissions:", e);
    }

    const merged = [...dbSubmissions, ...localSubmissions];
    


    const seen = new Set();
    const uniqueSubmissions = merged.filter((sub: any) => {
      const key = `${sub.student_id}_${sub.module_item_id}_${sub.assignment_number}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setSubmissions(uniqueSubmissions);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
  }, [tutorId]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !feedback.trim()) return;

    setGradingLoading(true);
    const sub = selectedSubmission;

    try {
      if (sub.isLocal) {
        const key = `drmax_submissions_${sub.student_id}_${sub.subject_id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((item: any) => {
            if (item.module_item_id === sub.module_item_id && item.assignment_number === sub.assignment_number) {
              return {
                ...item,
                status: 'completed',
                tutor_feedback: feedback,
                marked_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
            return item;
          });
          localStorage.setItem(key, JSON.stringify(updated));
        } else {
          const updated = [{
            id: sub.id,
            student_id: sub.student_id,
            subject_id: sub.subject_id,
            module_item_id: sub.module_item_id,
            assignment_number: sub.assignment_number,
            status: 'completed',
            student_submission: sub.student_submission,
            tutor_feedback: feedback,
            tutor_id: tutorId,
            submitted_at: sub.submitted_at,
            marked_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
          localStorage.setItem(key, JSON.stringify(updated));
        }

        toast({
          title: 'Assignment Marked',
          description: 'Feedback saved successfully (Local Mode).'
        });
      } else {
        const res = await gradeAssignment(sub.id, feedback);
        if (res.error) {
          toast({
            title: 'Grading failed',
            description: res.error,
            variant: 'destructive'
          });
          setGradingLoading(false);
          return;
        }

        toast({
          title: 'Assignment Marked',
          description: 'Feedback saved and assignment sent to student.'
        });
      }

      setIsMarkingDialogOpen(false);
      setFeedback('');
      setSelectedSubmission(null);
      setActiveAnnotationId(null);
      loadSubmissions();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error saving feedback',
        description: 'Something went wrong.',
        variant: 'destructive'
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const openMarkingDialog = async (submission: any) => {
    // Navigate to the new grading page. We pass the assignment ID.
    // In a real flow, you'd check if a submission exists in the `submissions` table first,
    // but for now we route to the new page.
    window.location.href = `/tutor/grading/${submission.id}`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <SchoolHeader />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Grading
          </h1>
          <p className="text-muted-foreground">Review, grade, and provide detailed feedback on student submissions.</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-white/5 bg-card/30">
          <CardContent className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="unmarked" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-lg">
            <TabsTrigger value="unmarked" className="rounded-md data-[state=active]:bg-royal data-[state=active]:text-black">Inbox ({submissions.filter((s:any) => s.status === 'unmarked').length})</TabsTrigger>
            <TabsTrigger value="marked" className="rounded-md data-[state=active]:bg-royal data-[state=active]:text-black">Marked ({submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unmarked" className="mt-6">
            {submissions.filter((s:any) => s.status === 'unmarked').length === 0 ? (
              <Card className="border-dashed border-white/10 bg-card/25 py-16 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="bg-royal/10 p-4 rounded-full text-royal animate-pulse">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold text-white/95">Inbox Clear!</h3>
                  <p className="text-slate-400 max-w-sm">No student assignments are currently waiting to be marked.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Inbox: Received Submissions</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="hover:bg-transparent border-white/10">
                          <TableHead className="text-slate-400">Student</TableHead>
                          <TableHead className="text-slate-400">Subject</TableHead>
                          <TableHead className="text-slate-400">Topic</TableHead>
                          <TableHead className="text-slate-400">Task</TableHead>
                          <TableHead className="text-slate-400">Submitted</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.filter((s:any) => s.status === 'unmarked').map((sub) => {
                          const initials = sub.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
                          return (
                            <TableRow key={sub.id} className="hover:bg-white/5 border-white/5">
                              <TableCell className="font-medium text-white/90">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-white/10">
                                    <AvatarImage src={sub.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{sub.profiles?.full_name}</span>
                                    <span className="text-[10px] text-slate-500">{sub.profiles?.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/80 font-medium text-sm">
                                {sub.subjects?.name} <span className="text-[10px] text-slate-500 ml-1.5">({sub.subjects?.level})</span>
                              </TableCell>
                              <TableCell className="text-slate-300 text-sm max-w-[200px] truncate">{sub.module_items?.title}</TableCell>
                              <TableCell>
                                <Badge className="bg-royal/10 text-royal border-royal/20 hover:bg-royal/20">Assignment {sub.assignment_number}</Badge>
                              </TableCell>
                              <TableCell className="text-slate-400 text-xs">
                                {new Date(sub.submitted_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button onClick={() => openMarkingDialog(sub)} className="bg-royal hover:bg-royal/80 text-black font-bold size-sm text-xs gap-1.5 h-8">
                                  <Award className="w-3.5 h-3.5" />
                                  Mark Assignment
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="marked" className="mt-6">
            {submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').length === 0 ? (
              <Card className="border-dashed border-white/10 bg-card/25 py-16 text-center">
                <CardContent className="flex flex-col items-center gap-4">
                  <p className="text-slate-400 max-w-sm">No marked assignments yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-white/5 bg-card/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Marked / Graded</CardTitle>
                </CardHeader>
                <CardContent className="!pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-white/10">
                        <TableRow className="hover:bg-transparent border-white/10">
                          <TableHead className="text-slate-400">Student</TableHead>
                          <TableHead className="text-slate-400">Subject</TableHead>
                          <TableHead className="text-slate-400">Topic</TableHead>
                          <TableHead className="text-slate-400">Task</TableHead>
                          <TableHead className="text-slate-400">Marked Date</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions.filter((s:any) => s.status === 'completed' || s.status === 'graded').map((sub) => {
                          const initials = sub.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
                          return (
                            <TableRow key={sub.id} className="hover:bg-white/5 border-white/5">
                              <TableCell className="font-medium text-white/90">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-white/10">
                                    <AvatarImage src={sub.profiles?.avatar_url} />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-sm">{sub.profiles?.full_name}</span>
                                    <span className="text-[10px] text-slate-500">{sub.profiles?.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/80 font-medium text-sm">
                                {sub.subjects?.name} <span className="text-[10px] text-slate-500 ml-1.5">({sub.subjects?.level})</span>
                              </TableCell>
                              <TableCell className="text-slate-300 text-sm max-w-[200px] truncate">{sub.module_items?.title}</TableCell>
                              <TableCell>
                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Assignment {sub.assignment_number}</Badge>
                              </TableCell>
                              <TableCell className="text-slate-400 text-xs">
                                {sub.marked_at ? new Date(sub.marked_at).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" onClick={() => openMarkingDialog(sub)} className="border-white/10 hover:bg-white/5 text-white/90 text-xs h-8">
                                  View Grade
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Grade Dialog has been moved to its own page route */}
    </div>
  );
}

