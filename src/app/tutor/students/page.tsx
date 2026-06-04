'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { SchoolHeader } from '@/components/app/school-header';
import { 
  getTutorStudents, 
  getChatMessages, 
  sendChatMessage, 
  getStudentDeadlines, 
  createStudentDeadline, 
  toggleDeadlineStatus, 
  deleteDeadline 
} from '@/app/actions/student-tutor';
import { getSubjectAssignments, getSubjectTopics } from '@/app/actions/student-assignments';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, MessageSquare, Calendar, Trash2, Send, Check, 
  User, Plus, Loader2, CalendarClock, AlertCircle, FileText, CheckCircle2, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Types
interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Subject {
  id: string;
  name: string;
  level: string;
}

interface StudentGrouped {
  student: StudentProfile;
  subjects: Subject[];
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface Deadline {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: string; // 'pending', 'completed'
  subjects?: {
    name: string;
    level: string;
  };
}

export default function TutorStudentsPage() {
  const { profile } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentGrouped[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Detail tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [useChatFallback, setUseChatFallback] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deadlines state
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [deadlinesLoading, setDeadlinesLoading] = useState(false);
  const [useDeadlineFallback, setUseDeadlineFallback] = useState(false);
  
  // New deadline form state
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineDesc, setNewDeadlineDesc] = useState('');
  const [newDeadlineSubjectId, setNewDeadlineSubjectId] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [submittingDeadline, setSubmittingDeadline] = useState(false);

  // Pending assignments state
  const [isPendingAssignmentsOpen, setIsPendingAssignmentsOpen] = useState(false);
  const [pendingAssignmentsSubject, setPendingAssignmentsSubject] = useState<Subject | null>(null);
  const [pendingAssignmentsLoading, setPendingAssignmentsLoading] = useState(false);
  const [pendingAssignmentsList, setPendingAssignmentsList] = useState<any[]>([]);

  const tutorId = profile?.id || '';

  // 1. Fetch Students assigned to tutor
  useEffect(() => {
    async function loadStudents() {
      if (!tutorId) return;
      setLoading(true);
      const res = await getTutorStudents(tutorId);
      
      if (res.error) {
        toast({
          title: 'Error loading students',
          description: res.error,
          variant: 'destructive'
        });
      } else if (res.data) {
        // Group by student ID since they can be enrolled in multiple subjects
        const groups: Record<string, StudentGrouped> = {};
        res.data.forEach((item: any) => {
          const s = item.profiles;
          const sub = item.subjects;
          if (!s || !sub) return;

          if (!groups[s.id]) {
            groups[s.id] = {
              student: {
                id: s.id,
                full_name: s.full_name,
                email: s.email,
                avatar_url: s.avatar_url
              },
              subjects: []
            };
          }
          // Avoid duplicate subjects
          if (!groups[s.id].subjects.some(subj => subj.id === sub.id)) {
            groups[s.id].subjects.push({
              id: sub.id,
              name: sub.name,
              level: sub.level
            });
          }
        });
        setStudents(Object.values(groups));
      }
      setLoading(false);
    }
    loadStudents();
  }, [tutorId, toast]);

  const selectedGroup = useMemo(() => {
    return students.find(s => s.student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // 2. Fetch Chat History when student changes or Messages tab opens
  useEffect(() => {
    if (!selectedStudentId || !tutorId || activeTab !== 'messages') return;

    async function loadChat() {
      setChatLoading(true);
      const res = await getChatMessages(tutorId, selectedStudentId!);
      
      if (res.error) {
        // Fallback to localStorage if tables are not found
        console.warn('Database chat fetch failed, falling back to localStorage. Error:', res.error);
        setUseChatFallback(true);
        const stored = localStorage.getItem(`drmax_chat_${tutorId}_${selectedStudentId}`);
        if (stored) {
          try {
            setMessages(JSON.parse(stored));
          } catch {
            setMessages([]);
          }
        } else {
          setMessages([]);
        }
      } else if (res.data) {
        setUseChatFallback(false);
        setMessages(res.data);
      }
      setChatLoading(false);
    }

    loadChat();
  }, [selectedStudentId, tutorId, activeTab]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Fetch Deadlines when student changes or Deadlines tab opens
  useEffect(() => {
    if (!selectedStudentId || !tutorId || activeTab !== 'deadlines') return;

    async function loadDeadlines() {
      setDeadlinesLoading(true);
      const res = await getStudentDeadlines(tutorId, selectedStudentId!);

      if (res.error) {
        console.warn('Database deadlines fetch failed, falling back to localStorage. Error:', res.error);
        setUseDeadlineFallback(true);
        const stored = localStorage.getItem(`drmax_deadlines_${tutorId}_${selectedStudentId}`);
        if (stored) {
          try {
            setDeadlines(JSON.parse(stored));
          } catch {
            setDeadlines([]);
          }
        } else {
          setDeadlines([]);
        }
      } else if (res.data) {
        setUseDeadlineFallback(false);
        setDeadlines(res.data as Deadline[]);
      }
      setDeadlinesLoading(false);
    }

    loadDeadlines();
  }, [selectedStudentId, tutorId, activeTab]);

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudentId || !tutorId) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    if (useChatFallback) {
      // Local Storage Fallback
      const newMsg: Message = {
        id: crypto.randomUUID(),
        sender_id: tutorId,
        receiver_id: selectedStudentId,
        message: msgText,
        created_at: new Date().toISOString()
      };
      const updated = [...messages, newMsg];
      setMessages(updated);
      localStorage.setItem(`drmax_chat_${tutorId}_${selectedStudentId}`, JSON.stringify(updated));
    } else {
      // Supabase
      const res = await sendChatMessage(tutorId, selectedStudentId, msgText);
      if (res.error) {
        toast({
          title: 'Failed to send message',
          description: res.error,
          variant: 'destructive'
        });
      } else if (res.data) {
        setMessages(prev => [...prev, res.data]);
      }
    }
  };

  // 5. Create Deadline
  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeadlineTitle.trim() || !newDeadlineSubjectId || !newDeadlineDate || !selectedStudentId || !tutorId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setSubmittingDeadline(true);
    const subject = selectedGroup?.subjects.find(s => s.id === newDeadlineSubjectId);
    const subjectName = subject?.name || 'Unknown';
    const subjectLevel = subject?.level || 'O-Level';

    if (useDeadlineFallback) {
      const newDl: Deadline = {
        id: crypto.randomUUID(),
        tutor_id: tutorId,
        student_id: selectedStudentId,
        subject_id: newDeadlineSubjectId,
        title: newDeadlineTitle,
        description: newDeadlineDesc,
        due_date: new Date(newDeadlineDate).toISOString(),
        status: 'pending',
        subjects: {
          name: subjectName,
          level: subjectLevel
        }
      };
      const updated = [...deadlines, newDl];
      setDeadlines(updated);
      localStorage.setItem(`drmax_deadlines_${tutorId}_${selectedStudentId}`, JSON.stringify(updated));
      toast({ title: 'Deadline Set', description: 'Task assigned successfully (Local Storage).' });
      resetDeadlineForm();
    } else {
      const res = await createStudentDeadline(
        tutorId,
        selectedStudentId,
        newDeadlineSubjectId,
        newDeadlineTitle,
        newDeadlineDesc,
        new Date(newDeadlineDate).toISOString()
      );

      if (res.error) {
        toast({
          title: 'Failed to create deadline',
          description: res.error,
          variant: 'destructive'
        });
      } else if (res.data) {
        setDeadlines(prev => [...prev, res.data as Deadline]);
        toast({ title: 'Deadline Set', description: 'Task assigned successfully to the database.' });
        resetDeadlineForm();
      }
    }
    setSubmittingDeadline(false);
  };

  const resetDeadlineForm = () => {
    setNewDeadlineTitle('');
    setNewDeadlineDesc('');
    setNewDeadlineSubjectId('');
    setNewDeadlineDate('');
    setIsDeadlineDialogOpen(false);
  };

  // 6. Toggle Deadline Status
  const handleToggleDeadline = async (deadline: Deadline) => {
    const nextStatus = deadline.status === 'completed' ? 'pending' : 'completed';

    if (useDeadlineFallback) {
      const updated = deadlines.map(d => d.id === deadline.id ? { ...d, status: nextStatus } : d);
      setDeadlines(updated);
      localStorage.setItem(`drmax_deadlines_${tutorId}_${selectedStudentId}`, JSON.stringify(updated));
    } else {
      const res = await toggleDeadlineStatus(deadline.id, nextStatus);
      if (res.error) {
        toast({
          title: 'Error updating status',
          description: res.error,
          variant: 'destructive'
        });
      } else if (res.data) {
        setDeadlines(prev => prev.map(d => d.id === deadline.id ? { ...d, status: nextStatus } : d));
      }
    }
  };

  // 7. Delete Deadline
  const handleDeleteDeadline = async (id: string) => {
    if (useDeadlineFallback) {
      const updated = deadlines.filter(d => d.id !== id);
      setDeadlines(updated);
      localStorage.setItem(`drmax_deadlines_${tutorId}_${selectedStudentId}`, JSON.stringify(updated));
      toast({ title: 'Deleted', description: 'Deadline removed.' });
    } else {
      const res = await deleteDeadline(id);
      if (res.error) {
        toast({
          title: 'Error deleting deadline',
          description: res.error,
          variant: 'destructive'
        });
      } else {
        setDeadlines(prev => prev.filter(d => d.id !== id));
        toast({ title: 'Deleted', description: 'Deadline removed.' });
      }
    }
  };

  const handleSubjectClick = async (subject: Subject) => {
    if (!selectedStudentId) return;
    setPendingAssignmentsSubject(subject);
    setIsPendingAssignmentsOpen(true);
    setPendingAssignmentsLoading(true);

    try {
      const topicsRes = await getSubjectTopics(subject.id);
      let topics = topicsRes.data || [];

      if (topics.length === 0) {
        topics = [
          { id: 'fallback-topic-1', title: 'France, 1774–1814', sequence_order: 1, module_id: 'fallback-module' },
          { id: 'fallback-topic-2', title: 'The Industrial Revolution in Britain, 1750–1850', sequence_order: 2, module_id: 'fallback-module' },
          { id: 'fallback-topic-3', title: 'Liberalism and nationalism in Germany, 1815–71', sequence_order: 3, module_id: 'fallback-module' },
          { id: 'fallback-topic-4', title: 'The Russian Revolution, 1894–1921', sequence_order: 4, module_id: 'fallback-module' }
        ];
      }

      let submissions: any[] = [];
      const subRes = await getSubjectAssignments(subject.id, selectedStudentId);
      if (subRes.data) {
        submissions = subRes.data;
      } else {
        const stored = localStorage.getItem(`drmax_submissions_${selectedStudentId}_${subject.id}`);
        if (stored) {
          try {
            submissions = JSON.parse(stored);
          } catch {
            submissions = [];
          }
        }
      }

      const pending: any[] = [];
      topics.forEach((topic: any) => {
        for (let num = 1; num <= 4; num++) {
          const existing = submissions.find(
            s => s.module_item_id === topic.id && s.assignment_number === num
          );
          
          if (!existing || existing.status === 'not_started') {
            pending.push({
              topicId: topic.id,
              topicTitle: topic.title,
              assignmentNum: num,
              status: 'not_started'
            });
          }
        }
      });

      setPendingAssignmentsList(pending);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error loading assignments',
        description: 'Could not load pending assignments list.',
        variant: 'destructive'
      });
    } finally {
      setPendingAssignmentsLoading(false);
    }
  };

  const handleRemindShortcut = (item: any) => {
    if (!pendingAssignmentsSubject) return;
    
    setIsPendingAssignmentsOpen(false);
    
    setNewDeadlineTitle(`Submit ${pendingAssignmentsSubject.name} - ${item.topicTitle} (Assignment ${item.assignmentNum})`);
    setNewDeadlineSubjectId(pendingAssignmentsSubject.id);
    setNewDeadlineDesc(`Reminder for ${selectedGroup?.student.full_name} to submit Assignment ${item.assignmentNum} for topic: "${item.topicTitle}".`);
    
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    const formattedDate = threeDaysLater.toISOString().slice(0, 16);
    setNewDeadlineDate(formattedDate);
    
    setActiveTab('deadlines');
    setIsDeadlineDialogOpen(true);
  };

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.toLowerCase();
      return s.student.full_name.toLowerCase().includes(q) ||
             s.student.email.toLowerCase().includes(q) ||
             s.subjects.some(sub => sub.name.toLowerCase().includes(q));
    });
  }, [students, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <SchoolHeader />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Students
          </h1>
          <p className="text-muted-foreground">Manage tasks, set deadlines, and track communications with your students.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <Card className="flex-1 flex flex-col items-center justify-center p-12 text-center border-dashed">
          <User className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold">No Students Assigned</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            You do not have any students assigned to your subjects yet. When an administrator maps students to your roster, they will appear here.
          </p>
        </Card>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
          
          {/* 1. Left Student List Panel */}
          <div className="md:col-span-1 flex flex-col gap-4 border rounded-xl bg-card/50 p-4 min-h-0 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students or subjects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-white/10"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              <AnimatePresence initial={false}>
                {filteredStudents.map(({ student, subjects }) => {
                  const selected = student.id === selectedStudentId;
                  const initials = student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                  return (
                    <motion.div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudentId(student.id);
                        setActiveTab('overview');
                      }}
                      className={`p-3 rounded-lg flex items-center gap-3 cursor-pointer border transition-all duration-300 ${
                        selected 
                          ? 'bg-primary/10 border-primary shadow-sm shadow-primary/10' 
                          : 'bg-background/20 border-white/5 hover:bg-background/40 hover:border-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={student.avatar_url} alt={student.full_name} />
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-white/95">{student.full_name}</h4>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {subjects.map(s => (
                            <Badge key={s.id} variant="secondary" className="text-[10px] px-1.5 py-0 bg-background/40 text-white/70 border border-white/5">
                              {s.name} ({s.level})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* 2. Right Student Detail Panel */}
          <div className="md:col-span-2 flex flex-col border rounded-xl bg-card/30 overflow-hidden">
            {selectedGroup ? (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* Detail Header */}
                <div className="p-6 border-b bg-card/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={selectedGroup.student.avatar_url} alt={selectedGroup.student.full_name} />
                      <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                        {selectedGroup.student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold text-white/95">{selectedGroup.student.full_name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedGroup.student.email}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
                  <div className="px-6 border-b bg-card/20">
                    <TabsList className="bg-background/40 h-10 p-0.5 border border-white/5 rounded-lg my-2">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md text-xs font-semibold px-4">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="messages" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md text-xs font-semibold px-4">
                        Chat Tracking
                      </TabsTrigger>
                      <TabsTrigger value="deadlines" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-md text-xs font-semibold px-4">
                        Deadlines
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* TAB 1: OVERVIEW */}
                  <TabsContent value="overview" className="flex-grow overflow-y-auto p-6 space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="bg-background/25 border-white/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-white/80">Enrolled Subjects</CardTitle>
                          <CardDescription>Subjects this student takes with you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedGroup.subjects.map(s => (
                            <div 
                              key={s.id} 
                              onClick={() => handleSubjectClick(s)}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-background/30 border border-white/5 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-200 group"
                              title="Click to view pending assignments"
                            >
                              <span className="font-medium text-sm text-white/90 group-hover:text-primary transition-colors">{s.name}</span>
                              <Badge variant="outline" className="text-xs border-white/15 text-white/60 group-hover:border-primary/30 group-hover:text-primary/80">{s.level}</Badge>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card className="bg-background/25 border-white/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-white/80">Platform Stats</CardTitle>
                          <CardDescription>Tracking milestones</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-center">
                          <div className="bg-background/30 border border-white/5 p-3 rounded-lg">
                            <span className="text-xs text-muted-foreground block">Progress Mean</span>
                            <span className="text-2xl font-bold text-primary mt-1 block">84%</span>
                          </div>
                          <div className="bg-background/30 border border-white/5 p-3 rounded-lg">
                            <span className="text-xs text-muted-foreground block">Completed Tasks</span>
                            <span className="text-2xl font-bold text-green-500 mt-1 block">9 / 11</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-background/25 border-white/5">
                      <CardHeader>
                        <CardTitle className="text-base text-white/90">Tutor Notes</CardTitle>
                        <CardDescription>Keep track of private observations regarding learning path</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          placeholder="Write feedback notes here (auto-saved locally)..."
                          className="bg-background/45 border-white/10 text-white/90 text-sm h-32 focus:border-primary/50"
                          defaultValue={localStorage.getItem(`drmax_notes_${tutorId}_${selectedGroup.student.id}`) || ''}
                          onChange={e => localStorage.setItem(`drmax_notes_${tutorId}_${selectedGroup.student.id}`, e.target.value)}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TAB 2: CHAT MESSAGES */}
                  <TabsContent value="messages" className="flex-grow flex flex-col min-h-0 focus-visible:outline-none">
                    
                    {useChatFallback && (
                      <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Supabase database message tables are not setup. Chatting is running in <b>Local Mode</b> (saved locally in your browser).</span>
                      </div>
                    )}

                    {chatLoading ? (
                      <div className="flex-grow flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                          {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                              <MessageSquare className="h-12 w-12 opacity-20 mb-2" />
                              <p className="text-sm">Start a conversation with {selectedGroup.student.full_name}</p>
                            </div>
                          ) : (
                            messages.map(msg => {
                              const isMe = msg.sender_id === tutorId;
                              return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                    isMe 
                                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                      : 'bg-muted text-foreground rounded-tl-none border border-white/5'
                                  }`}>
                                    <p className="leading-relaxed">{msg.message}</p>
                                    <span className="text-[10px] opacity-75 mt-1 block text-right">
                                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Input bar */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t bg-card/30 flex gap-2">
                          <Input
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="bg-background/60 border-white/10 text-white/95"
                          />
                          <Button type="submit" size="icon" className="bg-royal hover:bg-royal/80 text-black">
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </>
                    )}
                  </TabsContent>

                  {/* TAB 3: DEADLINES */}
                  <TabsContent value="deadlines" className="flex-grow flex flex-col min-h-0 focus-visible:outline-none p-6 space-y-4">
                    
                    {useDeadlineFallback && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Supabase database deadline tables are not setup. Task manager is running in <b>Local Mode</b> (saved locally).</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white/90">Student Task Deadlines</h3>
                        <p className="text-xs text-muted-foreground">Assign work to complete before the specified due date.</p>
                      </div>
                      
                      {/* Set Deadline Dialog */}
                      <Dialog open={isDeadlineDialogOpen} onOpenChange={setIsDeadlineDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-royal hover:bg-royal/80 text-black font-bold">
                            <Plus className="w-4 h-4 mr-1" />
                            Set Deadline
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <form onSubmit={handleCreateDeadline}>
                            <DialogHeader>
                              <DialogTitle>Assign Task & Set Deadline</DialogTitle>
                              <DialogDescription>Assign a learning module or homework task with a due date.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">Task Title *</label>
                                <Input 
                                  placeholder="e.g. Read Modern Europe Chapter 3" 
                                  value={newDeadlineTitle} 
                                  onChange={e => setNewDeadlineTitle(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">Subject Context *</label>
                                <Select value={newDeadlineSubjectId} onValueChange={setNewDeadlineSubjectId} required>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedGroup.subjects.map(s => (
                                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.level})</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">Description / Instruction</label>
                                <Textarea 
                                  placeholder="Provide instructions on what is expected..." 
                                  value={newDeadlineDesc}
                                  onChange={e => setNewDeadlineDesc(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-semibold">Due Date & Time *</label>
                                <Input 
                                  type="datetime-local" 
                                  value={newDeadlineDate} 
                                  onChange={e => setNewDeadlineDate(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="outline" onClick={resetDeadlineForm}>Cancel</Button>
                              <Button type="submit" disabled={submittingDeadline} className="bg-royal hover:bg-royal/80 text-black font-bold">
                                {submittingDeadline && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Assign Task
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {deadlinesLoading ? (
                      <div className="flex-grow flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="flex-grow overflow-y-auto space-y-3">
                        {deadlines.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl py-12">
                            <CalendarClock className="h-10 w-10 opacity-20 mb-2" />
                            <p className="text-sm">No deadlines set for this student yet.</p>
                          </div>
                        ) : (
                          deadlines.map(deadline => {
                            const completed = deadline.status === 'completed';
                            const isOverdue = new Date(deadline.due_date) < new Date() && !completed;
                            return (
                              <div 
                                key={deadline.id} 
                                className={`p-4 rounded-xl flex items-start gap-4 border transition-all ${
                                  completed 
                                    ? 'bg-green-500/5 border-green-500/10 opacity-70' 
                                    : isOverdue
                                    ? 'bg-burgundy/5 border-burgundy/10'
                                    : 'bg-background/30 border-white/5 hover:border-white/10'
                                }`}
                              >
                                <button 
                                  onClick={() => handleToggleDeadline(deadline)}
                                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    completed 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-white/20 hover:border-white/40 bg-background/50'
                                  }`}
                                >
                                  {completed && <Check className="w-3.5 h-3.5" />}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-semibold text-sm ${completed ? 'line-through text-white/50' : 'text-white/90'}`}>
                                      {deadline.title}
                                    </h4>
                                    <Badge variant="secondary" className="text-[10px] bg-background/50 border border-white/5">
                                      {deadline.subjects?.name || 'Subject'}
                                    </Badge>
                                    <Badge className={`text-[10px] ${
                                      completed 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' 
                                        : isOverdue 
                                        ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 animate-pulse'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'
                                    }`}>
                                      {completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                                    </Badge>
                                  </div>
                                  
                                  {deadline.description && (
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                      {deadline.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-2">
                                    <Calendar className="w-3.5 h-3.5 text-primary" />
                                    <span>Due: {new Date(deadline.due_date).toLocaleString()}</span>
                                  </div>
                                </div>

                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-burgundy hover:bg-burgundy/10 h-8 w-8"
                                  onClick={() => handleDeleteDeadline(deadline.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Users className="h-16 w-16 opacity-10 mb-3" />
                <h3 className="text-lg font-medium text-white/70">Select a Student</h3>
                <p className="text-sm max-w-sm mt-1">
                  Click on a student from the sidebar to view their profile, send messages, and set deadlines.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Pending Assignments Modal */}
      <Dialog open={isPendingAssignmentsOpen} onOpenChange={setIsPendingAssignmentsOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col border-white/10 bg-slate-900/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-xl">
              <FileText className="w-5 h-5 text-royal" />
              <span>Pending Assignments - {pendingAssignmentsSubject?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              View assignments not yet submitted by {selectedGroup?.student.full_name}. Set a deadline as a reminder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3">
            {pendingAssignmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingAssignmentsList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                <CheckCircle2 className="w-12 h-12 text-royal mx-auto mb-3" />
                <h4 className="font-semibold text-white">All Completed!</h4>
                <p className="text-sm text-slate-400 mt-1">This student has submitted all assignments for this subject.</p>
              </div>
            ) : (
              pendingAssignmentsList.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between gap-4 p-3 rounded-lg border border-white/5 bg-white/5 hover:border-royal/30 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-white/90">Assignment {item.assignmentNum}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">Topic: {item.topicTitle}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-royal/20 text-royal hover:bg-royal/10 hover:text-royal gap-1.5 whitespace-nowrap text-xs h-8"
                    onClick={() => handleRemindShortcut(item)}
                  >
                    <CalendarClock className="w-3.5 h-3.5" />
                    Remind / Set Deadline
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsPendingAssignmentsOpen(false)} className="border-white/10 hover:bg-white/10">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


