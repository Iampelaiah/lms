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
import { Textarea } from "@/components/ui/textarea";
import { getTutorUnmarkedAssignments, gradeAssignment } from "@/app/actions/student-assignments";

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

  const loadSubmissions = async () => {
    setLoading(true);
    let dbSubmissions: any[] = [];

    if (tutorId) {
      const res = await getTutorUnmarkedAssignments(tutorId);
      if (res.data) {
        dbSubmissions = res.data;
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
                if (sub.status === 'unmarked') {
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
    
    // Seed default mock submission if absolutely none exist
    if (merged.length === 0) {
      merged.push({
        id: 'mock-assignment-id-1',
        student_id: 'mock-student-id',
        subject_id: 'mock-subject-id',
        module_item_id: 'fallback-topic-1',
        assignment_number: 1,
        status: 'unmarked',
        student_submission: `France was on the brink of bankruptcy in 1789 due to its involvement in the American Revolutionary War and the extravagant spending of the royal court at Versailles. The tax system was regressive, exempting the nobility and clergy while placing the burden entirely on the Third Estate (peasants and bourgeoisie). This, coupled with poor harvests leading to high bread prices, triggered widespread famine and discontent, forcing King Louis XVI to summon the Estates-General.`,
        submitted_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        profiles: {
          full_name: 'Pelaiah Tadiwanashe Tapera Ngarande',
          email: 'student@pelaiah.com',
          avatar_url: ''
        },
        subjects: {
          name: 'History',
          level: 'A-Level'
        },
        module_items: {
          title: 'France, 1774–1814'
        },
        isLocal: true,
        isMock: true
      });
    }

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

  const openMarkingDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setFeedback(submission.tutor_feedback || '');
    setIsMarkingDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <SchoolHeader />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Assignments Hub
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
      ) : submissions.length === 0 ? (
        <Card className="border-dashed border-white/10 bg-card/25 py-16 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-[#00FFCC]/10 p-4 rounded-full text-[#00FFCC] animate-pulse">
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
            <CardDescription className="text-slate-400">
              You have {submissions.length} unmarked assignment{submissions.length === 1 ? '' : 's'} waiting for grading.
            </CardDescription>
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
                  {submissions.map((sub) => {
                    const initials = sub.profiles?.full_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2) || 'ST';
                    
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
                          {sub.subjects?.name} 
                          <span className="text-[10px] text-slate-500 ml-1.5">({sub.subjects?.level})</span>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm max-w-[200px] truncate">
                          {sub.module_items?.title}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[#00FFCC]/10 text-[#00FFCC] border-[#00FFCC]/20 hover:bg-[#00FFCC]/20">
                            Assignment {sub.assignment_number}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400 text-xs">
                          {new Date(sub.submitted_at).toLocaleDateString()} at{' '}
                          {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            onClick={() => openMarkingDialog(sub)}
                            className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-bold size-sm text-xs gap-1.5 h-8"
                          >
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

      {/* Grade Dialog */}
      <Dialog open={isMarkingDialogOpen} onOpenChange={setIsMarkingDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col border-white/10 bg-slate-900/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00FFCC]" />
              <span>Mark Student Submission</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Review submission from {selectedSubmission?.profiles?.full_name} and add your evaluation feedback.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <form onSubmit={handleGradeSubmit} className="flex-grow flex flex-col min-h-0 space-y-4 py-2">
              <div className="flex flex-wrap gap-2 text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                <div>
                  <span className="font-semibold text-[#00FFCC]">Subject:</span> {selectedSubmission.subjects?.name} ({selectedSubmission.subjects?.level})
                </div>
                <div className="border-l border-white/10 pl-2">
                  <span className="font-semibold text-[#00FFCC]">Topic:</span> {selectedSubmission.module_items?.title}
                </div>
                <div className="border-l border-white/10 pl-2">
                  <span className="font-semibold text-[#00FFCC]">Task:</span> Assignment {selectedSubmission.assignment_number}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Student's Submitted Work:</label>
                <div 
                  className="flex-1 bg-black/60 border border-white/10 rounded-lg p-4 text-sm text-slate-200 overflow-y-auto leading-relaxed max-h-[220px] prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedSubmission.student_submission || '' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Tutor Feedback & Evaluation *</label>
                <Textarea
                  placeholder="Provide constructive feedback, corrections, and grading comments..."
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  className="bg-background/60 border-white/10 text-white/90 text-sm h-32 focus:border-primary/50"
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsMarkingDialogOpen(false)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={gradingLoading}
                  className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-bold"
                >
                  {gradingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit Grade & Feedback
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
