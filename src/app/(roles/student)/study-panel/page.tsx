import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, Globe, FlaskConical, Building2, Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor, DraftingCompass, Palette, MessageCircle, LanguagesIcon } from "lucide-react";
import Link from 'next/link';
import { SchoolHeader } from "@/components/app/school-header";

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
        href: "/student/courses/Geography"
    },
    {
        name: "History",
        description: "Learn from the events of the past.",
        icon: Landmark,
        href: "/student/courses/History"
    },
    {
        name: "Accounting",
        description: "Understand financial information.",
        icon: Briefcase,
        href: "/student/courses/Accounting"
    },
    {
        name: "Science",
        description: "Investigate the natural and physical world.",
        icon: FlaskConical,
        href: "/student/courses/Science"
    },
    {
        name: "Biology",
        description: "Study life and living organisms.",
        icon: Dna,
        href: "/student/courses/Biology"
    },
    {
        name: "Business studies",
        description: "Learn the principles of business.",
        icon: Building2,
        href: "/student/courses/Business studies"
    },
    {
        name: "Physics",
        description: "Explore matter, energy, and forces.",
        icon: Atom,
        href: "/student/courses/Physics"
    },
    {
        name: "ICT",
        description: "Dive into information and communication.",
        icon: Network,
        href: "/student/courses/ICT"
    },
    {
        name: "Physical Education",
        description: "Engage in physical activity and sport.",
        icon: Dumbbell,
        href: "/student/courses/Physical Education"
    },
    {
        name: "Chemistry",
        description: "Study substances and their properties.",
        icon: Beaker,
        href: "/student/courses/Chemistry"
    },
    {
        name: "Economics",
        description: "Analyze production, distribution, and consumption.",
        icon: TrendingUp,
        href: "/student/courses/Economics"
    },
    {
        name: "English Literature",
        description: "Explore classic and modern literary works.",
        icon: BookOpenText,
        href: "/student/courses/English Literature"
    },
    {
        name: "Commerce",
        description: "Learn about trade and business activities.",
        icon: Store,
        href: "/student/courses/Commerce"
    },
    {
        name: "Computer Science",
        description: "Delve into computation and information.",
        icon: Cpu,
        href: "/student/courses/Computer Science"
    },
    {
        name: "Performing arts",
        description: "Express creativity through performance.",
        icon: Theater,
        href: "/student/courses/Performing arts"
    },
    {
        name: "Religious studies",
        description: "Examine different beliefs and religions.",
        icon: ScrollText,
        href: "/student/courses/Religious studies"
    },
    {
        name: "Sociology",
        description: "Study social behavior and society.",
        icon: Users,
        href: "/student/courses/Sociology"
    },
    {
        name: "Agriculture",
        description: "Learn about farming and cultivation.",
        icon: Tractor,
        href: "/student/courses/Agriculture"
    },
    {
        name: "Design and Technology",
        description: "Create and innovate with technology.",
        icon: DraftingCompass,
        href: "/student/courses/Design and Technology"
    },
    {
        name: "Visual Arts",
        description: "Express ideas through visual mediums.",
        icon: Palette,
        href: "/student/courses/Visual Arts"
    },
    {
        name: "Business English",
        description: "Master English for the professional world.",
        icon: MessageCircle,
        href: "/student/courses/Business English"
    },
    {
        name: "Shona",
        description: "Learn the language and culture of the Shona people.",
        icon: Languages,
        href: "/student/courses/Shona"
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
