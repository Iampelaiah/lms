'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Clock, X, BookOpen, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

// ─────────────────────────────────────────────────────────────
// COURSES PENDING REVIEW
// ─────────────────────────────────────────────────────────────

function CoursesPendingReview() {
    const [courses, setCourses] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [actionId, setActionId] = React.useState<string | null>(null);

    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchCourses = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                id, title, status, created_at,
                tutor:profiles!courses_tutor_id_fkey (full_name)
            `)
            .eq('status', 'Pending Review')
            .order('created_at', { ascending: false });

        if (!error) setCourses(data || []);
        setLoading(false);
    }, [supabase]);

    React.useEffect(() => {
        fetchCourses();

        // Real-time: when a course status changes, refresh the list
        const channel = supabase
            .channel('admin-courses-validation')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'courses',
            }, (payload) => {
                if (payload.eventType === 'INSERT' && (payload.new as any).status === 'Pending Review') {
                    // New course submitted — add it
                    fetchCourses();
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new as any;
                    if (updated.status !== 'Pending Review') {
                        // Course approved or rejected — remove from this list
                        setCourses(prev => prev.filter(c => c.id !== updated.id));
                    }
                } else if (payload.eventType === 'DELETE') {
                    setCourses(prev => prev.filter(c => c.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchCourses, supabase]);

    const handleAction = async (courseId: string, approve: boolean) => {
        setActionId(courseId);
        const newStatus = approve ? 'Published' : 'Rejected';

        const { error } = await supabase
            .from('courses')
            .update({ status: newStatus })
            .eq('id', courseId);

        if (error) {
            toast({ title: `Error ${approve ? 'approving' : 'rejecting'} course`, description: error.message, variant: 'destructive' });
        } else {
            // Remove from list immediately (real-time will also fire)
            setCourses(prev => prev.filter(c => c.id !== courseId));
            toast({
                title: approve ? 'Course Approved' : 'Course Rejected',
                description: approve
                    ? 'The course is now published and accessible to students.'
                    : 'The course has been rejected and the tutor will need to revise it.',
            });
        }
        setActionId(null);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Courses Pending Review</CardTitle>
                    <CardDescription>Validate these courses to make them available to students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 py-3">
                                <Skeleton className="h-5 flex-1" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Courses Pending Review</CardTitle>
                <CardDescription>Validate these courses to make them available to students.</CardDescription>
            </CardHeader>
            <CardContent>
                {courses.length === 0 ? (
                    <div className="py-16 text-center border border-dashed rounded-xl">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/40 mb-3" />
                        <p className="font-medium text-muted-foreground">All courses are reviewed!</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">New courses submitted by tutors will appear here automatically.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course Title</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            {course.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{course.tutor?.full_name || 'Unknown Tutor'}</TableCell>
                                    <TableCell>
                                        {course.created_at
                                            ? new Date(course.created_at).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Pending Review
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300 h-8 w-8"
                                                onClick={() => handleAction(course.id, true)}
                                                disabled={actionId === course.id}
                                                title="Approve Course"
                                            >
                                                {actionId === course.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Check className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 h-8 w-8"
                                                onClick={() => handleAction(course.id, false)}
                                                disabled={actionId === course.id}
                                                title="Reject Course"
                                            >
                                                {actionId === course.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <X className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────
// ASSIGNMENTS PENDING REVIEW (Stub — assignments table exists but
// admin approval flow is not yet implemented in DB)
// ─────────────────────────────────────────────────────────────

function AssignmentsPendingReview() {
    const [assignments, setAssignments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [actionId, setActionId] = React.useState<string | null>(null);

    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchAssignments = React.useCallback(async () => {
        const { data, error } = await supabase
            .from('assignments')
            .select(`
                id, title, created_at, status,
                course:courses!assignments_course_id_fkey (title, tutor_id),
                tutor:profiles!assignments_tutor_id_fkey (full_name)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error) setAssignments(data || []);
        setLoading(false);
    }, [supabase]);

    React.useEffect(() => {
        fetchAssignments();

        const channel = supabase
            .channel('admin-assignments-validation')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'assignments',
            }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    const updated = payload.new as any;
                    if (updated.status !== 'pending') {
                        setAssignments(prev => prev.filter(a => a.id !== updated.id));
                    }
                } else if (payload.eventType === 'INSERT' && (payload.new as any).status === 'pending') {
                    fetchAssignments();
                } else if (payload.eventType === 'DELETE') {
                    setAssignments(prev => prev.filter(a => a.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [fetchAssignments, supabase]);

    const handleAction = async (assignmentId: string, approve: boolean) => {
        setActionId(assignmentId);
        const newStatus = approve ? 'grading' : 'rejected';

        const { error } = await supabase
            .from('assignments')
            .update({ status: newStatus })
            .eq('id', assignmentId);

        if (error) {
            toast({ title: `Error processing assignment`, description: error.message, variant: 'destructive' });
        } else {
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
            toast({
                title: approve ? 'Assignment Approved' : 'Assignment Rejected',
                description: approve
                    ? 'The assignment is now available to students.'
                    : 'The assignment has been sent back for revision.',
            });
        }
        setActionId(null);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignments Pending Review</CardTitle>
                    <CardDescription>Validate these assignments to make them available to students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center gap-4 py-3">
                                <Skeleton className="h-5 flex-1" />
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-20 rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignments Pending Review</CardTitle>
                <CardDescription>Validate these assignments to make them available to students.</CardDescription>
            </CardHeader>
            <CardContent>
                {assignments.length === 0 ? (
                    <div className="py-16 text-center border border-dashed rounded-xl">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/40 mb-3" />
                        <p className="font-medium text-muted-foreground">No assignments pending review!</p>
                        <p className="text-sm text-muted-foreground/70 mt-1">New assignments will appear here automatically when submitted by tutors.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment Title</TableHead>
                                <TableHead>Tutor</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            {assignment.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{assignment.tutor?.full_name || 'Unknown Tutor'}</TableCell>
                                    <TableCell>{assignment.course?.title || '—'}</TableCell>
                                    <TableCell>
                                        {assignment.created_at
                                            ? new Date(assignment.created_at).toLocaleDateString()
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                            <Clock className="mr-1 h-3 w-3" />
                                            Pending Review
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300 h-8 w-8"
                                                onClick={() => handleAction(assignment.id, true)}
                                                disabled={actionId === assignment.id}
                                                title="Approve Assignment"
                                            >
                                                {actionId === assignment.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Check className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300 h-8 w-8"
                                                onClick={() => handleAction(assignment.id, false)}
                                                disabled={actionId === assignment.id}
                                                title="Reject Assignment"
                                            >
                                                {actionId === assignment.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <X className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

// ─────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────

export default function ValidationsPage() {
    const [pendingCourseCount, setPendingCourseCount] = React.useState<number | null>(null);
    const [pendingAssignmentCount, setPendingAssignmentCount] = React.useState<number | null>(null);
    const supabase = React.useMemo(() => createClient(), []);

    // Live tab counts
    React.useEffect(() => {
        const fetchCounts = async () => {
            const [courseRes, assignmentRes] = await Promise.all([
                supabase.from('courses').select('id', { count: 'exact', head: true }).eq('status', 'Pending Review'),
                supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            ]);
            setPendingCourseCount(courseRes.count ?? 0);
            setPendingAssignmentCount(assignmentRes.count ?? 0);
        };

        fetchCounts();

        const channel = supabase
            .channel('validation-counts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetchCounts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, fetchCounts)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Validation</h1>
                <p className="text-muted-foreground">Review and approve courses and assignments submitted by tutors.</p>
            </div>

            <Tabs defaultValue="courses">
                <TabsList>
                    <TabsTrigger value="courses">
                        Courses{' '}
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                            {pendingCourseCount ?? '…'}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                        Assignments{' '}
                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                            {pendingAssignmentCount ?? '…'}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="courses" className="mt-6">
                    <CoursesPendingReview />
                </TabsContent>
                <TabsContent value="assignments" className="mt-6">
                    <AssignmentsPendingReview />
                </TabsContent>
            </Tabs>
        </div>
    );
}
