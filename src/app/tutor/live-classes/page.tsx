'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Users, Video, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/providers/user-context";
import { useEffect, useState } from "react";
import { ScheduleClassDialog } from "@/components/app/tutor/schedule-class-dialog";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
    "upcoming": "default",
    "ongoing": "destructive",
    "completed": "secondary",
};

function LiveClassList({ status, classes }: { status: string, classes: any[] }) {
    const filteredClasses = classes.filter(c => c.status === status);

    if (filteredClasses.length === 0) {
        return (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-3xl">
                <p className="text-muted-foreground">No {status} classes found.</p>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredClasses.map(liveClass => (
                <Card key={liveClass.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-all shadow-sm">
                    <CardHeader className="p-0 relative">
                        <Badge variant={statusVariantMap[liveClass.status]} className="absolute top-4 right-4 z-10 capitalize">
                            {liveClass.status}
                        </Badge>
                        <div className="relative aspect-[3/2] w-full bg-muted">
                            {liveClass.imageUrl ? (
                                <Image src={liveClass.imageUrl} alt={liveClass.title} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Video className="w-12 h-12 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow space-y-2">
                        <h3 className="text-lg font-bold truncate">{liveClass.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <CalendarPlus className="w-4 h-4" />
                            {liveClass.schedule ? new Date(liveClass.schedule).toLocaleString() : 'TBD'}
                        </p>
                    </CardContent>
                     <CardFooter className="p-4 pt-0">
                         <Button className="w-full rounded-xl py-6" asChild variant={liveClass.status === "ongoing" ? "destructive" : "default"}>
                            <Link href={`/classroom/${liveClass.id}?role=host`}>
                               <Video className="mr-2 h-4 w-4" />
                               {liveClass.status === "completed" ? "View Recording" : liveClass.status === "ongoing" ? "Join Now" : "Start Class"}
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

    const fetchClasses = async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('tutor_id', profile.id)
                .order('schedule', { ascending: true });

            if (data && !error) {
                setClasses(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [profile?.id]);

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <SchoolHeader />
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                    <p className="text-muted-foreground">Schedule and manage your live sessions for students.</p>
                </div>
                <ScheduleClassDialog 
                    tutorId={profile?.id || ''} 
                    onClassScheduled={fetchClasses}
                    trigger={
                        <Button className="bg-[#00FFCC] hover:bg-[#00DDAA] text-black font-bold h-12 px-6">
                            <CalendarPlus className="mr-2 h-5 w-5" />
                            Schedule New Class
                        </Button>
                    }
                />
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full max-w-md bg-muted/50 p-1">
                        <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ongoing" className="mt-8">
                        <LiveClassList status="ongoing" classes={classes} />
                    </TabsContent>
                    <TabsContent value="upcoming" className="mt-8">
                        <LiveClassList status="upcoming" classes={classes} />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-8">
                        <LiveClassList status="completed" classes={classes} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
