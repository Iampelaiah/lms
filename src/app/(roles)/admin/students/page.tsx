import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import * as React from "react";

const students = [
    {
        name: "Alex Johnson",
        email: "alex.j@example.com",
        avatarUrl: "https://picsum.photos/seed/101/100/100",
        avatarHint: "student portrait",
        coursesEnrolled: 5,
        lastActive: "2 hours ago",
        status: "Active"
    },
    {
        name: "Brenda Smith",
        email: "brenda.s@example.com",
        avatarUrl: "https://picsum.photos/seed/116/100/100",
        avatarHint: "student portrait",
        coursesEnrolled: 3,
        lastActive: "5 hours ago",
        status: "Active"
    },
    {
        name: "Charlie Brown",
        email: "charlie.b@example.com",
        avatarUrl: "https://picsum.photos/seed/117/100/100",
        avatarHint: "student portrait",
        coursesEnrolled: 8,
        lastActive: "1 day ago",
        status: "Suspended"
    },
    {
        name: "Diana Prince",
        email: "diana.p@example.com",
        avatarUrl: "https://picsum.photos/seed/118/100/100",
        avatarHint: "student portrait",
        coursesEnrolled: 4,
        lastActive: "3 days ago",
        status: "Active"
    },
    {
        name: "Ethan Hunt",
        email: "ethan.h@example.com",
        avatarUrl: "https://picsum.photos/seed/119/100/100",
        avatarHint: "student portrait",
        coursesEnrolled: 2,
        lastActive: "1 week ago",
        status: "Inactive"
    }
]

const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
    "Active": "default",
    "Inactive": "secondary",
    "Suspended": "destructive"
}

function StudentList() {
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
                        {students.map((student) => (
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