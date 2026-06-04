'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, Users, Video, Loader2, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { SchoolHeader } from "@/components/app/school-header";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/providers/user-context";
import { useEffect, useState, useCallback } from "react";
import { ScheduleClassDialog } from "@/components/app/tutor/schedule-class-dialog";
import { useToast } from "@/hooks/use-toast";

const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
    "upcoming": "default",
    "ongoing": "destructive",
    "completed": "secondary",
};

function FinalizeClassDialog({ 
  liveClass, 
  onSaved, 
  trigger 
}: { 
  liveClass: any; 
  onSaved: () => void; 
  trigger: React.ReactNode; 
}) {
  const [recordingUrl, setRecordingUrl] = useState(liveClass.recording_url || '');
  const [presentationUrl, setPresentationUrl] = useState(liveClass.presentation_url || '');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const recUrl = recordingUrl.trim() || null;
      const presUrl = presentationUrl.trim() || null;

      // 1. Update the live class
      const { error: classError } = await supabase
        .from('live_classes')
        .update({ 
            recording_url: recUrl,
            presentation_url: presUrl,
            status: 'completed'
        })
        .eq('id', liveClass.id);

      if (classError) throw classError;

      // 2. Insert into resources table so enrolled students get it
      const resourcesToInsert = [];
      if (recUrl) {
          resourcesToInsert.push({
              title: `${liveClass.title} - Recording`,
              format: 'video',
              source: 'live_class_automation',
              file_url: recUrl,
              live_class_id: liveClass.id,
              subject_id: liveClass.subject_id,
              uploaded_by: liveClass.tutor_id
          });
      }
      if (presUrl) {
          resourcesToInsert.push({
              title: `${liveClass.title} - Presentation`,
              format: 'ppt',
              source: 'live_class_automation',
              file_url: presUrl,
              live_class_id: liveClass.id,
              subject_id: liveClass.subject_id,
              uploaded_by: liveClass.tutor_id
          });
      }

      if (resourcesToInsert.length > 0) {
          // Delete old automated resources for this class to prevent duplicates
          await supabase.from('resources').delete().eq('live_class_id', liveClass.id);
          
          const { error: resError } = await supabase
            .from('resources')
            .insert(resourcesToInsert);
            
          if (resError) throw resError;
      }
      
      toast({ title: "Class Finalized", description: "Resources have been sent to all enrolled students." });
      onSaved();
      setOpen(false);
    } catch (err: any) {
      console.error('Error finalizing class:', err);
      toast({ title: "Error", description: err.message || "Failed to finalize class.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border text-foreground rounded-3xl">
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>Finalize Class</DialogTitle>
            <DialogDescription className="text-foreground/">
              Provide the recording and presentation links. These will be automatically distributed to all students enrolled in this subject.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="recording-url" className="text-foreground/">Recording URL (Optional)</Label>
              <Input
                id="recording-url"
                type="url"
                placeholder="https://example.com/recording.mp4"
                value={recordingUrl}
                onChange={(e) => setRecordingUrl(e.target.value)}
                className="bg-muted border-border rounded-xl py-6 focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="presentation-url" className="text-foreground/">Presentation URL (Optional)</Label>
              <Input
                id="presentation-url"
                type="url"
                placeholder="https://example.com/slides.pdf"
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="bg-muted border-border rounded-xl py-6 focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="bg-muted border-border rounded-xl hover:bg-muted hover:text-foreground"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gold hover:bg-gold/80 text-obsidian font-bold rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Finalize & Send Resources'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LiveClassList({ status, classes, onUpdate }: { status: string, classes: any[], onUpdate: () => void }) {
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
                            {liveClass.image_url ? (
                                <Image src={liveClass.image_url} alt={liveClass.title} fill className="object-cover" />
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
                     <CardFooter className="p-4 pt-0 flex-col gap-2">
                         {liveClass.status === "completed" ? (
                             <div className="flex gap-2 w-full">
                                 {liveClass.recording_url && (
                                     <Button className="flex-1 rounded-xl py-6 bg-muted hover:bg-muted text-foreground border-border" variant="outline" asChild>
                                         <a href={liveClass.recording_url} target="_blank" rel="noreferrer">
                                             <Video className="mr-2 h-4 w-4 text-gold" />
                                             Video
                                         </a>
                                     </Button>
                                 )}
                                 {liveClass.presentation_url && (
                                     <Button className="flex-1 rounded-xl py-6 bg-muted hover:bg-muted text-foreground border-border" variant="outline" asChild>
                                         <a href={liveClass.presentation_url} target="_blank" rel="noreferrer">
                                             <FileText className="mr-2 h-4 w-4 text-gold" />
                                             Slides
                                         </a>
                                     </Button>
                                 )}
                                 <FinalizeClassDialog
                                     liveClass={liveClass}
                                     onSaved={onUpdate}
                                     trigger={
                                         <Button className="flex-1 rounded-xl py-6 bg-muted hover:bg-muted text-foreground border-border">
                                             Edit Resources
                                         </Button>
                                     }
                                 />
                             </div>
                         ) : (
                             <div className="flex gap-2 w-full">
                                <Button className="flex-1 rounded-xl py-6" asChild variant={liveClass.status === "ongoing" ? "destructive" : "default"}>
                                    <Link href={`/classroom/${liveClass.agora_channel_name || liveClass.id}?role=host&subjectId=${liveClass.subject_id}`}>
                                        <Video className="mr-2 h-4 w-4" />
                                        {liveClass.status === "ongoing" ? "Join Now" : "Start Class"}
                                    </Link>
                                </Button>
                                <FinalizeClassDialog
                                    liveClass={liveClass}
                                    onSaved={onUpdate}
                                    trigger={
                                        <Button className="flex-1 rounded-xl py-6" variant="outline">
                                            Finalize Class
                                        </Button>
                                    }
                                />
                                <Button className="rounded-xl py-6 px-4 hover:bg-destructive/10" variant="ghost" onClick={() => deleteClass(liveClass.id)}>
                                    <Trash2 className="w-5 h-5 text-destructive" />
                                </Button>
                             </div>
                         )}
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
    const { toast } = useToast();

    const deleteClass = async (classId: string) => {
        if (!confirm('Are you sure you want to delete this class?')) return;
        const { error } = await supabase.from('classes').delete().eq('id', classId);
        if (error) {
            console.error('Delete error', error);
            toast({ title: 'Error', description: 'Failed to delete class', variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Class deleted successfully' });
            fetchClasses();
        }
    };

    const fetchClasses = useCallback(async () => {
        if (!profile?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('classes')
                .select(`
                    *,
                    tutor:profiles!classes_tutor_id_fkey (*)
                `)
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
    }, [profile?.id, supabase]);

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
                        <Button className="bg-gold hover:bg-gold/80 text-obsidian font-bold h-12 px-6">
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
                        <LiveClassList status="ongoing" classes={classes} onUpdate={fetchClasses} />
                    </TabsContent>
                    <TabsContent value="upcoming" className="mt-8">
                        <LiveClassList status="upcoming" classes={classes} onUpdate={fetchClasses} />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-8">
                        <LiveClassList status="completed" classes={classes} onUpdate={fetchClasses} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}


