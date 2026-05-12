'use client';

import { Card, CardContent } from "@/components/ui/card";
import {
    Calculator, Map, Landmark, Atom, Beaker, Dna, Languages,
    FlaskConical, Building2, Network, Dumbbell, TrendingUp,
    BookOpenText, Store, Cpu, Theater, ScrollText, Users, Tractor,
    DraftingCompass, Palette, MessageCircle, Scale, Lightbulb,
    BookCopy, Book, GraduationCap, Loader2
} from "lucide-react";
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
            const { data } = await supabase
                .from('subjects')
                .select('*')
                .order('order_index', { ascending: true });

            if (data) setSubjects(data);
            setLoading(false);
        };

        fetchSubjects();

        // Real-time: new subjects appear instantly without page refresh
        const channel = supabase
            .channel('subjects-live')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'subjects'
            }, fetchSubjects)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <SchoolHeader />
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Study Panel</h1>
                <p className="text-muted-foreground">Select a subject to start your learning journey.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <SubjectSkeleton key={i} />)}
                </div>
            ) : subjects.length === 0 ? (
                <Card className="p-16 text-center border-dashed">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-medium">No subjects available yet</h3>
                    <p className="text-muted-foreground text-sm mt-1">Check back later or contact your school administrator.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {subjects.map((subject) => (
                        <SubjectCard key={subject.id} subject={subject} />
                    ))}
                </div>
            )}
        </div>
    );
}
