import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Map, Landmark, Briefcase, Atom, Beaker, Dna, Languages, FlaskConical, Building2, Network, Dumbbell, TrendingUp, BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor, DraftingCompass, Palette, MessageCircle, Scale, Lightbulb, BookCopy } from "lucide-react";
import Link from 'next/link';
import { SchoolHeader } from "@/components/app/school-header";

const studySubjects = [
    {
        name: "English Language",
        description: "Reading, writing, and communication.",
        icon: BookOpenText,
        href: "/student/courses/english"
    },
    {
        name: "Mathematics",
        description: "Numbers, algebra, and geometry.",
        icon: Calculator,
        href: "/student/courses/mathematics"
    },
    {
        name: "Additional Mathematics",
        description: "Advanced calculus, vectors, and stats.",
        icon: Cpu,
        href: "/student/courses/additional-mathematics"
    },
    {
        name: "Biology",
        description: "Study of life, cells, and ecosystems.",
        icon: Dna,
        href: "/student/courses/biology"
    },
    {
        name: "History",
        description: "Heritage and economic history of Zimbabwe.",
        icon: Landmark,
        href: "/student/courses/history"
    },
    {
        name: "Chemistry",
        description: "Atomic structure and chemical reactions.",
        icon: Beaker,
        href: "/student/courses/chemistry"
    },
    {
        name: "Geography",
        description: "Map work, physical and human geography.",
        icon: Map,
        href: "/student/courses/geography"
    },
    {
        name: "Commerce",
        description: "Business, trade, and financial literacy.",
        icon: Store,
        href: "/student/courses/commerce"
    },
    {
        name: "Principles of Accounting",
        description: "Bookkeeping and financial statements.",
        icon: Scale,
        href: "/student/courses/principles-of-accounting"
    },
    {
        name: "Business Enterprise and Skills",
        description: "Entrepreneurship and business planning.",
        icon: Lightbulb,
        href: "/student/courses/business-enterprise-skills"
    },
    {
        name: "Literature in Indigenous Languages",
        description: "Prose, poetry, and drama in Shona.",
        icon: BookCopy,
        href: "/student/courses/literature-in-indigenous-languages"
    },
    {
        name: "Indigenous Languages (Shona)",
        description: "Language structure and cultural aspects.",
        icon: Languages,
        href: "/student/courses/indigenous-languages"
    },
     {
        name: "Computer Science",
        description: "Programming, networking, and systems.",
        icon: Cpu,
        href: "/student/courses/computer-science"
    },
    {
        name: "Science",
        description: "Investigate the natural and physical world.",
        icon: FlaskConical,
        href: "/student/courses/science"
    },
    {
        name: "Business studies",
        description: "Learn the principles of business.",
        icon: Building2,
        href: "#"
    },
    {
        name: "Physics",
        description: "Explore matter, energy, and forces.",
        icon: Atom,
        href: "#"
    },
    {
        name: "ICT",
        description: "Dive into information and communication.",
        icon: Network,
        href: "#"
    },
    {
        name: "Physical Education",
        description: "Engage in physical activity and sport.",
        icon: Dumbbell,
        href: "#"
    },
    {
        name: "Economics",
        description: "Analyze production, distribution, and consumption.",
        icon: TrendingUp,
        href: "#"
    },
    {
        name: "Performing arts",
        description: "Express creativity through performance.",
        icon: Theater,
        href: "#"
    },
    {
        name: "Religious studies",
        description: "Examine different beliefs and religions.",
        icon: ScrollText,
        href: "#"
    },
    {
        name: "Sociology",
        description: "Study social behavior and society.",
        icon: Users,
        href: "#"
    },
    {
        name: "Agriculture",
        description: "Learn about farming and cultivation.",
        icon: Tractor,
        href: "#"
    },
    {
        name: "Design and Technology",
        description: "Create and innovate with technology.",
        icon: DraftingCompass,
        href: "#"
    },
    {
        name: "Visual Arts",
        description: "Express ideas through visual mediums.",
        icon: Palette,
        href: "#"
    },
    {
        name: "Business English",
        description: "Master English for the professional world.",
        icon: MessageCircle,
        href: "/student/courses/english"
    },
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
