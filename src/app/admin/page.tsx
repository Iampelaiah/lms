'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Crown, GraduationCap, Settings, Users, Database, ShieldAlert, CheckCircle, XCircle, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";
import { Area, AreaChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// --- Mock Data for Charts ---
const activityData = [
  { name: 'Mon', students: 400, tutors: 240 },
  { name: 'Tue', students: 300, tutors: 139 },
  { name: 'Wed', students: 200, tutors: 980 },
  { name: 'Thu', students: 278, tutors: 390 },
  { name: 'Fri', students: 189, tutors: 480 },
  { name: 'Sat', students: 239, tutors: 380 },
  { name: 'Sun', students: 349, tutors: 430 },
];

const roleDistribution = [
  { name: 'Students', value: 450, color: 'hsl(var(--primary))' },
  { name: 'Tutors', value: 50, color: 'hsl(var(--chart-2))' },
  { name: 'Admins', value: 10, color: 'hsl(var(--chart-3))' },
  { name: 'Parents', value: 120, color: 'hsl(var(--chart-4))' },
];

// --- Components ---
type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: { value: string; positive: boolean };
    description?: string;
    href?: string;
}

function StatCard({ title, value, icon: Icon, trend, description, href }: StatCardProps) {
    const cardContent = (
        <Card className="h-full transition-colors hover:border-primary flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <div className="flex items-center text-xs mt-1">
                        {trend.positive ? (
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                        ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={trend.positive ? "text-emerald-500" : "text-red-500"}>
                            {trend.value}
                        </span>
                        <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                )}
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    )

    if (href) {
        return <Link href={href} className="block h-full">{cardContent}</Link>
    }
    
    return cardContent;
}

export default function AdminDashboardPage() {
    const [userName, setUserName] = React.useState('Admin');
    const [stats, setStats] = React.useState({ totalUsers: 0, pendingUsers: 0, activeCourses: 0 });
    const [pendingProfiles, setPendingProfiles] = React.useState<any[]>([]);
    // Stable client reference — never recreated on re-render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                const namePart = email.split('@')[0];
                const name = namePart.replace('.', ' ');
                setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            }
        }
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        // Run all three queries in parallel — 3x faster than sequential awaits
        const [usersResult, pendingResult, coursesResult] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('id, full_name, role, updated_at, is_approved').eq('is_approved', false),
            supabase.from('courses').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
            totalUsers: usersResult.count || 0,
            pendingUsers: pendingResult.data?.length || 0,
            activeCourses: coursesResult.count || 0,
        });

        if (pendingResult.data) {
            setPendingProfiles(pendingResult.data);
        }
    }

    const handleApproveUser = async (userId: string, isApproving: boolean) => {
        if (isApproving) {
            // Optimistic update — remove from pending list immediately
            setPendingProfiles(prev => prev.filter(p => p.id !== userId));
            setStats(prev => ({ ...prev, pendingUsers: Math.max(0, prev.pendingUsers - 1) }));

            const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
            if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                fetchDashboardData(); // Revert on error
            } else {
                toast({ title: "User Approved", description: "The user has been granted access." });
            }
        } else {
            // Optimistic update
            setPendingProfiles(prev => prev.filter(p => p.id !== userId));
            setStats(prev => ({ ...prev, pendingUsers: Math.max(0, prev.pendingUsers - 1), totalUsers: Math.max(0, prev.totalUsers - 1) }));

            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
                fetchDashboardData(); // Revert on error
            } else {
                toast({ title: "User Rejected", description: "The user's profile has been removed." });
            }
        }
    };

    const handleApproveCourse = () => {
        toast({ title: "Feature In Progress", description: "We need to add an 'is_approved' column to your courses table first!" });
    };

    // Mock data for pending courses since `is_approved` doesn't exist on courses table yet
    const pendingCourses = [
        { id: '1', title: 'Advanced Calculus', tutor: 'Dr. Smith', date: 'Oct 29, 2026', type: 'Course' },
        { id: '2', title: 'Intro to Quantum Physics', tutor: 'Prof. Johnson', date: 'Oct 31, 2026', type: 'Course' },
    ];

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Real-Time Platform Overview</h1>
                    <p className="text-muted-foreground">Welcome, {userName}! Manage operations, users, and platform health.</p>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" onClick={fetchDashboardData}><Database className="mr-2 h-4 w-4" /> Refresh Data</Button>
                </div>
            </div>

            {/* TOP METRIC CARDS */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Registered Users" 
                    value={stats.totalUsers.toString()} 
                    icon={Users} 
                    trend={{ value: '+12%', positive: true }} 
                    href="/admin/students" 
                />
                <StatCard 
                    title="Pending Approvals" 
                    value={stats.pendingUsers.toString()} 
                    icon={ShieldAlert} 
                    trend={{ value: '-5%', positive: true }} 
                    description="Users waiting for access"
                />
                <StatCard 
                    title="Active Courses" 
                    value={stats.activeCourses.toString()} 
                    icon={FileText} 
                    trend={{ value: '+3%', positive: true }} 
                />
                <Card className="h-full transition-colors hover:border-primary flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                        <div className="text-2xl font-bold">450 GB <span className="text-sm font-normal text-muted-foreground">/ 1 TB</span></div>
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-muted-foreground">Platform media & resources</p>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
                        <CardDescription>Daily active students and tutors on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTutors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Area type="monotone" dataKey="students" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorStudents)" />
                                <Area type="monotone" dataKey="tutors" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorTutors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>Breakdown of all registered platform users.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 text-sm hidden lg:flex">
                            {roleDistribution.map((role) => (
                                <div key={role.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                                    <span>{role.name} ({role.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PENDING ACTIONS ROW */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Administrative Actions</CardTitle>
                    <CardDescription>Review and approve new users or course publications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="users">User Approvals ({pendingProfiles.length})</TabsTrigger>
                            <TabsTrigger value="courses">Course Approvals ({pendingCourses.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="users">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Requested Role</TableHead>
                                        <TableHead>Date Created</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingProfiles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users waiting for approval.</TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingProfiles.map((profile) => (
                                            <TableRow key={profile.id}>
                                                <TableCell><Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">Pending</Badge></TableCell>
                                                <TableCell className="font-medium">{profile.full_name || 'Unnamed User'}</TableCell>
                                                <TableCell className="capitalize">{profile.role}</TableCell>
                                                <TableCell>{new Date(profile.updated_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" onClick={() => handleApproveUser(profile.id, true)}><CheckCircle className="mr-1 h-3 w-3"/> Approve</Button>
                                                        <Button size="sm" variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10" onClick={() => handleApproveUser(profile.id, false)}><XCircle className="mr-1 h-3 w-3"/> Reject</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="courses">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Course Title</TableHead>
                                        <TableHead>Tutor Name</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell><Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/10">Review</Badge></TableCell>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>{course.tutor}</TableCell>
                                            <TableCell>{course.date}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={handleApproveCourse}><FileText className="mr-1 h-3 w-3"/> View Course</Button>
                                                    <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10" onClick={handleApproveCourse}><CheckCircle className="mr-1 h-3 w-3"/> Approve</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
