
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderPlus, PlusCircle, FilePlus, Users, Activity, FileCheck, CalendarClock } from "lucide-react";
import Link from "next/link";
import { ClassPerformance } from "@/components/app/tutor/dashboard/class-performance";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";

const tutorTools = [
    {
        title: "Create Course",
        description: "Build a new course from scratch.",
        icon: PlusCircle,
        href: "#",
    },
    {
        title: "Schedule Class",
        description: "Set up a new live session for your students.",
        icon: Calendar,
        href: "#",
    },
    {
        title: "Add Resource",
        description: "Upload new materials to the library.",
        icon: FolderPlus,
        href: "#",
    },
    {
        title: "Create Assignment",
        description: "Design a new assignment or quiz.",
        icon: FilePlus,
        href: "#",
    }
]

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

function StatCard({ title, value, icon: Icon, change, changeType }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {change} from last week
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

function TutorStats() {
    const stats = {
        totalStudents: "150",
        engagementRate: "82%",
        assignmentsToGrade: "12",
        upcomingSession: "Tomorrow, 10 AM"
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
            <StatCard title="Engagement Rate" value={stats.engagementRate} icon={Activity} change="+5%" changeType="increase" />
            <StatCard title="Assignments to Grade" value={stats.assignmentsToGrade} icon={FileCheck} />
            <StatCard title="Upcoming Session" value={stats.upcomingSession} icon={CalendarClock} />
        </div>
    )
}

function TutorTools() {
    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Tutor Tools</h2>
            <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-4">
                {tutorTools.map((tool) => (
                    <Card key={tool.title} className="flex flex-col">
                        <CardHeader className="flex-grow">
                             <div className="bg-primary/10 p-3 rounded-lg w-min mb-4">
                                <tool.icon className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>{tool.title}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link href={tool.href}>Go</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function TutorPage() {
    const [userName, setUserName] = React.useState('Tutor');

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                if (email.toLowerCase().startsWith('e.reed')) {
                    setUserName('Dr. Reed');
                } else {
                    const namePart = email.split('@')[0];
                    const name = namePart.replace('.', ' ');
                    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
                }
            }
        }
    }, []);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
             <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {userName}. Here's your overview for today.</p>
            </div>
            <TutorStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClassPerformance />
            </div>
            <TutorTools />
        </div>
    );
}
