
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderPlus, PlusCircle, FilePlus } from "lucide-react";
import Link from "next/link";

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

const tutorTools = [
    {
        title: "Create Course",
        description: "Build a new course from scratch.",
        icon: PlusCircle,
        href: "#",
    },
    {
        title: "Schedule Class",
        description: "Set up a new live session for your students.",
        icon: Calendar,
        href: "#",
    },
    {
        title: "Add Resource",
        description: "Upload new materials to the library.",
        icon: FolderPlus,
        href: "#",
    },
    {
        title: "Create Assignment",
        description: "Design a new assignment or quiz.",
        icon: FilePlus,
        href: "#",
    }
]

function TutorTools() {
    return (
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Tutor Tools</h2>
            <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-4">
                {tutorTools.map((tool) => (
                    <Card key={tool.title} className="flex flex-col">
                        <CardHeader className="flex-grow">
                             <div className="bg-primary/10 p-3 rounded-lg w-min mb-4">
                                <tool.icon className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>{tool.title}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" className="w-full justify-start" asChild>
                                <Link href={tool.href}>Go</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default function TutorPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
             <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, Dr. Reed. Here's your overview for today.</p>
            </div>
            <TutorTools />
        </div>
    );
}
