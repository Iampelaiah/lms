
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, PlusCircle, Users, Eye, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

const courses = [
    {
        title: "Calculus I",
        imageUrl: "https://picsum.photos/seed/course-calculus/600/400",
        imageHint: "calculus equation",
        status: "Published",
        students: 45,
        lessons: 12,
    },
    {
        title: "Quantum Physics",
        imageUrl: "https://picsum.photos/seed/course-physics/600/400",
        imageHint: "quantum physics atom",
        status: "Published",
        students: 32,
        lessons: 12,
    },
    {
        title: "The World of Shakespeare",
        imageUrl: "https://picsum.photos/seed/course-shakespeare/600/400",
        imageHint: "shakespeare portrait",
        status: "Pending Review",
        students: 0,
        lessons: 0,
    }
]

const statusVariantMap: Record<string, "default" | "secondary"> = {
    "Published": "default",
    "Pending Review": "secondary",
}

const statusColorMap: Record<string, string> = {
    "Published": "bg-blue-500 hover:bg-blue-600",
    "Pending Review": "bg-yellow-500 text-yellow-900 hover:bg-yellow-600",
}

function CourseList() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
                <Card key={course.title} className="overflow-hidden flex flex-col">
                    <CardHeader className="p-0 relative">
                        <Badge className={`absolute top-4 right-4 z-10 ${statusColorMap[course.status]}`}>
                            {course.status}
                        </Badge>
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={course.imageUrl} alt={course.title} fill className="object-cover" data-ai-hint={course.imageHint} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-bold">{course.title}</h3>
                        <div className="pt-2 text-sm text-muted-foreground flex items-center gap-4">
                            {course.status === "Published" ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        <span>{course.students} Students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BookOpenCheck className="w-4 h-4" />
                                        <span>{course.lessons} Lessons</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-yellow-600">Pending admin approval</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="mr-2 h-4 w-4" />
                            View Course
                        </Button>
                        <Button variant="secondary" size="sm" className="flex-1">
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export default function TutorCoursesPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">Manage your courses and learning materials.</p>
                </div>
                <Button asChild>
                    <Link href="#">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Course
                    </Link>
                </Button>
            </div>
            <CourseList />
        </div>
    );
}
