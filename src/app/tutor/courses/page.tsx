'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { BookOpenCheck, PlusCircle, Users, Eye, Settings, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useUser } from "@/components/providers/user-context";
import { CreateCourseDialog } from "@/components/app/tutor/create-course-dialog";

const statusColorMap: Record<string, string> = {
    "Published": "bg-blue-500 hover:bg-blue-600",
    "Pending Review": "bg-yellow-500 text-yellow-900 hover:bg-yellow-600",
};

function CourseList({ tutorId }: { tutorId: string }) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchCourses = async () => {
        if (!tutorId) return;
        const { data } = await supabase
            .from('courses')
            .select(`
                *,
                lessons (id),
                enrollments (id)
            `)
            .eq('tutor_id', tutorId)
            .order('created_at', { ascending: false });
        
        if (data) setCourses(data);
        setLoading(false);
    };

    useEffect(() => {
        if (tutorId) {
            fetchCourses();

            // Real-time subscription
            const channel = supabase
                .channel(`tutor-courses-${tutorId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'courses',
                    filter: `tutor_id=eq.${tutorId}`
                }, () => {
                    fetchCourses();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [tutorId]);

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CreateCourseDialog 
                    tutorId={tutorId} 
                    onCourseCreated={fetchCourses} 
                    trigger={
                        <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors group h-full min-h-[300px]">
                            <div className="bg-primary/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                                <PlusCircle className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="mt-4 font-bold text-lg">Create New Course</h3>
                        </Card>
                    }
                />
                {[1, 2].map(i => (
                    <Card key={i} className="animate-pulse">
                        <div className="aspect-[3/2] bg-muted w-full" />
                        <div className="p-4 space-y-2">
                            <div className="h-6 w-3/4 bg-muted rounded" />
                            <div className="h-4 w-1/2 bg-muted rounded" />
                        </div>
                    </Card>
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <Card className="p-16 text-center border-dashed">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-primary/5 p-4 rounded-full">
                        <PlusCircle className="h-12 w-12 text-primary/20" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">No courses created yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            You haven't added any learning materials. Start by creating your first course and adding lessons.
                        </p>
                    </div>
                    <CreateCourseDialog tutorId={tutorId} onCourseCreated={fetchCourses} />
                </div>
            </Card>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CreateCourseDialog 
                tutorId={tutorId} 
                onCourseCreated={fetchCourses} 
                trigger={
                    <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors group h-full min-h-[300px]">
                        <div className="bg-primary/5 p-4 rounded-full group-hover:scale-110 transition-transform">
                            <PlusCircle className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="mt-4 font-bold text-lg">Create New Course</h3>
                        <p className="text-sm text-muted-foreground text-center mt-2 px-4">
                            Start building your curriculum and adding lessons.
                        </p>
                    </Card>
                }
            />
            {courses.map(course => (
                <Card key={course.id} className="overflow-hidden flex flex-col">
                    <CardHeader className="p-0 relative">
                        <Badge className={`absolute top-4 right-4 z-10 ${statusColorMap[course.status] || 'bg-blue-500'}`}>
                            {course.status}
                        </Badge>
                        <div className="relative aspect-[3/2] w-full bg-muted">
                            {course.image_url ? (
                                <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <h3 className="text-lg font-bold line-clamp-1">{course.title}</h3>
                        <div className="pt-2 text-sm text-muted-foreground flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>{course.enrollments?.length || 0} Students</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BookOpenCheck className="w-4 h-4" />
                                <span>{course.lessons?.length || 0} Lessons</span>
                            </div>
                        </div>
                        {course.status !== "Published" && (
                            <p className="text-yellow-600 text-xs mt-2 italic">Pending admin approval</p>
                        )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <div className="flex w-full gap-2">
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                                <Link href={`/student/courses/${course.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Link>
                            </Button>
                            <Button variant="secondary" size="sm" className="flex-1">
                                <Settings className="mr-2 h-4 w-4" />
                                Manage
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export default function TutorCoursesPage() {
    const { profile, loading: profileLoading } = useUser();
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground">Manage your courses and learning materials.</p>
                </div>
            </div>
            {profileLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <div className="aspect-[3/2] bg-muted w-full" />
                            <div className="p-4 space-y-2">
                                <div className="h-6 w-3/4 bg-muted rounded" />
                                <div className="h-4 w-1/2 bg-muted rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : profile?.id ? (
                <CourseList tutorId={profile.id} />
            ) : (
                <p className="text-muted-foreground text-sm">Could not load tutor profile. Please try refreshing.</p>
            )}
        </div>
    );
}
