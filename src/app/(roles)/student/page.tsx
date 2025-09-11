'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { studentData } from '@/lib/data';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { SubjectProgressCard } from "@/components/app/student/dashboard/subject-progress-card";

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

function AiStudyPanel() {
  return (
    <Card className="bg-secondary/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-primary/10 p-3 rounded-full">
                <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-grow">
                <h3 className="text-xl font-bold">AI-Powered Study Panel</h3>
                <p className="text-muted-foreground">Choose a subject to get key concepts, resources, and answers from your AI Study Buddy.</p>
            </div>
            <Button asChild size="lg">
                <Link href="#">Go to Study Panel</Link>
            </Button>
        </CardContent>
    </Card>
  )
}


export default function StudentDashboardPage() {
  const subjectsWithProgress = [
    { name: 'Mathematics', overallProgress: 75, icon: 'BookOpen', topics: [
        { name: 'Algebra', progress: 90 },
        { name: 'Geometry', progress: 60 },
        { name: 'Calculus', progress: 75 },
        { name: 'Trigonometry', progress: 80 },
        { name: 'Statistics', progress: 85 }
    ]},
    { name: 'Physics', overallProgress: 60, icon: 'BookOpen', topics: [
        { name: 'Mechanics', progress: 70 },
        { name: 'Thermodynamics', progress: 50 },
        { name: 'Electromagnetism', progress: 65 }
    ]},
    { name: 'History', overallProgress: 88, icon: 'BookOpen', topics: [
        { name: 'World War II', progress: 80 },
        { name: 'The Cold War', progress: 92 },
        { name: 'The Renaissance', progress: 85 }
    ]},
  ]
  return (
    <div className="space-y-6">
        <SchoolHeader />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {studentData.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your learning snapshot for today. Keep up the great work!
        </p>
      </div>

     <AiStudyPanel />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjectsWithProgress.map(subject => (
            <SubjectProgressCard key={subject.name} subject={subject} />
        ))}
      </div>

    </div>
  );
}