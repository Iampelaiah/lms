'use client';

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SchoolHeader } from "@/components/app/school-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, BookOpen, FileText, ChevronDown, ChevronUp, Calendar, Tag, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function AdminValidationPanel() {
    const supabase = createClient();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    
    // State for pending modules and their nested data
    const [pendingModules, setPendingModules] = useState<any[]>([]);
    const [pendingResources, setPendingResources] = useState<any[]>([]);
    const [pendingStudentDeadlines, setPendingStudentDeadlines] = useState<any[]>([]);
    
    // Expanded states for UI
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const [expandedDeadline, setExpandedDeadline] = useState<string | null>(null);
    const [rejectingModule, setRejectingModule] = useState<string | null>(null);
    const [rejectingResource, setRejectingResource] = useState<string | null>(null);
    const [adminFeedback, setAdminFeedback] = useState("");

    useEffect(() => {
        fetchPendingValidations(true);

        const channel = supabase
            .channel('validation-panel-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'curriculum_modules' }, (payload) => {
                toast({
                    title: "New Curriculum Submission!",
                    description: "A tutor just submitted a new module for your review.",
                    duration: 5000,
                });
                fetchPendingValidations(false);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'curriculum_modules' }, () => {
                fetchPendingValidations(false);
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, () => {
                fetchPendingValidations(false);
            })
            .subscribe();

        // Fallback polling every 10 seconds in case Supabase Realtime isn't enabled in the dashboard
        const pollInterval = setInterval(() => {
            fetchPendingValidations(false);
        }, 10000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, [supabase]);

    const fetchPendingValidations = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Fetch modules with status pending_admin_review
            const { data: modulesData, error } = await supabase
                .from('curriculum_modules')
                .select(`
                    id, title, course_level, sequence_order, approval_status, created_at,
                    tutor:profiles(id, full_name, role),
                    subject:subjects(id, name, level),
                    items:curriculum_items(
                        id, title, item_type, start_date, duration_minutes, metadata,
                        assignments:curriculum_assignments(id, assignment_number, title, description)
                    )
                `)
                .eq('approval_status', 'pending_admin_review');

            if (error) throw error;
            setPendingModules(modulesData || []);

            // Fetch pending resources
            const { data: resourcesData, error: resourcesError } = await supabase
                .from('resources')
                .select(`
                    id, title, format, type, file_url, created_at, source,
                    tutor:profiles!tutor_id(id, full_name),
                    subject:subjects!subject_id(name)
                `)
                .eq('approval_status', 'pending_admin_review');

            if (resourcesError) console.error("Error fetching resources:", resourcesError);
            else setPendingResources(resourcesData || []);

            // Fetch pending student deadlines
            const { data: deadlinesData, error: deadlinesError } = await supabase
                .from('student_deadlines')
                .select(`
                    id, title, description, due_date, created_at, status, tutor_id, student_id, subject_id,
                    tutor:profiles!tutor_id(id, full_name),
                    student:profiles!student_id(id, full_name),
                    subject:subjects!subject_id(name)
                `)
                .eq('status', 'pending_admin_review');

            let parsedDbDeadlines: any[] = [];
            if (deadlinesError) {
                console.error("Error fetching student deadlines:", deadlinesError);
            } else {
                parsedDbDeadlines = (deadlinesData || []).map((dl: any) => {
                    let description = dl.description;
                    let imageUrl = dl.image_url;
                    let pastPaperTag = dl.past_paper_tag;
                    let topicTag = dl.topic_tag;
                    let totalPoints = dl.total_points;
                    let questions = dl.questions || [];

                    if (dl.description && dl.description.trim().startsWith('{') && dl.description.includes('"_richAssignment":true')) {
                        try {
                            const parsed = JSON.parse(dl.description);
                            description = parsed.originalDescription;
                            imageUrl = parsed.imageUrl;
                            pastPaperTag = parsed.pastPaperTag;
                            topicTag = parsed.topicTag;
                            totalPoints = parsed.totalPoints;
                            questions = parsed.questions || [];
                        } catch (err) {
                            console.error("Error parsing JSON fallback description:", err);
                        }
                    }
                    return {
                        ...dl,
                        description,
                        image_url: imageUrl,
                        past_paper_tag: pastPaperTag,
                        topic_tag: topicTag,
                        total_points: totalPoints,
                        questions
                    };
                });
            }

            // Fetch local deadlines from localStorage
            const localDeadlines: any[] = [];
            if (typeof window !== 'undefined') {
                try {
                    // Fetch profiles and subjects maps to resolve references for local storage items
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name');
                    const profilesMap = new Map(profilesData?.map(p => [p.id, p.full_name]) || []);

                    const { data: subjectsData } = await supabase
                        .from('subjects')
                        .select('id, name');
                    const subjectsMap = new Map(subjectsData?.map(s => [s.id, s.name]) || []);

                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('drmax_deadlines_')) {
                            const stored = localStorage.getItem(key);
                            if (stored) {
                                try {
                                    const list = JSON.parse(stored);
                                    if (Array.isArray(list)) {
                                        list.forEach((dl: any) => {
                                            if (dl.status === 'pending_admin_review') {
                                                localDeadlines.push({
                                                    ...dl,
                                                    tutor: {
                                                        id: dl.tutor_id,
                                                        full_name: profilesMap.get(dl.tutor_id) || 'Unknown Tutor'
                                                    },
                                                    student: {
                                                        id: dl.student_id,
                                                        full_name: profilesMap.get(dl.student_id) || 'Unknown Student'
                                                    },
                                                    subject: {
                                                        name: dl.subjects?.name || subjectsMap.get(dl.subject_id) || 'Unknown Subject'
                                                    }
                                                });
                                            }
                                        });
                                    }
                                } catch (e) {
                                    console.error("Error parsing localStorage list:", e);
                                }
                            }
                        }
                    }
                } catch (localErr) {
                    console.error("Error fetching local storage helpers:", localErr);
                }
            }

            // Merge database and local storage deadlines by ID to avoid duplicates
            const combinedDeadlinesMap = new Map();
            parsedDbDeadlines.forEach((dl: any) => combinedDeadlinesMap.set(dl.id, dl));
            localDeadlines.forEach((dl: any) => combinedDeadlinesMap.set(dl.id, dl));

            setPendingStudentDeadlines(Array.from(combinedDeadlinesMap.values()));

        } catch (error: any) {
            console.error("Error fetching validations:", error);
            toast({
                title: "Failed to load pending validations",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveModule = async (moduleId: string) => {
        try {
            const { error } = await supabase
                .from('curriculum_modules')
                .update({ approval_status: 'approved', admin_feedback: null })
                .eq('id', moduleId);

            if (error) throw error;

            toast({
                title: "Module Approved",
                description: "The curriculum module is now live and visible to students.",
            });
            
            // Remove from local state
            setPendingModules(prev => prev.filter(m => m.id !== moduleId));
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleRejectModule = async (moduleId: string) => {
        if (!adminFeedback.trim()) {
            toast({
                title: "Feedback Required",
                description: "Please provide feedback explaining why the module is being rejected.",
                variant: "destructive"
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('curriculum_modules')
                .update({ approval_status: 'rejected', admin_feedback: adminFeedback })
                .eq('id', moduleId);

            if (error) throw error;

            toast({
                title: "Module Rejected",
                description: "The tutor will be notified to revise the module.",
            });
            
            setRejectingModule(null);
            setAdminFeedback("");
            // Remove from local state
            setPendingModules(prev => prev.filter(m => m.id !== moduleId));
        } catch (error: any) {
            toast({
                title: "Rejection Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleApproveResource = async (resourceId: string) => {
        try {
            const { error } = await supabase
                .from('resources')
                .update({ approval_status: 'approved', admin_feedback: null })
                .eq('id', resourceId);

            if (error) throw error;

            toast({
                title: "Resource Approved",
                description: "The resource is now live in the student library.",
            });
            
            // Remove from local state
            setPendingResources(prev => prev.filter(r => r.id !== resourceId));
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleRejectResource = async (resourceId: string) => {
        if (!adminFeedback.trim()) {
            toast({
                title: "Feedback Required",
                description: "Please provide feedback explaining why the resource is being rejected.",
                variant: "destructive"
            });
            return;
        }

        try {
            const { error } = await supabase
                .from('resources')
                .update({ approval_status: 'rejected', admin_feedback: adminFeedback })
                .eq('id', resourceId);

            if (error) throw error;

            toast({
                title: "Resource Rejected",
                description: "The resource was rejected.",
            });
            
            setRejectingResource(null);
            setAdminFeedback("");
            // Remove from local state
            setPendingResources(prev => prev.filter(r => r.id !== resourceId));
        } catch (error: any) {
            toast({
                title: "Rejection Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleApproveDeadline = async (deadlineId: string) => {
        try {
            // Update in Supabase
            const { error } = await supabase
                .from('student_deadlines')
                .update({ status: 'pending' })
                .eq('id', deadlineId);

            if (error) {
                console.warn("Database update failed, might be local-only deadline:", error.message);
            }

            // Update in localStorage
            if (typeof window !== 'undefined') {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('drmax_deadlines_')) {
                        const stored = localStorage.getItem(key);
                        if (stored) {
                            try {
                                const list = JSON.parse(stored);
                                if (Array.isArray(list)) {
                                    const index = list.findIndex((dl: any) => dl.id === deadlineId);
                                    if (index !== -1) {
                                        list[index].status = 'pending';
                                        localStorage.setItem(key, JSON.stringify(list));
                                        console.log("Updated local deadline to pending:", key);
                                    }
                                }
                            } catch (e) {
                                console.error("Error updating local storage deadline:", e);
                            }
                        }
                    }
                }
            }

            toast({
                title: "Deadline Approved",
                description: "The assignment is now visible to the student.",
            });
            
            setPendingStudentDeadlines(prev => prev.filter(d => d.id !== deadlineId));
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleRejectDeadline = async (deadlineId: string) => {
        try {
            // Update in Supabase
            const { error } = await supabase
                .from('student_deadlines')
                .update({ status: 'rejected' })
                .eq('id', deadlineId);

            if (error) {
                console.warn("Database update failed, might be local-only deadline:", error.message);
            }

            // Update in localStorage
            if (typeof window !== 'undefined') {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('drmax_deadlines_')) {
                        const stored = localStorage.getItem(key);
                        if (stored) {
                            try {
                                const list = JSON.parse(stored);
                                if (Array.isArray(list)) {
                                    const index = list.findIndex((dl: any) => dl.id === deadlineId);
                                    if (index !== -1) {
                                        list[index].status = 'rejected';
                                        localStorage.setItem(key, JSON.stringify(list));
                                        console.log("Updated local deadline to rejected:", key);
                                    }
                                }
                            } catch (e) {
                                console.error("Error updating local storage deadline:", e);
                            }
                        }
                    }
                }
            }

            toast({
                title: "Deadline Rejected",
                description: "The assignment was rejected.",
            });
            
            setPendingStudentDeadlines(prev => prev.filter(d => d.id !== deadlineId));
        } catch (error: any) {
            toast({
                title: "Rejection Failed",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    // Calculate all pending assignments from the pending modules
    const pendingAssignments = pendingModules.flatMap(module => 
        module.items?.flatMap((item: any) => 
            (item.assignments || []).map((assignment: any) => ({
                ...assignment,
                parent_module_id: module.id,
                parent_module_title: module.title,
                parent_item_title: item.title,
                tutor_name: module.tutor?.full_name
            }))
        ) || []
    );

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Admin Validation Panel</h1>
                    <p className="text-muted-foreground">Review and approve curriculum submissions from tutors.</p>
                </div>
                <Button onClick={fetchPendingValidations} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Refresh Queue
                </Button>
            </div>

            <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="mb-6 bg-muted/50 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="curriculum" className="flex gap-2">
                        <BookOpen className="h-4 w-4" />
                        Curriculum Modules 
                        <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">{pendingModules.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="flex gap-2">
                        <FileText className="h-4 w-4" />
                        Assignments & Tests
                        <Badge variant="secondary" className="ml-1 bg-gold/10 text-gold">{pendingAssignments.length + pendingStudentDeadlines.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="flex gap-2">
                        <FileText className="h-4 w-4" />
                        Resources
                        <Badge variant="secondary" className="ml-1 bg-blue-500/10 text-blue-500">{pendingResources.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* CURRICULUM MODULES TAB */}
                <TabsContent value="curriculum" className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : pendingModules.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 text-gold/50 mb-4" />
                                <p className="text-lg font-medium text-foreground">All caught up!</p>
                                <p>There are no curriculum modules pending review.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        pendingModules.map((module) => (
                            <Card key={module.id} className="overflow-hidden border-border/60 shadow-sm transition-all hover:border-primary/50">
                                <CardHeader className="bg-muted/20 pb-4 border-b">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">Pending Review</Badge>
                                                <Badge variant="outline">{module.course_level}</Badge>
                                                <span className="text-xs text-muted-foreground">Module {module.sequence_order}</span>
                                            </div>
                                            <CardTitle className="text-xl">{module.title}</CardTitle>
                                            <CardDescription>
                                                Submitted by <strong>{module.tutor?.full_name || 'Unknown Tutor'}</strong> for {module.subject?.name}
                                                {' • '}{new Date(module.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button 
                                                variant="outline" 
                                                className="text-burgundy hover:bg-burgundy/10 hover:text-burgundy"
                                                onClick={() => setRejectingModule(rejectingModule === module.id ? null : module.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button 
                                                className="bg-gold hover:bg-gold text-foreground"
                                                onClick={() => handleApproveModule(module.id)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Module
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                {/* Reject Feedback Area */}
                                {rejectingModule === module.id && (
                                    <div className="p-4 bg-burgundy/5 border-b border-burgundy/10 space-y-3">
                                        <p className="text-sm font-medium text-burgundy">Provide Revision Feedback</p>
                                        <Textarea 
                                            placeholder="Explain what needs to be changed..."
                                            value={adminFeedback}
                                            onChange={(e) => setAdminFeedback(e.target.value)}
                                            className="bg-background focus-visible:ring-red-500"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setRejectingModule(null)}>Cancel</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleRejectModule(module.id)}>Confirm Rejection</Button>
                                        </div>
                                    </div>
                                )}

                                <CardContent className="p-0">
                                    <button 
                                        className="w-full flex items-center justify-between p-4 bg-background hover:bg-muted/30 transition-colors text-sm font-medium"
                                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                                    >
                                        <span className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            View Curriculum Details ({module.items?.length || 0} items)
                                        </span>
                                        {expandedModule === module.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>

                                    {expandedModule === module.id && (
                                        <div className="p-4 pt-0 border-t bg-muted/10 space-y-4">
                                            {module.items?.map((item: any) => (
                                                <div key={item.id} className="p-4 bg-background border rounded-lg shadow-sm">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {item.item_type === 'topic' ? (
                                                                    <Badge variant="outline" className="text-gold border-gold/20 bg-gold/5">Topic</Badge>
                                                                ) : item.item_type === 'test' ? (
                                                                    <Badge variant="outline" className="text-gold border-gold/20 bg-gold/5">Test</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-gold border-gold/20 bg-gold/5">Live Class</Badge>
                                                                )}
                                                                {item.metadata?.exam_allocation_2026 && (
                                                                    <span className="text-xs font-medium text-muted-foreground border px-2 py-0.5 rounded-full">
                                                                        {item.metadata.exam_allocation_2026}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h4 className="font-semibold text-foreground">{item.title}</h4>
                                                        </div>
                                                        <div className="text-right text-xs text-muted-foreground">
                                                            <p>Starts: {new Date(item.start_date).toLocaleString()}</p>
                                                            <p>Duration: {item.duration_minutes} mins</p>
                                                        </div>
                                                    </div>

                                                    {/* Key Questions */}
                                                    {item.metadata?.key_questions && item.metadata.key_questions.length > 0 && (
                                                        <div className="mt-3 space-y-1">
                                                            <p className="text-xs font-semibold uppercase text-muted-foreground">Key Questions</p>
                                                            <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-0.5">
                                                                {item.metadata.key_questions.map((q: string, i: number) => (
                                                                    <li key={i}>{q}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Assignments */}
                                                    {item.assignments && item.assignments.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t">
                                                            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                                                <FileText className="h-3 w-3" /> Assignments
                                                            </p>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {item.assignments.map((assignment: any) => (
                                                                    <div key={assignment.id} className="p-2 bg-muted/50 rounded border text-sm">
                                                                        <p className="font-medium">#{assignment.assignment_number}: {assignment.title}</p>
                                                                        {assignment.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{assignment.description}</p>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* ASSIGNMENTS & TESTS TAB */}
                <TabsContent value="assignments" className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (pendingAssignments.length === 0 && pendingStudentDeadlines.length === 0) ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 text-gold/50 mb-4" />
                                <p className="text-lg font-medium text-foreground">No Pending Assignments</p>
                                <p>Assignments from pending modules will appear here for review.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingAssignments.map((assignment) => (
                                <Card key={assignment.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3 border-b bg-muted/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-gold/5 text-gold border-gold/20">
                                                Assignment {assignment.assignment_number}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-1" title={assignment.title}>{assignment.title}</CardTitle>
                                        <CardDescription className="text-xs">
                                            Submitted by {assignment.tutor_name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-3 flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Context</p>
                                                <p className="text-sm font-medium line-clamp-1" title={assignment.parent_module_title}>Module: {assignment.parent_module_title}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-1" title={assignment.parent_item_title}>Topic: {assignment.parent_item_title}</p>
                                            </div>
                                            {assignment.description && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                                                    <p className="text-sm line-clamp-3 text-foreground/80">{assignment.description}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t w-full">
                                            <Button 
                                                variant="outline" 
                                                className="w-full text-xs" 
                                                onClick={() => {
                                                    // Automatically switch to the curriculum tab and expand the module to approve/reject
                                                    const tabsTriggers = document.querySelectorAll('[role="tab"]');
                                                    (tabsTriggers[0] as HTMLElement)?.click();
                                                    setExpandedModule(assignment.parent_module_id);
                                                }}
                                            >
                                                View Module to Approve
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Standalone Student Deadlines */}
                            {pendingStudentDeadlines.map((deadline) => (
                                <Card key={deadline.id} className="flex flex-col border-primary/20 shadow-sm overflow-hidden">
                                    {deadline.image_url && (
                                        <div className="relative w-full aspect-video border-b border-border/80 overflow-hidden">
                                            <img src={deadline.image_url} alt="Assignment Banner" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-3 border-b bg-muted/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                Direct Assignment
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-1" title={deadline.title}>{deadline.title}</CardTitle>
                                        <CardDescription className="text-xs">
                                            Tutor: <strong>{deadline.tutor?.full_name}</strong>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-3 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Context</p>
                                                <p className="text-sm font-medium">Student: {deadline.student?.full_name}</p>
                                                <p className="text-sm text-muted-foreground">Subject: {deadline.subject?.name}</p>
                                                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" /> Due: {new Date(deadline.due_date).toLocaleDateString()}
                                                </p>
                                            </div>

                                            {/* Tags & Total Points */}
                                            {(deadline.topic_tag || deadline.past_paper_tag || (deadline.total_points > 0)) && (
                                                <div className="flex flex-wrap gap-1.5 pt-1">
                                                    {deadline.topic_tag && (
                                                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                            <Tag className="w-2.5 h-2.5 mr-1" /> {deadline.topic_tag}
                                                        </Badge>
                                                    )}
                                                    {deadline.past_paper_tag && (
                                                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                                                            <FileText className="w-2.5 h-2.5 mr-1" /> {deadline.past_paper_tag}
                                                        </Badge>
                                                    )}
                                                    {deadline.total_points > 0 && (
                                                        <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-gold/10 text-gold border border-gold/20">
                                                            Score: {deadline.total_points} pts
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {deadline.description && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Description</p>
                                                    <p className="text-sm line-clamp-3 text-foreground/80">{deadline.description}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Collapsible Questions List */}
                                        {deadline.questions && deadline.questions.length > 0 && (
                                            <div className="border border-border/60 rounded-lg overflow-hidden bg-muted/10">
                                                <button
                                                    className="w-full flex items-center justify-between p-2 text-xs font-semibold hover:bg-muted/30 transition-colors text-muted-foreground"
                                                    onClick={() => setExpandedDeadline(expandedDeadline === deadline.id ? null : deadline.id)}
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <HelpCircle className="h-3.5 w-3.5" />
                                                        View Questions ({deadline.questions.length})
                                                    </span>
                                                    {expandedDeadline === deadline.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </button>

                                                {expandedDeadline === deadline.id && (
                                                    <div className="p-3 pt-0 border-t border-border/40 space-y-2 bg-background max-h-[200px] overflow-y-auto custom-scrollbar">
                                                        {deadline.questions.map((q: any, idx: number) => (
                                                            <div key={q.id || idx} className="p-2 border rounded text-xs space-y-1">
                                                                <div className="flex justify-between font-semibold">
                                                                    <span>Q{idx + 1} ({q.points} pts)</span>
                                                                </div>
                                                                <p className="text-foreground/80 line-clamp-2">{q.question_text}</p>
                                                                {q.image_url && (
                                                                    <div className="w-16 h-10 relative border rounded overflow-hidden bg-muted/20">
                                                                        <img src={q.image_url} alt="Question Diagram" className="w-full h-full object-contain" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 pt-4 border-t w-full flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                className="w-full text-xs text-burgundy hover:bg-burgundy/10 hover:text-burgundy" 
                                                onClick={() => handleRejectDeadline(deadline.id)}
                                            >
                                                <XCircle className="h-4 w-4 mr-1" /> Reject
                                            </Button>
                                            <Button 
                                                className="w-full text-xs bg-gold hover:bg-gold/90 text-foreground" 
                                                onClick={() => handleApproveDeadline(deadline.id)}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
                {/* RESOURCES TAB */}
                <TabsContent value="resources" className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : pendingResources.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <CheckCircle className="h-12 w-12 text-blue-500/50 mb-4" />
                                <p className="text-lg font-medium text-foreground">No Pending Resources</p>
                                <p>Resources uploaded by tutors will appear here for review.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingResources.map((resource) => (
                                <Card key={resource.id} className="flex flex-col hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-3 border-b bg-muted/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 uppercase text-[10px] tracking-wider">
                                                {resource.type}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-base line-clamp-1" title={resource.title}>{resource.title}</CardTitle>
                                        <CardDescription className="text-xs">
                                            Submitted by {resource.tutor?.full_name} for {resource.subject?.name}
                                        </CardDescription>
                                    </CardHeader>
                                    
                                    {/* Reject Feedback Area */}
                                    {rejectingResource === resource.id && (
                                        <div className="p-4 bg-burgundy/5 border-b border-burgundy/10 space-y-3 flex-1">
                                            <p className="text-sm font-medium text-burgundy">Provide Revision Feedback</p>
                                            <Textarea 
                                                placeholder="Explain what needs to be changed..."
                                                value={adminFeedback}
                                                onChange={(e) => setAdminFeedback(e.target.value)}
                                                className="bg-background focus-visible:ring-red-500"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setRejectingResource(null)}>Cancel</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleRejectResource(resource.id)}>Confirm Rejection</Button>
                                            </div>
                                        </div>
                                    )}

                                    {rejectingResource !== resource.id && (
                                        <CardContent className="pt-3 flex-1 flex flex-col justify-between">
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <a href={resource.file_url} target="_blank" rel="noreferrer" className="w-full">
                                                        <Button variant="secondary" className="w-full text-xs">
                                                            View Resource File
                                                        </Button>
                                                    </a>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t w-full flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full text-xs text-burgundy hover:bg-burgundy/10 hover:text-burgundy" 
                                                    onClick={() => setRejectingResource(resource.id)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                                <Button 
                                                    className="w-full text-xs bg-gold hover:bg-gold/90 text-foreground" 
                                                    onClick={() => handleApproveResource(resource.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

