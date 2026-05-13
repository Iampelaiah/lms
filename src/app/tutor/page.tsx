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
import { ScheduleClassDialog } from "@/components/app/tutor/schedule-class-dialog";
import { motion } from "framer-motion";
import { RecentActivity } from "@/components/app/tutor/dashboard/recent-activity";
import { UpcomingClasses } from "@/components/app/tutor/dashboard/upcoming-classes";
import { useRouter } from "next/navigation";

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

    const fetchTutorStats = async () => {
        if (!profile?.id) {
            setLoading(false);
            return;
        }

        try {
            // Run both Supabase queries in parallel — cuts wait time roughly in half.
            const [{ count: studentCount }, { data: upcomingClass }] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'student'),
                supabase
                    .from('classes')
                    .select('schedule, title')
                    .eq('tutor_id', profile.id)
                    .or('status.eq.upcoming,status.eq.ongoing')
                    .order('schedule', { ascending: true })
                    .limit(1)
                    .single(),
            ]);

            setStats({
                totalStudents: studentCount?.toString() || "0",
                engagementRate: "78%",
                assignmentsToGrade: "12",
                upcomingSession: upcomingClass
                    ? `${new Date(upcomingClass.schedule).toLocaleDateString()}, ${new Date(upcomingClass.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : "None scheduled"
            });
        } catch (err) {
            console.error('Error fetching tutor stats:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTutorStats();
    }, [profile?.id]);

    if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>;

    const cards = [
        { title: "Total Students", value: stats.totalStudents, icon: Users },
        { title: "Engagement Rate", value: stats.engagementRate, icon: Activity, change: "+5%", changeType: "increase" as const },
        { title: "Assignments to Grade", value: stats.assignmentsToGrade, icon: FileCheck },
        { title: "Upcoming Session", value: stats.upcomingSession, icon: CalendarClock },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <StatCard {...card} />
                </motion.div>
            ))}
        </div>
    );
}

function TutorTools({ profileId }: { profileId?: string }) {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tutorTools.map((tool, index) => (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                            <CardHeader className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                        <tool.icon className="w-5 h-5" />
                                    </div>
                                    <CardTitle className="text-base">{tool.title}</CardTitle>
                                </div>
                                <CardDescription className="text-xs mt-2">{tool.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                {tool.title === "Create Course" && profileId ? (
                                    <CreateCourseDialog 
                                        tutorId={profileId} 
                                        trigger={<Button variant="ghost" size="sm" className="w-full text-xs">Execute Action</Button>} 
                                    />
                                ) : tool.title === "Schedule Class" && profileId ? (
                                    <ScheduleClassDialog 
                                        tutorId={profileId} 
                                        trigger={<Button variant="ghost" size="sm" className="w-full text-xs">Execute Action</Button>} 
                                    />
                                ) : (
                                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                                        <Link href={tool.href}>Execute Action</Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
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
    const { profile, loading } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && profile && profile.role !== 'tutor') {
            router.push(`/${profile.role}`);
        }
    }, [profile, loading, router]);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
    if (profile && profile.role !== 'tutor') return null;

    const userName = profile?.full_name || 'Tutor';

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
            <SchoolHeader />
            <SecurityAlert />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Tutor Dashboard
                    </h1>
                    <p className="text-muted-foreground">Welcome back, {userName}. Here's what's happening with your classes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-full" asChild><Link href="/tutor/live-classes">View Schedule</Link></Button>
                    <ScheduleClassDialog 
                        tutorId={profile?.id || ''} 
                        trigger={<Button className="rounded-full shadow-lg shadow-primary/20">Schedule Class</Button>}
                    />
                </div>
            </div>

            <TutorStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <UpcomingClasses tutorId={profile?.id} />
                    <ClassPerformance tutorId={profile?.id} />
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <RecentActivity tutorId={profile?.id} />
                </div>
            </div>

            <TutorTools profileId={profile?.id} />
        </div>
    );
}
