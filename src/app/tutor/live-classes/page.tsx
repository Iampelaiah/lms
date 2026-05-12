'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Users, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { JoinClassButton } from "@/components/classroom/JoinClassButton";

import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/providers/user-context";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
    "upcoming": "default",
    "ongoing": "destructive",
    "completed": "secondary",
};

function LiveClassList({ status, classes }: { status: string, classes: any[] }) {
    const filteredClasses = classes.filter(c => c.status === status);

    if (filteredClasses.length === 0) {
        return (
            <div className="text-center py-16 bg-white/5 border border-dashed rounded-3xl">
                <p className="text-muted-foreground">No {status} classes found.</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
           {filteredClasses.map(liveClass => (
                <Card key={liveClass.id} className="overflow-hidden flex flex-col bg-white/5 border-white/10 hover:border-white/20 transition-all">
                    <CardHeader className="p-0 relative">
                        <Badge variant={statusVariantMap[liveClass.status]} className="absolute top-4 right-4 z-10 capitalize">
                            {liveClass.status}
                        </Badge>
                        <div className="relative aspect-[3/2] w-full bg-black/20">
                            {liveClass.imageUrl ? (
                                <Image src={liveClass.imageUrl} alt={liveClass.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Video className="w-12 h-12 text-white/10" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-bold text-white/90">{liveClass.title}</h3>
                        <p className="text-sm text-white/40">
                            {liveClass.schedule ? new Date(liveClass.schedule).toLocaleString() : 'TBD'}
                        </p>
                    </CardContent>
                     <CardFooter className="p-4 pt-0">
                         <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-xl py-6" asChild>
                            <Link href={`/classroom/${liveClass.id}?role=host`}>
                               <Video className="mr-2 h-4 w-4" />
                               {liveClass.status === "completed" ? "View Recording" : "Start Class"}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
           ))}
        </div>
    )
}


export default function TutorLiveClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useUser();
    const supabase = createClient();

    useEffect(() => {
        const fetchClasses = async () => {
            if (!profile?.id) return;
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('tutor_id', profile.id)
                .order('schedule', { ascending: true });

            if (data && !error) {
                setClasses(data);
            }
            setLoading(false);
        };

        fetchClasses();
    }, [profile?.id]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                    <p className="text-muted-foreground">Schedule and manage your live classes.</p>
                </div>
                <Button asChild className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-bold">
                    <Link href="#">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule New Class
                    </Link>
                </Button>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="upcoming">
                    <TabsList className="bg-white/5 border-white/10">
                        <TabsTrigger value="ongoing">On going</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ongoing" className="mt-6">
                        <LiveClassList status="ongoing" classes={classes} />
                    </TabsContent>
                    <TabsContent value="upcoming" className="mt-6">
                        <LiveClassList status="upcoming" classes={classes} />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-6">
                        <LiveClassList status="completed" classes={classes} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
