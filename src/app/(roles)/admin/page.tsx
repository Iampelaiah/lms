import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Crown, GraduationCap, Settings, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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

function InvitationCard() {
    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>Your Tutor Invitation Link</CardTitle>
                <CardDescription>
                    Share this unique link with your tutors to have them join your school on LearnetIQ. This card will disappear once all 25 tutor slots are filled.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    <Input readOnly value="http://localhost:3000/invite/d3f4a1b2c3d4e5f6a7b8c9d0e1f2a3b4" />
                    <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy link</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

type StatCardProps = {
    title: string;
    value: string;
    icon: React.ElementType;
    href?: string;
}

function StatCard({ title, value, icon: Icon, href }: StatCardProps) {
    const cardContent = (
        <Card className="h-full transition-colors hover:border-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )

    if (href) {
        return <Link href={href} className="block h-full">{cardContent}</Link>
    }
    
    return cardContent;
}

export default function AdminDashboardPage() {
    // These values would typically come from a database based on the signup process.
    const schoolStats = {
        tutors: "12/50",
        students: "450",
        admins: "3/10",
        subscription: "Pro"
    };

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">School Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome, Jane Doe! Manage your school, tutors, and students.</p>
            </div>
            
            <InvitationCard />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Tutors" value={schoolStats.tutors} icon={GraduationCap} href="/admin/tutors" />
                <StatCard title="Total Students" value={schoolStats.students} icon={Users} href="/admin/students" />
                <StatCard title="Total Admins" value={schoolStats.admins} icon={Crown} href="/admin/admins" />
                <StatCard title="Subscription Plan" value={schoolStats.subscription} icon={Settings} />
            </div>
        </div>
    );
}