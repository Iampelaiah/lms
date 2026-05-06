'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('loggedInUser');
            if (email) {
                const namePart = email.split('@')[0];
                const name = namePart.replace('.', ' ');
                setUserName(name.charAt(0).toUpperCase() + name.slice(1));
            }
        }
    }, []);

    const inviteLinks = {
        tutor: "http://drmax.online/invite/tutor-a1b2",
        student: "http://drmax.online/invite/student-g7h8",
        admin: "http://drmax.online/invite/admin-m3n4"
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome, {userName}! Oversee operations for Dr Max online school.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Tutors" value="12/50" icon={GraduationCap} href="/admin/tutors" inviteLink={inviteLinks.tutor} />
                <StatCard title="Total Students" value="450/5000" icon={Users} href="/admin/students" inviteLink={inviteLinks.student} />
                <StatCard title="Total Admins" value="3/10" icon={Crown} href="/admin/admins" inviteLink={inviteLinks.admin} />
                <StatCard title="Subscription Plan" value="Pro" icon={Settings} href="/admin/billing" />
            </div>
        </div>
    );
}
