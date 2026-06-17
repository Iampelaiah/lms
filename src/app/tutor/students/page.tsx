'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '@/components/providers/user-context';
import { createClient } from '@/utils/supabase/client';
import { SchoolHeader } from '@/components/app/school-header';
import { 
  getTutorStudents, 
  getStudentDeadlines, 
  createStudentDeadline, 
  toggleDeadlineStatus, 
  deleteDeadline,
  getStudentProgress,
  getAllStudentsProgress
} from '@/app/actions/student-tutor';
import { getGlobalChatMessages, sendGlobalChatMessage } from '@/app/actions/chat';
import { getSubjectAssignments, getSubjectTopics } from '@/app/actions/student-assignments';
import { StudentProfileDashboard } from '@/components/StudentProfileDashboard';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, MessageSquare, Calendar, Trash2, Send, Check, 
  User, Plus, Loader2, CalendarClock, AlertCircle, FileText, CheckCircle2, Users
, ChevronDown, BookOpen, Clock, BarChart2, Paperclip, Smile, ClipboardList, Image, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Types
interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  curriculum_board?: string;
  student_level?: string;
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
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [useChatFallback, setUseChatFallback] = useState(false);
  const [isMessageSearchOpen, setIsMessageSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Deadlines state
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [deadlinesLoading, setDeadlinesLoading] = useState(false);
  const [useDeadlineFallback, setUseDeadlineFallback] = useState(false);
  
  // Progress state
  const [progressData, setProgressData] = useState<{total: number, completed: number, percent: number, trendPath: string, subjectProgress?: {name: string, percent: number}[]}>({ total: 0, completed: 0, percent: 0, trendPath: "M0,28 L100,28" });
  const [studentsProgressMap, setStudentsProgressMap] = useState<Record<string, {percent: number, trendPath: string}>>({});
  
  // Filter state
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  
  // New deadline form state
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [newDeadlineTitle, setNewDeadlineTitle] = useState('');
  const [newDeadlineDesc, setNewDeadlineDesc] = useState('');
  const [newDeadlineSubjectId, setNewDeadlineSubjectId] = useState('');
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [submittingDeadline, setSubmittingDeadline] = useState(false);

  // Rich direct assignment states
  const [newDeadlineImageUrl, setNewDeadlineImageUrl] = useState('');
  const [newDeadlinePastPaperTag, setNewDeadlinePastPaperTag] = useState('');
  const [newDeadlineTopicTag, setNewDeadlineTopicTag] = useState('');
  const [newDeadlineQuestions, setNewDeadlineQuestions] = useState<{ id: string; question_text: string; points: number; image_url?: string }[]>([]);
  const [uploadingDeadlineImage, setUploadingDeadlineImage] = useState(false);
  const [uploadingQuestionImage, setUploadingQuestionImage] = useState<Record<string, boolean>>({});

  const handleUploadBannerImage = async (file: File) => {
    setUploadingDeadlineImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `deadlines/banners/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('course-banners')
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('course-banners').getPublicUrl(fileName);
      if (data?.publicUrl) {
        setNewDeadlineImageUrl(data.publicUrl);
        toast({ title: 'Success', description: 'Banner uploaded successfully.' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingDeadlineImage(false);
    }
  };

  const handleUploadQuestionImage = async (file: File, qId: string) => {
    setUploadingQuestionImage(prev => ({ ...prev, [qId]: true }));
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `deadlines/questions/${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('course-banners')
        .upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('course-banners').getPublicUrl(fileName);
      if (data?.publicUrl) {
        setNewDeadlineQuestions(prev => prev.map(q => q.id === qId ? { ...q, image_url: data.publicUrl } : q));
        toast({ title: 'Success', description: 'Question diagram uploaded.' });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingQuestionImage(prev => ({ ...prev, [qId]: false }));
    }
  };

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
                avatar_url: s.avatar_url,
                curriculum_board: s.curriculum_board,
                student_level: s.student_level
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

  // Fetch all students' progress for the sidebar list
  useEffect(() => {
    if (!tutorId) return;
    async function loadAllProgress() {
      const res = await getAllStudentsProgress(tutorId);
      if (res.data) setStudentsProgressMap(res.data);
    }
    loadAllProgress();
  }, [tutorId, deadlines]);

  const selectedGroup = useMemo(() => {
    return students.find(s => s.student.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // 2. Fetch Chat History and setup Realtime subscription when student changes or Messages tab opens
  useEffect(() => {
    if (!selectedStudentId || !tutorId || activeTab !== 'messages') return;

    async function loadChat() {
      setChatLoading(true);
      const res = await getGlobalChatMessages(tutorId, selectedStudentId!);
      
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

    // Subscribe to new real-time messages
    const channel = supabase
      .channel(`chat_${tutorId}_${selectedStudentId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'global_messages'
      }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === tutorId && newMsg.receiver_id === selectedStudentId) ||
          (newMsg.sender_id === selectedStudentId && newMsg.receiver_id === tutorId)
        ) {
          setMessages(prev => {
            // Prevent duplicate messages if sent by the current user and optimistically added
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStudentId, tutorId, activeTab, supabase]);

  // Fetch progress whenever a student is selected or deadlines change
  useEffect(() => {
    if (!selectedStudentId || !tutorId) return;
    async function loadProgress() {
      const res = await getStudentProgress(tutorId, selectedStudentId!);
      if (res.data) setProgressData(res.data);
    }
    loadProgress();
  }, [selectedStudentId, tutorId, deadlines]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Fetch Deadlines when student changes
  useEffect(() => {
    if (!selectedStudentId || !tutorId) return;

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
  }, [selectedStudentId, tutorId]);

  // Compute recent activity based on deadlines
  const recentActivities = useMemo(() => {
    if (!deadlines || deadlines.length === 0) return [];
    const activities: { title: string, timestamp: number, type: 'assigned' | 'completed' }[] = [];
    
    deadlines.forEach(d => {
      if ((d as any).created_at) {
        activities.push({
          title: d.title,
          timestamp: new Date((d as any).created_at).getTime(),
          type: 'assigned'
        });
      }
      if (d.status === 'completed' && (d as any).updated_at) {
        activities.push({
          title: d.title,
          timestamp: new Date((d as any).updated_at).getTime(),
          type: 'completed'
        });
      }
    });
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);
  }, [deadlines]);

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudentId || !tutorId) return;

    const msgText = newMessage.trim();
    setNewMessage('');
    
    let fileUrl = '';
    let fileType = '';
    
    if (selectedFile) {
      setIsUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat_media')
        .upload(fileName, selectedFile);
        
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setIsUploading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('chat_media').getPublicUrl(fileName);
      fileUrl = publicUrlData.publicUrl;
      fileType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
      setSelectedFile(null);
      setIsUploading(false);
    }
    
    if (!msgText && !fileUrl) return;

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
      const res = await sendGlobalChatMessage(tutorId, selectedStudentId, msgText, fileUrl, fileType);
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

    const computedTotalPoints = newDeadlineQuestions.reduce((sum, q) => sum + q.points, 0);

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
        },
        image_url: newDeadlineImageUrl || undefined,
        past_paper_tag: newDeadlinePastPaperTag || undefined,
        topic_tag: newDeadlineTopicTag || undefined,
        total_points: computedTotalPoints,
        questions: newDeadlineQuestions
      } as any;
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
        new Date(newDeadlineDate).toISOString(),
        newDeadlineImageUrl || undefined,
        newDeadlinePastPaperTag || undefined,
        newDeadlineTopicTag || undefined,
        computedTotalPoints,
        newDeadlineQuestions
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
    setNewDeadlineImageUrl('');
    setNewDeadlinePastPaperTag('');
    setNewDeadlineTopicTag('');
    setNewDeadlineQuestions([]);
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

  // Extract unique subjects for the filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>();
    students.forEach(s => {
      s.subjects.forEach(sub => subjects.add(sub.name));
    });
    return Array.from(subjects).sort();
  }, [students]);

  // Filter students based on search and subject filter
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.student.full_name.toLowerCase().includes(q) ||
             s.student.email.toLowerCase().includes(q) ||
             s.subjects.some(sub => sub.name.toLowerCase().includes(q));
             
      const matchesSubject = subjectFilter === 'All Subjects' || s.subjects.some(sub => sub.name === subjectFilter);
      
      return matchesSearch && matchesSubject;
    });
  }, [students, searchQuery, subjectFilter]);

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => 
      msg.message && msg.message.toLowerCase().includes(messageSearchQuery.toLowerCase())
    );
  }, [messages, messageSearchQuery]);

  const handleExportChat = () => {
    if (!messages || messages.length === 0) {
      toast({ title: 'Export Failed', description: 'No messages to export.', variant: 'destructive' });
      return;
    }
    const chatText = messages.map(m => {
      const sender = m.sender_id === tutorId ? 'Me' : (selectedGroup?.student.full_name || 'Student');
      const date = new Date(m.created_at).toLocaleString();
      let text = `[${date}] ${sender}: ${m.message}`;
      if (m.file_url) text += ` (Attachment: ${m.file_url})`;
      return text;
    }).join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_export_${selectedGroup?.student.full_name.replace(/\s+/g, '_') || 'student'}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Chat Exported', description: 'The conversation has been downloaded.' });
  };

  return (
    <div id="students-page-container" className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden min-h-[calc(100vh-3.5rem)]">
      
      {/* 2. Middle Column ("My Students" List) and 3. Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left List Panel */}
        <section className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-background">
          <div className="p-4 pb-3">
            <h2 className="text-[#D4AF37] text-xl font-semibold mb-0.5">My Students</h2>
            <p className="text-xs text-muted-foreground mb-4">Manage tasks, track progress, and support your students.</p>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full bg-card border border-border rounded-xl py-2.5 px-4 text-sm text-muted-foreground hover:bg-muted transition-colors [&>svg]:ml-2 h-auto">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center font-bold">≡</span>
                  <SelectValue placeholder="All Subjects" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-muted-foreground">
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                {uniqueSubjects.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#D4AF37]" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">No students found</div>
            ) : (
              filteredStudents.map(({ student, subjects }) => {
                const isActive = student.id === selectedStudentId;
                const studentProg = studentsProgressMap[student.id];
                const progressPercent = studentProg?.percent || 0;
                const progressPath = studentProg?.trendPath || "M0,28 L100,28";
                
                return (
                  <StudentCard 
                    key={student.id}
                    name={student.full_name} 
                    level={student.student_level || subjects[0]?.level || "Student"}
                    board={student.curriculum_board}
                    progress={progressPercent.toString()}
                    path={progressPath}
                    active={isActive}
                    status="online"
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setActiveTab('messages');
                    }}
                  />
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-border">
            <button className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Users size={16} />
              View All Students
            </button>
          </div>
        </section>

        {/* Right Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-background p-4 overflow-hidden">
          
          {selectedGroup ? (
            <>
              {/* Top Header Card */}
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4 shrink-0">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img 
                      src={selectedGroup.student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedGroup.student.full_name}`} 
                      alt={selectedGroup.student.full_name} 
                      className="w-16 h-16 rounded-full bg-muted border-2 border-[#D4AF37] object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#0B0C10] rounded-full"></div>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground mb-1">{selectedGroup.student.full_name}</h1>
                    <p className="text-sm text-muted-foreground mb-3">{selectedGroup.student.email}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                        <BookOpen size={12} /> {selectedGroup.student.student_level || selectedGroup.subjects[0]?.level || "Student"}
                      </span>
                      {selectedGroup.student.curriculum_board && (
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2.5 py-1 rounded-md border border-[#D4AF37]/30 flex items-center gap-1.5 font-medium">
                          {selectedGroup.student.curriculum_board}
                        </span>
                      )}
                      <span className="bg-muted text-muted-foreground px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5">
                        <Clock size={12} /> Active Enrollment
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-4 min-w-[200px]">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Overall Progress</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-green-400">{progressData.percent}%</span>
                      {progressData.percent > 0 && <span className="text-green-400 text-sm flex items-center">↗</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{progressData.completed} of {progressData.total} tasks completed</p>
                  </div>
                  <div className="w-24 h-12 opacity-80">
                    <Sparkline 
                      color={progressData.percent >= 50 || progressData.total === 0 ? "#4ade80" : "#facc15"} 
                      path={progressData.trendPath} 
                    />
                  </div>
                </div>
              </div>


              {/* Lower Split Grid */}
              <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-4 min-h-0 overflow-hidden">
                
                {/* Left Side (Chat & Progress) */}
                <div className="xl:col-span-3 flex flex-col gap-4 min-h-0">
                  
                  {activeTab === 'messages' && (
                    <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl overflow-hidden min-h-0">
                      <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <MessageSquare size={18} className="text-muted-foreground" />
                          Chat with {selectedGroup.student.full_name.split(' ')[0]}
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Search 
                            size={18} 
                            className={`cursor-pointer hover:text-foreground ${isMessageSearchOpen ? 'text-[#D4AF37]' : ''}`}
                            onClick={() => {
                              setIsMessageSearchOpen(!isMessageSearchOpen);
                              if (isMessageSearchOpen) setMessageSearchQuery('');
                            }}
                          />
                          <Popover>
                            <PopoverTrigger asChild>
                              <span className="text-xl leading-none mb-1 cursor-pointer hover:text-foreground">⋮</span>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48 p-1 border-border bg-card shadow-lg rounded-xl">
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm hover:bg-muted/50 rounded-lg px-3 py-2 h-auto font-normal text-foreground" 
                                onClick={() => setActiveTab('overview')}
                              >
                                <User size={16} className="mr-2 text-muted-foreground" /> View Profile
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start text-sm hover:bg-muted/50 rounded-lg px-3 py-2 h-auto font-normal text-foreground" 
                                onClick={handleExportChat}
                              >
                                <FileText size={16} className="mr-2 text-muted-foreground" /> Export Chat
                              </Button>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {isMessageSearchOpen && (
                        <div className="px-4 py-3 border-b border-border bg-muted/20">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                            <input 
                              type="text" 
                              placeholder="Search in conversation..." 
                              className="w-full bg-background border border-border rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                              value={messageSearchQuery}
                              onChange={(e) => setMessageSearchQuery(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {chatLoading ? (
                           <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" /></div>
                        ) : messages.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                             <MessageSquare className="h-10 w-10 opacity-20 mb-2" />
                             <p className="text-sm">Start a conversation</p>
                           </div>
                        ) : filteredMessages.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                             <Search className="h-10 w-10 opacity-20 mb-2" />
                             <p className="text-sm">No messages found for "{messageSearchQuery}"</p>
                           </div>
                        ) : (
                          filteredMessages.map(msg => {
                            const isMe = msg.sender_id === tutorId;
                            return (
                              <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                {!isMe && (
                                  <img src={selectedGroup.student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedGroup.student.full_name}`} alt="Student" className="w-8 h-8 rounded-full bg-muted object-cover" />
                                )}
                                <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : ''}`}>
                                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    isMe 
                                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] rounded-tr-sm' 
                                      : 'bg-muted text-foreground rounded-tl-sm'
                                  }`}>
                                    {msg.file_url && msg.file_type === 'image' && (
                                      <img src={msg.file_url} alt="Attachment" className="max-w-[200px] rounded-lg mb-2 object-contain" />
                                    )}
                                    {msg.file_url && msg.file_type === 'file' && (
                                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-background/50 rounded-lg mb-2 text-xs hover:underline">
                                        <Paperclip size={14} /> View Attachment
                                      </a>
                                    )}
                                    {msg.message}
                                  </div>
                                  <div className={`flex items-center gap-1 text-[10px] text-muted-foreground ${isMe ? 'mr-1' : 'ml-1'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && <span className="text-[#D4AF37]">✓✓</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={chatBottomRef} />
                      </div>

                      <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border">
                        {selectedFile && (
                          <div className="mb-3 flex items-center justify-between bg-muted/50 p-2 rounded-lg text-sm border border-border">
                            <span className="truncate max-w-[200px] text-muted-foreground">{selectedFile.name}</span>
                            <button type="button" onClick={() => setSelectedFile(null)} className="text-red-400 hover:text-red-500 font-bold ml-2">×</button>
                          </div>
                        )}
                        <div className="relative flex items-center bg-muted/50 border border-slate-700/50 rounded-xl overflow-hidden focus-within:border-slate-500 transition-colors">
                          <input 
                            type="text" 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..." 
                            className="flex-1 bg-transparent py-3 pl-4 pr-32 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
                          />
                          <div className="absolute right-3 flex items-center gap-3">
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setSelectedFile(e.target.files[0]);
                                }
                              }}
                            />
                            <Paperclip 
                              onClick={() => fileInputRef.current?.click()}
                              size={18} 
                              className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" 
                            />
                            <Popover>
                              <PopoverTrigger asChild>
                                <Smile size={18} className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                              </PopoverTrigger>
                              <PopoverContent className="w-[40vw] sm:w-[400px] p-0 border-none mb-2" side="top" align="end">
                                <EmojiPicker 
                                  onEmojiClick={(emojiData) => setNewMessage(prev => prev + emojiData.emoji)} 
                                  theme="dark"
                                  width="100%"
                                />
                              </PopoverContent>
                            </Popover>
                            <button type="submit" disabled={isUploading} className="w-8 h-8 bg-[#D4AF37] hover:bg-[#c29f2f] rounded-lg flex items-center justify-center text-black ml-1 transition-colors disabled:opacity-50">
                              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="-ml-0.5" />}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {activeTab === 'overview' && (
                    <StudentProfileDashboard 
                      student={selectedGroup.student} 
                      progressData={progressData} 
                      deadlines={deadlines}
                      onAddAssignment={() => {
                        setNewDeadlineTitle('');
                        setNewDeadlineSubjectId(selectedGroup.subjects[0]?.id || '');
                        setIsDeadlineDialogOpen(true);
                      }}
                    />
                  )}
                  
                  {activeTab !== 'messages' && activeTab !== 'overview' && (
                     <div className="flex-1 flex flex-col bg-card border border-border rounded-2xl p-4 overflow-y-auto custom-scrollbar">
                       <h3 className="text-foreground font-medium mb-4">Dashboard View</h3>
                       <p className="text-muted-foreground text-sm">Navigate to Chat to see messages, or Deadlines for tasks.</p>
                     </div>
                  )}

                  {/* Subject Progress Overview */}
                  <div className="bg-card border border-border rounded-2xl p-4 shrink-0">
                    <div className="flex items-center gap-2 font-medium text-foreground mb-3">
                      <BookOpen size={18} className="text-[#D4AF37]" />
                      Subject Progress Overview
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      {selectedGroup.subjects.map((s, idx) => {
                        const subjectData = progressData.subjectProgress?.find(sp => sp.name === s.name);
                        const percent = subjectData ? subjectData.percent : 0;
                        return (
                          <ProgressBar key={s.id} label={s.name} percent={percent} color={idx % 2 === 0 ? "bg-green-500" : "bg-[#D4AF37]"} />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side (Widgets) */}
                <div className="xl:col-span-2 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                  
                  {/* Upcoming Deadlines */}
                  <div className="bg-card border border-border rounded-2xl p-4 flex flex-col min-h-[200px]">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Calendar size={18} className="text-purple-400" />
                        Upcoming Deadlines
                      </div>
                      <Dialog open={isDeadlineDialogOpen} onOpenChange={setIsDeadlineDialogOpen}>
                        <DialogTrigger asChild>
                           <button className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
                             <Plus size={12} /> Add
                           </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] border-border bg-background text-foreground">
                           <form onSubmit={handleCreateDeadline}>
                             <DialogHeader>
                               <DialogTitle className="text-[#D4AF37]">Assign Task</DialogTitle>
                               <DialogDescription className="text-muted-foreground">Assign a task with a due date.</DialogDescription>
                             </DialogHeader>
                             <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
                               <div className="space-y-2">
                                 <label className="text-xs font-semibold">Task Title</label>
                                 <Input className="bg-card border-border text-foreground" value={newDeadlineTitle} onChange={e => setNewDeadlineTitle(e.target.value)} required />
                               </div>
                               <div className="space-y-2">
                                 <label className="text-xs font-semibold">Description</label>
                                 <Textarea className="bg-card border-border text-foreground min-h-[80px]" value={newDeadlineDesc} onChange={e => setNewDeadlineDesc(e.target.value)} placeholder="Enter details about this task..." />
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <label className="text-xs font-semibold">Subject</label>
                                   <Select value={newDeadlineSubjectId} onValueChange={setNewDeadlineSubjectId} required>
                                     <SelectTrigger className="bg-card border-border text-foreground">
                                       <SelectValue placeholder="Select a subject" />
                                     </SelectTrigger>
                                     <SelectContent className="bg-background border-border text-foreground">
                                       {selectedGroup.subjects.map(s => (
                                         <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                       ))}
                                     </SelectContent>
                                   </Select>
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-xs font-semibold">Due Date</label>
                                   <Input type="datetime-local" className="bg-card border-border text-foreground" value={newDeadlineDate} onChange={e => setNewDeadlineDate(e.target.value)} required />
                                 </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                   <label className="text-xs font-semibold">Topic Tag</label>
                                   <Input className="bg-card border-border text-foreground" value={newDeadlineTopicTag} onChange={e => setNewDeadlineTopicTag(e.target.value)} placeholder="e.g. French Revolution" />
                                 </div>
                                 <div className="space-y-2">
                                   <label className="text-xs font-semibold">Past Exam Paper Tag</label>
                                   <Input className="bg-card border-border text-foreground" value={newDeadlinePastPaperTag} onChange={e => setNewDeadlinePastPaperTag(e.target.value)} placeholder="e.g. Jun 2026 Paper 11" />
                                 </div>
                               </div>

                               <div className="space-y-2">
                                 <label className="text-xs font-semibold block">Assignment Banner Image</label>
                                 {newDeadlineImageUrl ? (
                                   <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-border">
                                     <img src={newDeadlineImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                     <Button 
                                       type="button" 
                                       variant="destructive" 
                                       size="icon" 
                                       onClick={() => setNewDeadlineImageUrl('')} 
                                       className="absolute top-2 right-2 h-7 w-7 rounded-full"
                                     >
                                       <Trash2 className="w-3.5 h-3.5" />
                                     </Button>
                                   </div>
                                 ) : (
                                   <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-card">
                                     <label className="cursor-pointer flex flex-col items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                       <Plus className="w-6 h-6 text-primary" />
                                       <span>{uploadingDeadlineImage ? "Uploading..." : "Upload Banner Image"}</span>
                                       <input 
                                         type="file" 
                                         accept="image/*" 
                                         className="hidden" 
                                         disabled={uploadingDeadlineImage}
                                         onChange={async (e) => {
                                           const file = e.target.files?.[0];
                                           if (file) await handleUploadBannerImage(file);
                                         }} 
                                       />
                                     </label>
                                   </div>
                                 )}
                               </div>

                               {/* Questions Section */}
                               <div className="space-y-4 pt-4 border-t border-border">
                                 <div className="flex justify-between items-center">
                                   <h4 className="text-sm font-bold text-[#D4AF37]">Questions ({newDeadlineQuestions.length})</h4>
                                   <Button 
                                     type="button" 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => setNewDeadlineQuestions(prev => [...prev, { id: crypto.randomUUID(), question_text: '', points: 10 }])}
                                     className="border-border text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                   >
                                     <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Question
                                   </Button>
                                 </div>

                                 <div className="space-y-4">
                                   {newDeadlineQuestions.map((q, qIdx) => (
                                     <div key={q.id} className="bg-card border border-border/80 rounded-lg p-4 space-y-3 relative">
                                       <div className="flex justify-between items-start gap-4">
                                          <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Question {qIdx + 1}</label>
                                            <Textarea 
                                              value={q.question_text} 
                                              onChange={e => setNewDeadlineQuestions(prev => prev.map(item => item.id === q.id ? { ...item, question_text: e.target.value } : item))} 
                                              placeholder="Enter question content..." 
                                              className="bg-background border-border text-foreground min-h-[60px]"
                                              required
                                            />
                                          </div>
                                          <div className="w-20 space-y-2 shrink-0">
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Points</label>
                                            <Input 
                                              type="number" 
                                              value={q.points} 
                                              onChange={e => setNewDeadlineQuestions(prev => prev.map(item => item.id === q.id ? { ...item, points: Math.max(0, Number(e.target.value)) } : item))} 
                                              className="bg-background border-border text-foreground font-bold" 
                                              min={0}
                                              required
                                            />
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-4 justify-between pt-2">
                                         <div className="flex-1">
                                           {q.image_url ? (
                                             <div className="relative w-32 aspect-video rounded overflow-hidden border border-border">
                                               <img src={q.image_url} alt="Question Diagram" className="w-full h-full object-contain bg-background/50" />
                                               <Button 
                                                 type="button" 
                                                 variant="destructive" 
                                                 size="icon" 
                                                 onClick={() => setNewDeadlineQuestions(prev => prev.map(item => item.id === q.id ? { ...item, image_url: undefined } : item))} 
                                                 className="absolute top-1 right-1 h-5 w-5 rounded-full"
                                               >
                                                 <Trash2 className="w-2.5 h-2.5" />
                                               </Button>
                                             </div>
                                           ) : (
                                             <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                                               <Plus className="w-3.5 h-3.5" />
                                               <span>{uploadingQuestionImage[q.id] ? "Uploading..." : "Attach Diagram"}</span>
                                               <input 
                                                 type="file" 
                                                 accept="image/*" 
                                                 className="hidden" 
                                                 disabled={uploadingQuestionImage[q.id]}
                                                 onChange={async (e) => {
                                                   const file = e.target.files?.[0];
                                                   if (file) await handleUploadQuestionImage(file, q.id);
                                                 }} 
                                               />
                                             </label>
                                           )}
                                         </div>
                                         
                                         <Button 
                                           type="button" 
                                           variant="ghost" 
                                           size="sm" 
                                           onClick={() => setNewDeadlineQuestions(prev => prev.filter(item => item.id !== q.id))}
                                           className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                                         >
                                           <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                                         </Button>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                             <DialogFooter>
                               <Button type="button" variant="ghost" onClick={resetDeadlineForm} className="text-muted-foreground">Cancel</Button>
                               <Button type="submit" disabled={submittingDeadline} className="bg-[#D4AF37] text-black hover:bg-[#c29f2f]">
                                 {submittingDeadline ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                 Assign Task
                               </Button>
                             </DialogFooter>
                           </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {deadlinesLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#D4AF37]" /></div>
                      ) : deadlines.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
                      ) : (
                        deadlines.filter(d => d.status !== 'completed').map((d, i) => {
                           const colors = ["bg-red-500", "bg-[#D4AF37]", "bg-green-500", "bg-purple-500"];
                           const timeColors = ["text-red-400", "text-[#D4AF37]", "text-green-400", "text-purple-400"];
                           const colorIdx = i % colors.length;
                           const daysLeft = Math.max(0, Math.ceil((new Date(d.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                             return (
                               <DeadlineItem 
                                 key={d.id}
                                 dotColor={colors[colorIdx]} 
                                 title={d.title} 
                                 date={new Date(d.due_date).toLocaleDateString()} 
                                 timeLeft={`${daysLeft} days left`} 
                                 timeColor={timeColors[colorIdx]} 
                                 status={d.status}
                                 onComplete={() => handleToggleDeadline(d)}
                               />
                             );
                        })
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 font-medium text-foreground mb-3">
                      <ActivityIcon />
                      Recent Activity
                    </div>
                    
                    <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-muted">
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity, i) => {
                          const isCompleted = activity.type === 'completed';
                          const dateStr = new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                          const prefix = isCompleted ? "Completed: " : "Assigned: ";
                          return (
                            <ActivityItem 
                              key={i}
                              title={`${prefix}${activity.title}`} 
                              time={dateStr} 
                              iconColor={isCompleted ? "bg-green-500/20 text-green-500" : "bg-indigo-500/20 text-indigo-400"}
                              icon={isCompleted ? "✓" : "→"}
                            />
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground pl-8">No recent activity.</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Notes */}
                  <div className="bg-[#1A1810]/80 border border-[#D4AF37]/20 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 font-medium text-[#D4AF37]">
                        <ClipboardList size={18} />
                        Quick Notes
                      </div>
                      <button className="text-xs text-[#D4AF37] hover:underline">Add Note</button>
                    </div>
                    
                    <textarea 
                       className="w-full bg-transparent text-sm text-muted-foreground leading-relaxed mb-6 resize-none focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 rounded-lg p-2 -ml-2 h-24"
                       defaultValue={localStorage.getItem(`drmax_notes_${tutorId}_${selectedGroup.student.id}`) || "Pelaiah is showing great improvement in analytical thinking. Encourage more class participation."}
                       onChange={e => localStorage.setItem(`drmax_notes_${tutorId}_${selectedGroup.student.id}`, e.target.value)}
                    />
                    
                    <p className="text-[10px] text-muted-foreground">Auto-saved locally</p>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-16 w-16 opacity-20 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a Student</h3>
              <p className="text-sm text-center max-w-sm">Choose a student from the list to view their progress, chat history, and deadlines.</p>
            </div>
          )}
        </main>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        main:has(#students-page-container) {
          overflow: hidden !important;
          height: 100vh !important;
          max-height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
        }
        @media (max-width: 768px) {
          main:has(#students-page-container) {
            height: calc(100vh - 3rem) !important;
            max-height: calc(100vh - 3rem) !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
}

// Helper Components
function StudentCard({ name, level, board, progress, path, active = false, status = 'online', onClick }: { name: string, level: string, board?: string, progress: string, path?: string, active?: boolean, status?: 'online' | 'away', onClick: () => void }) {
  return (
    <div onClick={onClick} className={`p-4 rounded-xl border transition-all cursor-pointer ${
      active 
        ? 'bg-[#D4AF37]/5 border-[#D4AF37]/50' 
        : 'bg-card border-border hover:border-slate-700'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt={name} className="w-10 h-10 rounded-full bg-muted object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className="text-sm font-medium text-foreground truncate pr-2">{name}</h4>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${status === 'online' ? 'bg-green-500' : 'bg-[#D4AF37]'}`}></div>
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{level}</span>
            {board && (
              <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 font-medium">
                {board}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className={active ? 'text-green-400 text-xs font-medium' : 'text-muted-foreground text-xs font-medium'}>
              {progress}%
            </span>
            <div className="w-12 h-4 opacity-70">
              <Sparkline color={active || Number(progress) >= 50 ? '#4ade80' : '#facc15'} path={path} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm whitespace-nowrap ${
      active 
        ? 'border-[#D4AF37] text-[#D4AF37] font-medium bg-[#D4AF37]/5 rounded-t-lg' 
        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card rounded-t-lg'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function ProgressBar({ label, percent, color }: { label: string, percent: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground font-medium truncate pr-2">{label}</span>
        <span className="text-muted-foreground shrink-0">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function DeadlineItem({ dotColor, title, date, timeLeft, timeColor, status, onComplete }: { dotColor: string, title: string, date: string, timeLeft: string, timeColor: string, status?: string, onComplete: () => void }) {
  const isPendingReview = status === 'pending_admin_review';
  return (
    <div className="flex items-start gap-3 group">
      <button onClick={onComplete} disabled={isPendingReview} className={`w-3 h-3 rounded-full mt-1.5 ${isPendingReview ? 'bg-purple-500 cursor-not-allowed' : dotColor} hover:scale-110 transition-transform flex items-center justify-center`}>
         {!isPendingReview && <Check size={8} className="text-black opacity-0 group-hover:opacity-100" />}
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground mb-0.5 truncate">{title}</h4>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{date}</p>
          {isPendingReview && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">Awaiting Admin Approval</span>}
        </div>
      </div>
      <div className={`text-xs font-medium ${isPendingReview ? 'text-purple-400' : timeColor} mt-0.5 shrink-0`}>
        {isPendingReview ? 'Pending' : timeLeft}
      </div>
    </div>
  );
}

function ActivityItem({ title, time, iconColor, icon }: { title: string, time: string, iconColor: string, icon: string }) {
  return (
    <div className="relative pl-8 flex items-start gap-3">
      <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#0B0C10] ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm text-foreground mb-0.5 truncate">{title}</h4>
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}

function Sparkline({ color, path }: { color: string, path?: string }) {
  const dPath = path || "M0,25 C10,20 20,28 30,15 C40,5 50,22 60,10 C70,0 80,18 90,8 L100,5";
  return (
    <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
      <path 
        d={dPath} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
