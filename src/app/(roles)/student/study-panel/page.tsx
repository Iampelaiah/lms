import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, Globe } from "lucide-react";
import Link from 'next/link';

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

const studySubjects = [
    {
        name: "Mathematics",
        description: "Explore numbers, structures, and space.",
        icon: Calculator,
        href: "/student/courses/mathematics"
    },
    {
        name: "Geography",
        description: "Discover the world and its features.",
        icon: Map,
        href: "#"
    },
    {
        name: "History",
        description: "Learn from the events of the past.",
        icon: Landmark,
        href: "/student/courses/history"
    },
    {
        name: "Accounting",
        description: "Understand financial information.",
        icon: Briefcase,
        href: "#"
    },
    {
        name: "Physics",
        description: "Uncover the laws of motion and energy.",
        icon: Atom,
        href: "#"
    },
    {
        name: "Chemistry",
        description: "Study matter and its interactions.",
        icon: Beaker,
        href: "#"
    },
    {
        name: "Biology",
        description: "Explore the science of living organisms.",
        icon: Dna,
        href: "/student/courses/science"
    },
    {
        name: "Languages",
        description: "Learn to communicate in a new tongue.",
        icon: Languages,
        href: "/student/courses/english"
    }
];

function SubjectCard({ subject }: { subject: (typeof studySubjects)[0] }) {
    return (
        <Link href={subject.href} className="group block">
            <Card className="h-full hover:border-primary transition-colors duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                         <subject.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function StudyPanelPage() {
  return (
    <div className="space-y-6">
      <SchoolHeader />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Panel</h1>
        <p className="text-muted-foreground">Select a subject to start your learning journey.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {studySubjects.map(subject => (
            <SubjectCard key={subject.name} subject={subject} />
        ))}
      </div>
    </div>
  );
}
