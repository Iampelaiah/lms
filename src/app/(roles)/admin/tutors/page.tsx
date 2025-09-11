import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import * as React from "react";

function SchoolHeader() {
  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-24 w-24 border">
          <AvatarImage src="https://picsum.photos/seed/school-logo/100/100" alt="School Logo" data-ai-hint="school logo" />
          <AvatarFallback>SH</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">Northwood High School</h2>
          <p className="text-muted-foreground italic">"Our mission is to foster a community of lifelong learners and critical thinkers."</p>
        </div>
      </CardContent>
    </Card>
  );
}

const tutors = [
    {
        name: "Dr. Evelyn Reed",
        email: "e.reed@example.com",
        avatarUrl: "https://picsum.photos/seed/102/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 4,
        totalStudents: 120,
        status: "Active"
    },
    {
        name: "Prof. Alistair Finch",
        email: "a.finch@example.com",
        avatarUrl: "https://picsum.photos/seed/105/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 2,
        totalStudents: 85,
        status: "Active"
    },
    {
        name: "Ms. Helena Garcia",
        email: "h.garcia@example.com",
        avatarUrl: "https://picsum.photos/seed/106/100/100",
        avatarHint: "teacher portrait",
        coursesAssigned: 3,
        totalStudents: 105,
        status: "Inactive"
    }
]

function TutorList() {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Tutors</CardTitle>
                        <CardDescription>A list of all tutors registered at your institution.</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search tutors..." className="pl-9" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Courses Assigned</TableHead>
                            <TableHead>Total Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tutors.map((tutor) => (
                            <TableRow key={tutor.email}>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={tutor.avatarUrl} alt={tutor.name} data-ai-hint={tutor.avatarHint} />
                                            <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{tutor.name}</div>
                                            <div className="text-sm text-muted-foreground">{tutor.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{tutor.coursesAssigned}</TableCell>
                                <TableCell>{tutor.totalStudents}</TableCell>
                                <TableCell>
                                    <Badge variant={tutor.status === 'Active' ? 'default' : 'secondary'} className={tutor.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>{tutor.status}</Badge>
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


export default function TutorsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
                <p className="text-muted-foreground">View, search, and manage all tutors in your school.</p>
            </div>
            <TutorList />
        </div>
    );
}
