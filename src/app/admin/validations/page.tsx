import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, X } from "lucide-react";

const pendingCourses = [
    {
        title: "The World of Shakespeare",
        tutor: "Dr. Eleanor Vance",
        submittedOn: "2024-07-28",
        status: "Pending Review",
    },
    {
        title: "Intro to Organic Chemistry",
        tutor: "Dr. Samuel Jones",
        submittedOn: "2024-07-27",
        status: "Pending Review",
    },
]

const pendingAssignments = [
    {
        title: "Algebra I Final Exam",
        tutor: "Dr. Evelyn Reed",
        course: "Algebra I",
        submittedOn: "2024-07-29",
        status: "Pending Review",
    },
    {
        title: "Biology Lab Report #3",
        tutor: "Dr. Ben Carter",
        course: "Biology 101",
        submittedOn: "2024-07-28",
        status: "Pending Review",
    },
]

function CoursesPendingReview() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Courses Pending Review</CardTitle>
                <CardDescription>Validate these courses to make them available to students.</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {pendingCourses.map((course, index) => (
                             <TableRow key={index}>
                                <TableCell className="font-medium">{course.title}</TableCell>
                                <TableCell>{course.tutor}</TableCell>
                                <TableCell>{course.submittedOn}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {course.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline">Review Content</Button>
                                    <Button variant="outline" size="icon" className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                     <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function AssignmentsPendingReview() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignments Pending Review</CardTitle>
                <CardDescription>Validate these assignments to make them available to students.</CardDescription>
            </CardHeader>
            <CardContent>
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
                        {pendingAssignments.map((assignment, index) => (
                             <TableRow key={index}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell>{assignment.tutor}</TableCell>
                                 <TableCell>{assignment.course}</TableCell>
                                <TableCell>{assignment.submittedOn}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {assignment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline">Review Content</Button>
                                    <Button variant="outline" size="icon" className="text-green-600 hover:bg-green-50 hover:text-green-700 border-green-200 hover:border-green-300">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                     <Button variant="outline" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}


export default function ValidationsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Validation</h1>
                <p className="text-muted-foreground">Review and approve courses and assignments submitted by tutors.</p>
            </div>
            
            <Tabs defaultValue="courses">
                <TabsList>
                    <TabsTrigger value="courses">Courses ({pendingCourses.length})</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments ({pendingAssignments.length})</TabsTrigger>
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
