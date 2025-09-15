
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";

const liveClasses = [
    {
        title: "Calculus I - Midterm Review",
        status: "Upcoming",
        time: "Tomorrow at 10:00 AM",
        students: 42,
        imageUrl: "https://picsum.photos/seed/live-class-1/600/400",
        imageHint: "calculus equation",
    },
    {
        title: "Quantum Physics - Wave-Particle Duality",
        status: "Upcoming",
        time: "In 3 days at 2:00 PM",
        students: 28,
        imageUrl: "https://picsum.photos/seed/live-class-2/600/400",
        imageHint: "quantum physics atom",
    },
     {
        title: "Intro to Shakespeare",
        status: "Ongoing",
        time: "Started 15 mins ago",
        students: 35,
        imageUrl: "https://picsum.photos/seed/live-class-3/600/400",
        imageHint: "shakespeare portrait",
    },
    {
        title: "Algebra Basics - Final Q&A",
        status: "Completed",
        time: "Yesterday at 4:00 PM",
        students: 55,
        imageUrl: "https://picsum.photos/seed/live-class-4/600/400",
        imageHint: "math chalkboard",
    }
];

const statusVariantMap: Record<string, "default" | "secondary" | "outline"> = {
    "Upcoming": "default",
    "Ongoing": "destructive",
    "Completed": "secondary",
};

function LiveClassList({ status }: { status: "Ongoing" | "Upcoming" | "Completed" }) {
    const filteredClasses = liveClasses.filter(c => c.status === status);

    if (filteredClasses.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p>No {status.toLowerCase()} classes found.</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
           {filteredClasses.map(liveClass => (
                <Card key={liveClass.title} className="overflow-hidden flex flex-col">
                    <CardHeader className="p-0 relative">
                        <Badge variant={statusVariantMap[liveClass.status]} className="absolute top-4 right-4 z-10">
                            {liveClass.status}
                        </Badge>
                        <div className="relative aspect-[3/2] w-full">
                            <Image src={liveClass.imageUrl} alt={liveClass.title} fill className="object-cover" data-ai-hint={liveClass.imageHint} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-bold">{liveClass.title}</h3>
                        <p className="text-sm text-muted-foreground">{liveClass.time}</p>
                         <div className="pt-2 text-sm text-muted-foreground flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>{liveClass.students} Students</span>
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="p-4 pt-0">
                        <Button className="w-full">
                           <Video className="mr-2 h-4 w-4" />
                           {liveClass.status === "Upcoming" ? "Start Class" : liveClass.status === "Ongoing" ? "Join Class" : "View Recording"}
                        </Button>
                    </CardFooter>
                </Card>
           ))}
        </div>
    )
}


export default function TutorLiveClassesPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                    <p className="text-muted-foreground">Schedule and manage your live classes.</p>
                </div>
                <Button asChild>
                    <Link href="#">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule New Class
                    </Link>
                </Button>
            </div>
            
            <Tabs defaultValue="upcoming">
                <TabsList>
                    <TabsTrigger value="ongoing">On going</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="ongoing" className="mt-6">
                    <LiveClassList status="Ongoing" />
                </TabsContent>
                <TabsContent value="upcoming" className="mt-6">
                    <LiveClassList status="Upcoming" />
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                    <LiveClassList status="Completed" />
                </TabsContent>
            </Tabs>

        </div>
    );
}
