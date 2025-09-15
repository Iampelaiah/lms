'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import * as React from "react";

const generateStudents = () => Array.from({ length: 450 }, (_, i) => {
    const seed = 101 + i;
    const firstNames = ["Alex", "Brenda", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Ian", "Julia"];
    const lastNames = ["Johnson", "Smith", "Brown", "Prince", "Hunt", "Gallagher", "Harrison", "Ivers", "Jones", "King"];
    const status = ["Active", "Inactive", "Suspended"];
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@northwood.lq.zw`,
        avatarUrl: `https://picsum.photos/seed/${seed}/100/100`,
        avatarHint: "student portrait",
        coursesEnrolled: Math.floor(Math.random() * 8) + 1,
        lastActive: `${Math.floor(Math.random() * 24)} hours ago`,
        status: status[i % status.length]
    }
});


const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
    "Active": "default",
    "Inactive": "secondary",
    "Suspended": "destructive"
}

function StudentList() {
    const [students, setStudents] = React.useState<ReturnType<typeof generateStudents>>([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const studentsPerPage = 10;

    React.useEffect(() => {
        setStudents(generateStudents());
    }, []);

    const totalPages = Math.ceil(students.length / studentsPerPage);

    const paginatedStudents = students.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage
    );

    if (students.length === 0) {
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
                            <Input placeholder="Search students..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="!pt-0">
                    <div className="text-center py-16 text-muted-foreground">Loading students...</div>
                </CardContent>
            </Card>
        )
    }

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
                        <Input placeholder="Search students..." className="pl-9" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="!pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Courses Enrolled</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.map((student) => (
                            <TableRow key={student.email}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.avatarHint} />
                                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{student.coursesEnrolled}</TableCell>
                                <TableCell>{student.lastActive}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={statusVariantMap[student.status]}
                                        className={student.status === 'Active' ? 'bg-blue-100 text-blue-800' : ''}
                                    >
                                        {student.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="outline">View</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardContent>
                 <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(Math.max(1, currentPage - 1));
                            }}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                href="#"
                                isActive={currentPage === i + 1}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(i + 1);
                                }}
                                >
                                {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )).slice(0, 5)}
                        {totalPages > 5 && <PaginationEllipsis />}
                        <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(Math.min(totalPages, currentPage + 1));
                            }}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardContent>
        </Card>
    )
}

export default function StudentsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <StudentList />
        </div>
    );
}
