
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilePlus, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";

const assignments = [
    {
        title: "Calculus Assignment 5",
        course: "Calculus I",
        dueDate: "2024-07-30",
        submissions: "40/45",
        status: "Grading",
    },
    {
        title: "Quantum Mechanics Lab 3",
        course: "Quantum Physics",
        dueDate: "2024-07-28",
        submissions: "32/32",
        status: "Graded",
    },
    {
        title: "Shakespeare Essay",
        course: "The World of Shakespeare",
        dueDate: "2024-07-25",
        submissions: "28/30",
        status: "Graded",
    },
     {
        title: "Renaissance Art Analysis",
        course: "Renaissance Art History",
        dueDate: "2024-08-05",
        submissions: "15/35",
        status: "Pending",
    },
    {
        title: "Statistics Problem Set 2",
        course: "Statistics 101",
        dueDate: "2024-08-02",
        submissions: "25/25",
        status: "Grading",
    }
];

const statusVariantMap: Record<string, "default" | "secondary" | "outline"> = {
    "Graded": "default",
    "Grading": "secondary",
    "Pending": "outline",
};

const statusColorMap: Record<string, string> = {
    "Graded": "bg-blue-100 text-blue-800",
    "Grading": "bg-yellow-100 text-yellow-800",
    "Pending": "border-gray-300",
};


function AssignmentList() {
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
                            <TableHead>Submissions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment.title}>
                                <TableCell className="font-medium">{assignment.title}</TableCell>
                                <TableCell>{assignment.course}</TableCell>
                                <TableCell>{assignment.dueDate}</TableCell>
                                <TableCell>{assignment.submissions}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariantMap[assignment.status]} className={statusColorMap[assignment.status]}>
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
                                            <DropdownMenuItem>Grade All</DropdownMenuItem>
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
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
                    <p className="text-muted-foreground">Create, manage, and grade student assignments.</p>
                </div>
                <Button asChild>
                    <Link href="#">
                        <FilePlus className="mr-2 h-4 w-4" />
                        Create New Assignment
                    </Link>
                </Button>
            </div>
            <AssignmentList />
        </div>
    );
}
