'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilePlus, MoreHorizontal, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user-context";

const statusVariantMap: Record<string, "default" | "secondary" | "outline"> = {
    "graded": "default",
    "grading": "secondary",
    "pending": "outline",
};

const statusColorMap: Record<string, string> = {
    "graded": "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "grading": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    "pending": "border-gray-300 text-muted-foreground",
};

function AssignmentList({ tutorId }: { tutorId: string }) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!tutorId) return;
            const { data, error } = await supabase
                .from('assignments')
                .select(`
                    *,
                    course:courses (title)
                `)
                .eq('tutor_id', tutorId)
                .order('created_at', { ascending: false });

            if (data && !error) {
                setAssignments(data);
            }
            setLoading(false);
        };

        fetchAssignments();
    }, [tutorId]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignment Overview</CardTitle>
                    <CardDescription>A list of all assignments for your courses.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (assignments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assignment Overview</CardTitle>
                    <CardDescription>A list of all assignments for your courses.</CardDescription>
                </CardHeader>
                <CardContent className="py-16 text-center bg-white/5 border border-dashed rounded-3xl m-6 mt-0">
                    <div className="flex flex-col items-center gap-4">
                        <div className="bg-primary/5 p-4 rounded-full">
                            <FileText className="h-8 w-8 text-primary/20" />
                        </div>
                        <p className="text-muted-foreground">No assignments created yet.</p>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="#">Create Your First Assignment</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignment Overview</CardTitle>
                <CardDescription>A list of all assignments for your courses.</CardDescription>
            </CardHeader>
            <CardContent className="!pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell className="font-medium text-white/90">{assignment.title}</TableCell>
                                <TableCell className="text-white/60">{assignment.course?.title}</TableCell>
                                <TableCell className="text-white/40">
                                    {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusVariantMap[assignment.status]} className={`${statusColorMap[assignment.status]} capitalize`}>
                                        {assignment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                            <DropdownMenuItem>Edit Assignment</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function TutorAssignmentsPage() {
    const { profile } = useUser();

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Create, manage, and grade student assignments.</p>
                </div>
                <Button asChild className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-bold">
                    <Link href="#">
                        <FilePlus className="mr-2 h-4 w-4" />
                        Create New Assignment
                    </Link>
                </Button>
            </div>
            <AssignmentList tutorId={profile?.id || ''} />
        </div>
    );
}
