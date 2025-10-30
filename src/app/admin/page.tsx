
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Crown, GraduationCap, Settings, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { SchoolHeader } from "@/components/app/school-header";

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    inviteLink?: string;
    href?: string;
}

function StatCard({ title, value, icon: Icon, inviteLink, href }: StatCardProps) {
    const cardContent = (
        <Card className="h-full transition-colors hover:border-primary flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
            {inviteLink && (
                <CardContent className="!pt-0">
                    <p className="text-xs text-muted-foreground mb-2">Invitation Link</p>
                     <div className="flex items-center gap-2">
                        <Input readOnly value={inviteLink} className="h-8 text-xs" />
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy link</span>
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    )

    if (href) {
        return <Link href={href} className="block h-full">{cardContent}</Link>
    }
    
    return cardContent;
}

export default function AdminDashboardPage() {
    const [userName, setUserName] = React.useState('Admin');
    const [schoolStats, setSchoolStats] = React.useState({
        tutors: "12/50",
        students: "450/5000",
        admins: "3/10",
        subscription: "Pro"
    });

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                if (email.toLowerCase().startsWith('pngarande')) {
                    setUserName('Pelaiah Ngarande');
                } else if (email.toLowerCase().startsWith('jsmith')) {
                    setUserName('John Smith');
                } else {
                    const namePart = email.split('@')[0];
                    const name = namePart.replace('.', ' ');
                    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
                }
            }
            
            const numTeachers = localStorage.getItem('numTeachers') || '50';
            const numAdmins = localStorage.getItem('numAdmins') || '10';

            setSchoolStats(prevStats => ({
                ...prevStats,
                tutors: `12/${numTeachers}`,
                admins: `3/${numAdmins}`,
            }));
        }
    }, []);

    const inviteLinks = {
        tutor: "http://localhost:3000/invite/tutor-a1b2-c3d4-e5f6",
        student: "http://localhost:3000/invite/student-g7h8-i9j0-k1l2",
        admin: "http://localhost:3000/invite/admin-m3n4-o5p6-q7r8"
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome, {userName}! Manage your school, tutors, and students.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Tutors" value={schoolStats.tutors} icon={GraduationCap} href="/admin/tutors" inviteLink={inviteLinks.tutor} />
                <StatCard title="Total Students" value={schoolStats.students} icon={Users} href="/admin/students" inviteLink={inviteLinks.student} />
                <StatCard title="Total Admins" value={schoolStats.admins} icon={Crown} href="/admin/admins" inviteLink={inviteLinks.admin} />
                <StatCard title="Subscription Plan" value={schoolStats.subscription} icon={Settings} href="/admin/billing" />
            </div>
        </div>
    );
}
