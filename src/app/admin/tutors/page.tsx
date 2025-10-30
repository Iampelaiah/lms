

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, GraduationCap, Search } from "lucide-react";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";

const tutors: any[] = [];

function TutorList() {
    const inviteLink = "http://localhost:3000/invite/tutor-a1b2-c3d4-e5f6";
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <CardTitle>All Tutors</CardTitle>
                        <CardDescription>A list of all tutors registered at your institution.</CardDescription>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                         <div className="flex items-center gap-2">
                            <Input readOnly value={inviteLink} className="h-8 text-xs min-w-[280px]" />
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy link</span>
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search tutors..." className="pl-9" />
                        </div>
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
                        {tutors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No tutors have been invited yet.
                                </TableCell>
                            </TableRow>
                        ) : tutors.map((tutor) => (
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
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
              <div className="flex flex-col items-center gap-2 text-center">
                <GraduationCap className="h-16 w-16 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">
                  No Tutors Invited
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use the invitation link on the dashboard to invite tutors to your school.
                </p>
              </div>
            </div>
        </div>
    );
}