'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STUDENTS_PER_PAGE = 10;

function StudentListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    );
}

function StudentList() {
    const [students, setStudents] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);

    // Stable Supabase client — not recreated on every render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchStudents = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, role, is_approved, updated_at')
            .eq('role', 'student')
            .order('updated_at', { ascending: false });

        if (error) {
            toast({ title: "Error fetching students", description: error.message, variant: "destructive" });
        } else {
            setStudents(data || []);
        }
        setLoading(false);
    }, [supabase, toast]);

    React.useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const toggleApproveStudent = async (studentId: string, currentStatus: boolean) => {
        // Optimistic update — instant UI response, no waiting for refetch
        setStudents(prev =>
            prev.map(s => s.id === studentId ? { ...s, is_approved: !currentStatus } : s)
        );

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: !currentStatus })
            .eq('id', studentId);

        if (error) {
            // Revert on error
            setStudents(prev =>
                prev.map(s => s.id === studentId ? { ...s, is_approved: currentStatus } : s)
            );
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: !currentStatus ? "Student Approved" : "Student Access Suspended",
                description: `Successfully updated the student's access status.`,
            });
        }
    };

    const filteredStudents = React.useMemo(() => students.filter(student => {
        const query = searchQuery.toLowerCase();
        return (student.full_name || "").toLowerCase().includes(query) ||
               (student.email || "").toLowerCase().includes(query);
    }), [students, searchQuery]);

    const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE) || 1;

    const paginatedStudents = React.useMemo(() => filteredStudents.slice(
        (currentPage - 1) * STUDENTS_PER_PAGE,
        currentPage * STUDENTS_PER_PAGE
    ), [filteredStudents, currentPage]);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Students</CardTitle>
                        <CardDescription>A list of all students registered at your institution.</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search students..." 
                            className="pl-9 min-w-[200px]" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="!pt-0">
                {loading ? (
                    <StudentListSkeleton />
                ) : (
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Role Type</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                            {searchQuery ? "No students match your search query." : "No students are currently registered."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar>
                                                        <AvatarImage src={student.avatar_url} alt={student.full_name || 'Student'} />
                                                        <AvatarFallback>
                                                            {(student.full_name || 'S').split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{student.full_name || 'Unnamed Student'}</div>
                                                        <div className="text-sm text-muted-foreground">{student.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{student.role}</TableCell>
                                            <TableCell>{student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                {student.is_approved ? (
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className={student.is_approved ? "text-red-500 border-red-500/20 hover:bg-red-500/10" : "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"}
                                                    onClick={() => toggleApproveStudent(student.id, student.is_approved)}
                                                >
                                                    {student.is_approved ? "Suspend" : "Approve"}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
            {!loading && filteredStudents.length > 0 && (
                <CardContent>
                     <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                            </PaginationItem>
                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                    href="#"
                                    isActive={currentPage === i + 1}
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                                    >
                                    {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                            {totalPages > 5 && currentPage < totalPages - 2 && <PaginationEllipsis />}
                            <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1)); }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </CardContent>
            )}
        </Card>
    )
}

export default function StudentsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
                <p className="text-muted-foreground">View, search, and manage all students in your school.</p>
            </div>
            <StudentList />
        </div>
    );
}
