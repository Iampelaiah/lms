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

const generateStudents = () => {
    const firstNames = ["Emily", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Michael", "Abigail", "Daniel", "Harper", "Matthew", "David", "Elizabeth", "Joseph", "Sofia", "Jackson", "Avery", "Samuel", "Ella", "Sebastian", "Scarlett", "John", "Grace", "Gabriel", "Chloe", "Carter", "Victoria", "Jayden", "Riley", "Luke", "Aria", "Anthony", "Lily", "Isaac", "Leo", "Zoe", "Ryan", "Nora", "Caleb", "Hannah", "Owen", "Lillian", "Jack", "Addison", "Levi", "Aubrey", "Muhammad", "Stella", "Isaiah", "Natalie", "Julian", "Aurora", "Aaron", "Savannah", "Eli", "Brooklyn", "Landon", "Claire", "Jonathan", "Skylar", "Christian", "Paisley", "Jeremiah", "Audrey", "Hudson", "Leah", "Charles", "Sadie", "Thomas", "Aaliyah"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks", "Chavez", "Wood", "James", "Bennet", "Gray", "Mendoza", "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez"];
    const status = ["Active", "Inactive", "Suspended"];
    
    const students = [];
    const usedNames = new Set<string>();

    while (students.length < 450) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;

        if (!usedNames.has(name)) {
            usedNames.add(name);
            const seed = 101 + students.length;
            students.push({
                name: name,
                email: `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase()}@drmax.online`,
                avatarUrl: `https://picsum.photos/seed/${seed}/100/100`,
                avatarHint: "student portrait",
                coursesEnrolled: Math.floor(Math.random() * 8) + 1,
                lastActive: `${Math.floor(Math.random() * 24)} hours ago`,
                status: status[students.length % status.length]
            });
        }
    }
    return students;
};


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
                        {paginatedStudents.map((student, index) => (
                            <TableRow key={`${student.email}-${index}`}>
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
