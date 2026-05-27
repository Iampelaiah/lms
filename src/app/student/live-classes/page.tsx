'use client';

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { LiveClass } from '@/lib/types';
import { Users, Video, Loader2 } from 'lucide-react';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JoinClassButton } from '@/components/classroom/JoinClassButton';
import { useUser } from '@/components/providers/user-context';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
    upcoming: 'default',
    ongoing: 'destructive',
    completed: 'secondary',
};

export default function StudentLiveClassesPage() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);
    const { profile, loading: userLoading } = useUser();
    // Stable supabase client — created once per component mount
    const supabase = useMemo(() => createClient(), []);

    const fetchClasses = useCallback(async () => {
        const { data, error } = await supabase
            .from('classes')
            .select(`
                *,
                tutor:profiles!classes_tutor_id_fkey (
                    full_name,
                    avatar_url
                )
            `)
            .order('schedule', { ascending: true });

        if (data && !error) {
            setClasses(data as any);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchClasses();

        // Subscribe to real-time changes in the classes table
        const subscription = supabase
            .channel('live-classes-status')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'classes' },
                fetchClasses
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [fetchClasses, supabase]);

    if (loading || userLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading classes...</p>
            </div>
        );
    }

    if (profile && !profile.is_approved) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Video className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                <p className="text-muted-foreground mb-6">
                    Your account is currently pending administrator approval. Once approved, you will be able to view and join live classes.
                </p>
                <Button className="bg-[#A7C957] hover:bg-[#6A994E] text-[#0A1A12] font-bold rounded-xl" asChild>
                    <Link href="/student">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                <p className="text-muted-foreground">
                    Join ongoing sessions or view recordings of past classes.
                </p>
            </div>
            {classes.length === 0 ? (
                <div className="bg-white/5 border border-dashed rounded-3xl p-12 text-center">
                    <p className="text-muted-foreground">No live classes scheduled at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {classes.map((liveClass) => (
                        <Card key={liveClass.id} className="overflow-hidden flex flex-col bg-white/5 border-white/10 hover:border-white/20 transition-all">
                            <CardHeader className="p-0 relative">
                                <Badge
                                    variant={statusVariantMap[liveClass.status]}
                                    className="absolute top-4 right-4 z-10 capitalize"
                                >
                                    {liveClass.status}
                                </Badge>
                                <div className="relative aspect-[3/2] w-full bg-black/20">
                                    {liveClass.imageUrl ? (
                                        <Image
                                            src={liveClass.imageUrl}
                                            alt={liveClass.title}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={liveClass.imageHint}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video className="w-12 h-12 text-white/10" />
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="w-6 h-6 border border-white/10">
                                        <AvatarImage src={liveClass.tutor?.avatar_url} />
                                        <AvatarFallback>{liveClass.tutor?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-white/60">{liveClass.tutor?.full_name}</span>
                                </div>
                                <h3 className="text-lg font-bold text-white/90">{liveClass.title}</h3>
                                <p className="text-sm text-white/40">
                                    {liveClass.schedule ? new Date(liveClass.schedule).toLocaleString() : 'TBD'}
                                </p>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                {liveClass.status === 'ongoing' ? (
                                    <Button className="w-full bg-[#A7C957] hover:bg-[#6A994E] text-[#0A1A12] font-bold rounded-xl py-6" asChild>
                                        <Link href={`/classroom/${liveClass.agora_channel_name || liveClass.id}?role=participant&name=${profile?.full_name || 'Guest'}`}>
                                            <Video className="mr-2 h-5 w-5" />
                                            Join Now
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button className="w-full bg-white/5 hover:bg-white/10 text-white/60 border-white/10 rounded-xl py-6" asChild>
                                        <Link href={`/student/live-classes/${liveClass.id}`}>
                                            {liveClass.status === 'upcoming' ? 'View Details' : 'View Recording'}
                                        </Link>
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
