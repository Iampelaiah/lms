'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator, Map, Landmark, Atom, Beaker, Dna, Languages,
    FlaskConical, Building2, Network, Dumbbell, TrendingUp,
    BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor,
    DraftingCompass, Palette, MessageCircle, Scale, Lightbulb,
    BookCopy, Book, GraduationCap, Loader2,
    Search, BrainCircuit, Code, Database, Layout, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
    "English Language":                     BookOpenText,
    "English":                              BookOpenText,
    "Mathematics":                          Calculator,
    "Additional Mathematics":               Cpu,
    "Biology":                              Dna,
    "History":                              Landmark,
    "Chemistry":                            Beaker,
    "Geography":                            Map,
    "Commerce":                             Store,
    "Principles of Accounting":             Scale,
    "Business Enterprise and Skills":       Lightbulb,
    "Literature in Indigenous Languages":   BookCopy,
    "Indigenous Languages (Shona)":         Languages,
    "Computer Science":                     Cpu,
    "Science":                              FlaskConical,
    "Business studies":                     Building2,
    "Physics":                              Atom,
    "ICT":                                  Network,
    "Physical Education":                   Dumbbell,
    "Economics":                            TrendingUp,
    "English Literature":                   BookOpenText,
    "Performing arts":                      Theater,
    "Religious studies":                    ScrollText,
    "Sociology":                            Users,
    "Agriculture":                          Tractor,
    "Design and Technology":               DraftingCompass,
    "Visual Arts":                          Palette,
    "Art":                                  Palette,
    "Music":                                MessageCircle,
    "Business English":                     MessageCircle,
};

function SubjectCard({ subject }: { subject: any }) {
    const Icon = iconMap[subject.name] || Book;
    const color = subject.color || '#6366f1';
    return (
        <Link href={`/student/courses/${subject.id}`} className="group block">
            <Card className="h-full hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div
                        className="p-4 rounded-full transition-opacity group-hover:opacity-80"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold line-clamp-1">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{subject.description}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function SubjectSkeleton() {
    return (
        <Card className="animate-pulse">
            <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted" />
                <div className="space-y-2 w-full">
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function StudyPanelPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchSubjects = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Only fetch subjects where the student has an approved enrollment
            const { data } = await supabase
                .from('enrollments')
                .select('subjects(*)')
                .eq('student_id', user.id)
                .eq('status', 'approved');

            if (data) {
                // extract the nested 'subjects' object
                const enrolledSubjects = data.map((e: any) => e.subjects).filter(Boolean);
                setSubjects(enrolledSubjects);
            }
            setLoading(false);
        };

        fetchSubjects();

        // Real-time: update if an admin approves a subject while they are on the page
        const channel = supabase
            .channel('enrollments-live')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'enrollments'
            }, fetchSubjects)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase]);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <SchoolHeader />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Panel</h1>
                <p className="text-muted-foreground">Select a subject to start your learning journey.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => <SubjectSkeleton key={i} />)}
                        </div>
                    ) : subjects.length === 0 ? (
                        <Card className="p-16 text-center border-dashed">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                            <h3 className="text-lg font-medium">No subjects available yet</h3>
                            <p className="text-muted-foreground text-sm mt-1">Check back later or contact your school administrator.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Card className="rounded-[1.5rem] border-neutral-200/60 shadow-sm bg-neutral-50/50 dark:bg-neutral-900/30">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-lg mb-1">Quick Review</h3>
                            <p className="text-sm text-muted-foreground mb-6">Sharpen your knowledge in 2 minutes!</p>
                            
                            <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Choose a topic to review..." 
                                className="pl-9 h-11 bg-white dark:bg-neutral-900 border-none rounded-xl shadow-sm text-sm"
                            />
                            </div>
                            
                            <p className="text-[10px] text-muted-foreground mb-6 font-medium">Recent: Data Visualization in Python</p>
                            
                            <div className="flex items-center justify-between mb-8 px-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center border border-white shadow-sm"><BrainCircuit className="w-4 h-4" /></div>
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-white shadow-sm -ml-2"><Code className="w-4 h-4" /></div>
                            <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center border border-white shadow-sm -ml-2"><Database className="w-4 h-4" /></div>
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-white shadow-sm -ml-2"><Layout className="w-4 h-4" /></div>
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center border border-white shadow-sm -ml-2"><Code className="w-4 h-4" /></div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center ml-auto text-muted-foreground hover:bg-neutral-200 transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></div>
                            </div>

                            <div className="flex items-center gap-3">
                            <Button variant="outline" className="flex-1 rounded-xl h-11 font-semibold border-neutral-200 shadow-sm">
                                Practice
                            </Button>
                            <Button className="flex-1 rounded-xl h-11 font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                                Start Quiz →
                            </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
