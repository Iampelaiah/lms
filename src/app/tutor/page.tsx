
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderPlus, PlusCircle, FilePlus, Users, Activity, FileCheck, CalendarClock, Shield } from "lucide-react";
import Link from "next/link";
import { ClassPerformance } from "@/components/app/tutor/dashboard/class-performance";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";
import { useUser } from "@/components/providers/user-context";
import { createClient } from "@/utils/supabase/client";
import { CreateCourseDialog } from "@/components/app/tutor/create-course-dialog";

const tutorTools = [
    {
        title: "Create Course",
        description: "Build a new course from scratch.",
        icon: PlusCircle,
        href: "/tutor/courses",
    },
    {
        title: "Schedule Class",
        description: "Set up a new live session for your students.",
        icon: Calendar,
        href: "/tutor/live-classes",
    },
    {
        title: "Add Resource",
        description: "Upload new materials to the library.",
        icon: FolderPlus,
        href: "/tutor/courses", 
    },
    {
        title: "Create Assignment",
        description: "Design a new assignment or quiz.",
        icon: FilePlus,
        href: "/tutor/assignments",
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
    const [stats, setStats] = React.useState({
        totalStudents: "0",
        engagementRate: "0%",
        assignmentsToGrade: "0",
        upcomingSession: "None scheduled"
    });
    const [loading, setLoading] = React.useState(true);
    const supabase = createClient();
    const { profile } = useUser();

    React.useEffect(() => {
        const fetchTutorStats = async () => {
            if (!profile?.id) return;

            // Total Students (Global or assigned to this tutor? assuming global for now)
            const { count: studentCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student');

            // Upcoming Class
            const { data: upcomingClass } = await supabase
                .from('classes')
                .select('schedule, title')
                .eq('tutor_id', profile.id)
                .or('status.eq.upcoming,status.eq.ongoing')
                .order('schedule', { ascending: true })
                .limit(1)
                .single();

            setStats({
                totalStudents: studentCount?.toString() || "0",
                engagementRate: "0%", 
                assignmentsToGrade: "0", 
                upcomingSession: upcomingClass 
                    ? `${new Date(upcomingClass.schedule).toLocaleDateString()}, ${new Date(upcomingClass.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "None scheduled"
            });
            setLoading(false);
        };

        fetchTutorStats();
    }, [profile?.id]);

    if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
    </div>;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
            <StatCard title="Engagement Rate" value={stats.engagementRate} icon={Activity} change="+5%" changeType="increase" />
            <StatCard title="Assignments to Grade" value={stats.assignmentsToGrade} icon={FileCheck} />
            <StatCard title="Upcoming Session" value={stats.upcomingSession} icon={CalendarClock} />
        </div>
    )
}

function TutorTools({ profileId }: { profileId?: string }) {
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
                            {tool.title === "Create Course" && profileId ? (
                                <CreateCourseDialog 
                                    tutorId={profileId} 
                                    trigger={<Button variant="secondary" className="w-full justify-start">Go</Button>} 
                                />
                            ) : (
                                <Button variant="secondary" className="w-full justify-start" asChild>
                                    <Link href={tool.href}>Go</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function SecurityAlert() {
    const { user } = useUser();
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google')) {
            setIsVisible(true);
        }
    }, [user]);

    if (!isVisible) return null;

    return (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Secure Your Account</p>
                        <p className="text-xs text-muted-foreground">Since you signed in with Google, we recommend setting up a permanent password for extra security.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>Later</Button>
                    <Button size="sm" asChild>
                        <Link href="/tutor/settings?tab=security">Set Password</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function TutorPage() {
    const { profile } = useUser();
    const userName = profile?.full_name || 'Tutor';

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <SecurityAlert />
             <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {userName}. Here's your overview for today.</p>
            </div>
            <TutorStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClassPerformance />
            </div>
            <TutorTools profileId={profile?.id} />
        </div>
    );
}
