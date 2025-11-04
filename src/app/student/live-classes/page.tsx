
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { liveClasses } from '@/lib/data';
import { Users, Video } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'destructive'> = {
    Upcoming: 'default',
    Ongoing: 'destructive',
    Completed: 'secondary',
};

export default function StudentLiveClassesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Live Classes</h1>
                <p className="text-muted-foreground">
                    Join ongoing sessions or view recordings of past classes.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveClasses.map((liveClass) => (
                    <Card key={liveClass.id} className="overflow-hidden flex flex-col">
                        <CardHeader className="p-0 relative">
                            <Badge
                                variant={statusVariantMap[liveClass.status]}
                                className="absolute top-4 right-4 z-10"
                            >
                                {liveClass.status}
                            </Badge>
                            <div className="relative aspect-[3/2] w-full">
                                <Image
                                    src={liveClass.imageUrl}
                                    alt={liveClass.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={liveClass.imageHint}
                                />
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
                             <Button className="w-full" asChild>
                                <Link href={`/student/live-classes/${liveClass.id}`}>
                                    <Video className="mr-2 h-4 w-4" />
                                    {liveClass.status === 'Upcoming'
                                        ? 'View Details'
                                        : liveClass.status === 'Ongoing'
                                        ? 'Join Class'
                                        : 'View Recording'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
