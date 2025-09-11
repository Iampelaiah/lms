

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import Image from "next/image";
import * as React from "react";

const courses = [
    {
        title: "Geometry Foundations",
        description: "Explore the world of shapes, angles, and spatial reasoning. Learn key theorems and proofs.",
        rating: 4.8,
        reviews: 580,
        level: "Beginner",
        image: "https://picsum.photos/seed/course-geometry/300/200",
        imageHint: "geometric shapes"
    },
    {
        title: "Calculus I",
        description: "An introduction to differential calculus, including limits, derivatives, and their applications.",
        rating: 4.5,
        reviews: 720,
        level: "Intermediate",
        image: "https://picsum.photos/seed/course-calculus/300/200",
        imageHint: "calculus equation"
    },
    {
        title: "Probability & Statistics",
        description: "Learn to analyze data, understand probability distributions, and perform statistical tests.",
        rating: 4.2,
        reviews: 380,
        level: "Intermediate",
        image: "https://picsum.photos/seed/course-stats/300/200",
        imageHint: "statistics graph"
    }
];

const onlineUsers = [
    { name: "Maren Maureen", avatar: "https://picsum.photos/seed/user-1/40/40", hint: "person portrait" },
    { name: "Jenniffer Jane", avatar: "https://picsum.photos/seed/user-2/40/40", hint: "person portrait" },
    { name: "Ryan Herwinds", avatar: "https://picsum.photos/seed/user-3/40/40", hint: "person portrait" },
    { name: "Kierra Culhane", avatar: "https://picsum.photos/seed/user-4/40/40", hint: "person portrait" },
]

const calendarLegend = [
    { subject: "Mathematics", color: "bg-blue-300" },
    { subject: "Physics", color: "bg-green-300" },
    { subject: "History", color: "bg-yellow-300" },
    { subject: "Chemistry", color: "bg-purple-300" },
    { subject: "Biology", color: "bg-pink-300" },
    { subject: "English Literature", color: "bg-indigo-300" },
    { subject: "Computer Science", color: "bg-red-300" },
]

function CourseCard({ course }: { course: (typeof courses)[0] }) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0 flex">
                <div className="relative w-1/3 aspect-square">
                     <Image src={course.image} alt={course.title} width={300} height={200} className="object-cover h-full w-full" data-ai-hint={course.imageHint} />
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

function CalendarCard() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    return (
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
             <CardContent>
                <h4 className="font-semibold mb-2 text-sm">Legend</h4>
                <div className="grid grid-cols-2 gap-2">
                    {calendarLegend.map(item => (
                        <div key={item.subject} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-xs text-muted-foreground">{item.subject}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

function OnlineUsersCard() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Online Users</CardTitle>
                <Button variant="link" size="sm">See all</Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {onlineUsers.map(user => (
                    <div key={user.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.hint} />
                                <AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default function MyCoursesPage() {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                        <p className="text-muted-foreground">Continue your learning journey.</p>
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
                    <CalendarCard />
                    <OnlineUsersCard />
                </div>
             </div>
        </div>
    )
}
