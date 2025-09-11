
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import Image from "next/image";

const courses = [
    {
        title: "Algebra Basics",
        description: "Master the fundamentals of algebraic expressions, equations, and functions. Perfect for beginners.",
        rating: 4.2,
        reviews: 412,
        level: "Beginner",
        image: "https://picsum.photos/seed/course-algebra/300/200",
        imageHint: "algebra equation"
    },
    {
        title: "Geometry Foundations",
        description: "Explore the world of shapes, angles, and spatial reasoning. Learn key concepts to build a strong foundation.",
        rating: 4.5,
        reviews: 358,
        level: "Beginner",
        image: "https://picsum.photos/seed/course-geometry/300/200",
        imageHint: "geometric shapes"
    }
]

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

function CourseCard({ course }: { course: (typeof courses)[0] }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-square">
                     <Image src={course.image} alt={course.title} fill className="object-cover" data-ai-hint={course.imageHint} />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                        <h3 className="text-xl font-bold">{course.title}</h3>
                        <p className="text-muted-foreground mt-2">{course.description}</p>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-muted-foreground ml-1">({course.reviews})</span>
                        </div>
                        <Badge variant="outline">{course.level}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function MyCoursesPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <div className="space-y-6">
            <SchoolHeader />
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                        <p className="text-muted-foreground">Continue your learning journey in Mathematics.</p>
                    </div>

                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-6 space-y-6">
                            {courses.map(course => (
                                <CourseCard key={course.title} course={course} />
                            ))}
                        </TabsContent>
                         <TabsContent value="active" className="mt-6">
                            <p className="text-muted-foreground text-center py-16">No active courses.</p>
                        </TabsContent>
                         <TabsContent value="completed" className="mt-6">
                            <p className="text-muted-foreground text-center py-16">No completed courses.</p>
                        </TabsContent>
                    </Tabs>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Study Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="p-0"
                            />
                        </CardContent>
                    </Card>
                </div>
             </div>
        </div>
    )
}
