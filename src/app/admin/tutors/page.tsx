'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, GraduationCap, Search } from "lucide-react";
import { SchoolHeader } from "@/components/app/school-header";
import * as React from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const INVITE_LINK = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/invite/tutor-a1b2-c3d4-e5f6`;

function TutorListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            ))}
        </div>
    );
}

export default function TutorsPage() {
    const [tutors, setTutors] = React.useState<any[]>([]);
    const [subjects, setSubjects] = React.useState<any[]>([]);
    const [tutorSubjects, setTutorSubjects] = React.useState<Record<string, string[]>>({});
    const [loading, setLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Dialog state
    const [selectedTutor, setSelectedTutor] = React.useState<any>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = React.useState(false);
    const [tempSelectedSubjects, setTempSelectedSubjects] = React.useState<string[]>([]);

    // Stable Supabase client — not recreated on every render
    const supabase = React.useMemo(() => createClient(), []);
    const { toast } = useToast();

    const fetchTutorsAndSubjects = React.useCallback(async () => {
        setLoading(true);
        const [{ data: tutorsData, error: tutorsError }, { data: subData }, { data: tsData }] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, avatar_url, role, is_approved, updated_at').eq('role', 'tutor').order('updated_at', { ascending: false }),
            supabase.from('subjects').select('*'),
            supabase.from('tutor_subjects').select('*')
        ]);

        if (tutorsError) {
            toast({ title: "Error fetching tutors", description: tutorsError.message, variant: "destructive" });
        } else {
            setTutors(tutorsData || []);
        }

        if (subData) {
            setSubjects(subData);
        }

        if (tsData) {
            const mapping: Record<string, string[]> = {};
            tsData.forEach((ts: any) => {
                if (!mapping[ts.tutor_id]) mapping[ts.tutor_id] = [];
                mapping[ts.tutor_id].push(ts.subject_id);
            });
            setTutorSubjects(mapping);
        }

        setLoading(false);
    }, [supabase, toast]);

    React.useEffect(() => {
        fetchTutorsAndSubjects();

        const channel = supabase
            .channel('admin-tutors-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: 'role=eq.tutor',
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setTutors(prev => [payload.new as any, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setTutors(prev =>
                        prev.map(t => t.id === (payload.new as any).id ? { ...t, ...(payload.new as any) } : t)
                    );
                } else if (payload.eventType === 'DELETE') {
                    setTutors(prev => prev.filter(t => t.id !== (payload.old as any).id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchTutorsAndSubjects, supabase]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(INVITE_LINK);
        toast({ title: "Link Copied!", description: "Tutor invitation link has been copied to your clipboard." });
    };

    const toggleApproveTutor = async (tutorId: string, currentStatus: boolean) => {
        // Optimistic update
        setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, is_approved: !currentStatus } : t));

        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: !currentStatus })
            .eq('id', tutorId);

        if (error) {
            // Revert on error
            setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, is_approved: currentStatus } : t));
            toast({ title: "Error updating status", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: !currentStatus ? "Tutor Approved" : "Tutor Access Suspended",
                description: `Successfully updated the tutor's access status.`,
            });
        }
    };

    const openAssignDialog = (tutor: any) => {
        setSelectedTutor(tutor);
        setTempSelectedSubjects(tutorSubjects[tutor.id] || []);
        setIsAssignDialogOpen(true);
    };

    const handleSubjectToggle = (subjectId: string) => {
        setTempSelectedSubjects(prev => 
            prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
        );
    };

    const saveTutorSubjects = async () => {
        if (!selectedTutor) return;
        
        // Delete existing
        await supabase.from('tutor_subjects').delete().eq('tutor_id', selectedTutor.id);
        
        // Insert new
        if (tempSelectedSubjects.length > 0) {
            const inserts = tempSelectedSubjects.map(subId => ({
                tutor_id: selectedTutor.id,
                subject_id: subId
            }));
            const { error } = await supabase.from('tutor_subjects').insert(inserts);
            if (error) {
                toast({ title: "Error assigning subjects", description: error.message, variant: "destructive" });
                return;
            }
        }
        
        setTutorSubjects(prev => ({ ...prev, [selectedTutor.id]: tempSelectedSubjects }));
        toast({ title: "Subjects Assigned", description: `Successfully updated subjects for ${selectedTutor.full_name}.` });
        setIsAssignDialogOpen(false);
    };

    const filteredTutors = React.useMemo(() => tutors.filter(tutor => {
        const query = searchQuery.toLowerCase();
        return (tutor.full_name || "").toLowerCase().includes(query) ||
               (tutor.email || "").toLowerCase().includes(query);
    }), [tutors, searchQuery]);

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <SchoolHeader />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Tutor Management</h1>
                    <p className="text-muted-foreground">View, search, and manage all tutors in your school.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search tutors..." 
                            className="pl-9 min-w-[200px]" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <Card><CardContent className="pt-6"><TutorListSkeleton /></CardContent></Card>
            ) : tutors.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <GraduationCap className="h-16 w-16 text-muted-foreground" />
                        <h3 className="text-2xl font-bold tracking-tight">No Tutors Invited</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Use the invitation link below to invite tutors to your school. Once they accept, they will appear in your tutor list.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <Input readOnly value={INVITE_LINK} className="h-9 text-xs min-w-[280px]" />
                            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy link</span>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <CardTitle>All Tutors</CardTitle>
                                <CardDescription>A total of {tutors.length} tutors registered.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Invite Link:</span>
                                <Input readOnly value={INVITE_LINK} className="h-8 text-xs w-[200px]" />
                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCopyLink}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="!pt-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tutor</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Joined Date</TableHead>
                                    <TableHead>Assigned Subjects</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTutors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                            No tutors match your search query.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTutors.map((tutor) => (
                                        <TableRow key={tutor.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={tutor.avatar_url} alt={tutor.full_name || 'Tutor'} />
                                                        <AvatarFallback>
                                                            {(tutor.full_name || 'T').split(' ').map((n: string) => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{tutor.full_name || 'Unnamed Tutor'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tutor.email}</TableCell>
                                            <TableCell>{tutor.updated_at ? new Date(tutor.updated_at).toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {(tutorSubjects[tutor.id] || []).length === 0 ? (
                                                        <span className="text-xs text-muted-foreground italic">None</span>
                                                    ) : (
                                                        <>
                                                            {(tutorSubjects[tutor.id] || []).slice(0, 2).map(subId => {
                                                                const sub = subjects.find(s => s.id === subId);
                                                                return <Badge key={subId} variant="secondary" className="text-[10px] font-normal px-1 py-0 h-4">{sub?.name}</Badge>;
                                                            })}
                                                            {(tutorSubjects[tutor.id] || []).length > 2 && (
                                                                <Badge variant="secondary" className="text-[10px] font-normal px-1 py-0 h-4">+{tutorSubjects[tutor.id].length - 2} more</Badge>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {tutor.is_approved ? (
                                                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => openAssignDialog(tutor)}>
                                                        Assign Subjects
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className={tutor.is_approved ? "text-red-500 border-red-500/20 hover:bg-red-500/10" : "text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"}
                                                        onClick={() => toggleApproveTutor(tutor.id, tutor.is_approved)}
                                                    >
                                                        {tutor.is_approved ? "Suspend" : "Approve"}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Subjects</DialogTitle>
                        <DialogDescription>
                            Select the subjects {selectedTutor?.full_name} is authorized to teach.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                        {subjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No subjects found in the database.</p>
                        ) : (
                            subjects.map(subject => (
                                <div key={subject.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={subject.id} 
                                        checked={tempSelectedSubjects.includes(subject.id)}
                                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                                    />
                                    <Label htmlFor={subject.id} className="text-sm font-medium leading-none cursor-pointer">
                                        {subject.name} <span className="text-muted-foreground text-xs font-normal">({subject.level})</span>
                                    </Label>
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveTutorSubjects}>Save Assignments</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
