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
import { BrainCircuit, Lightbulb, Video, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { DetailedProgressCard } from "@/components/app/student/dashboard/subject-progress-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

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

function AiTutorAssistant() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-md">
            <Lightbulb className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <CardTitle>AI Tutor Assistant</CardTitle>
            <CardDescription>Get personalized learning resource recommendations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Grade Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">Grade 9</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="11">Grade 11</SelectItem>
              <SelectItem value="12">Grade 12</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="history">History</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}

function UpcomingLiveClass() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-md">
            <Video className="w-6 h-6 text-blue-500" />
          </div>
          <CardTitle>Upcoming Live Class</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-[3/2] rounded-lg overflow-hidden">
          <Image src="https://picsum.photos/seed/live-class-card/600/400" alt="Live class thumbnail" width={600} height={400} className="object-cover w-full h-full" data-ai-hint="online lecture" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Intro to Quantum Physics</h3>
          <p className="text-sm text-muted-foreground">with Prof. Alistair Finch</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>3:00 PM - 4:00 PM</span>
          </div>
        </div>
        <Button className="w-full">
          Join Class
        </Button>
      </CardContent>
    </Card>
  )
}


export default function StudentDashboardPage() {
  const subjectsWithProgress = [
    { name: 'Mathematics', overallProgress: 75, icon: 'BookOpen', topics: [
        { name: 'Algebra II', progress: 90 },
        { name: 'Geometry Proofs', progress: 60 },
        { name: 'Intro to Calculus', progress: 75 },
        { name: 'Advanced Trigonometry', progress: 80 },
        { name: 'Probability & Statistics', progress: 65 }
    ]},
    { name: 'Physics', overallProgress: 60, icon: 'BookOpen', topics: [
        { name: 'Kinematics', progress: 70 },
        { name: 'Thermodynamics', progress: 50 },
        { name: 'Electromagnetism', progress: 65 },
        { name: 'Quantum Mechanics', progress: 45 },
        { name: 'Optics', progress: 75 }
    ]},
    { name: 'History', overallProgress: 88, icon: 'BookOpen', topics: [
        { name: 'The American Revolution', progress: 95 },
        { name: 'The Roman Empire', progress: 88 },
        { name: 'The Renaissance Period', progress: 85 },
        { name: 'World War I', progress: 92 },
        { name: 'The Cold War Era', progress: 80 }
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
        {subjectsWithProgress.map((subject, index) => (
            <DetailedProgressCard 
                key={subject.name} 
                subject={subject.name}
                overallProgress={subject.overallProgress}
                topics={subject.topics}
                autoplayDelay={2000 + index * 500}
            />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <AiTutorAssistant />
        </div>
        <div>
            <UpcomingLiveClass />
        </div>
      </div>

    </div>
  );
}
