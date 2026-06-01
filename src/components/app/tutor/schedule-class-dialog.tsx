'use client';

import { useState, useEffect } from "react";
import { CalendarPlus, Loader2, Sparkles, Upload, Video, Clock, Calendar as CalendarIcon, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function ScheduleClassDialog({ tutorId, onClassScheduled, trigger }: { 
    tutorId: string; 
    onClassScheduled?: () => void;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState("12:00");
    const [status, setStatus] = useState("upcoming");
    const [subjectId, setSubjectId] = useState("");
    const [subjects, setSubjects] = useState<any[]>([]);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (open && tutorId) {
            // Fetch subjects assigned to this tutor
            supabase
                .from('tutor_subjects')
                .select('subject_id, subjects(id, name, level)')
                .eq('tutor_id', tutorId)
                .then(({ data }) => {
                    if (data) {
                        const mapped = data.map((ts: any) => ts.subjects).filter(Boolean);
                        setSubjects(mapped);
                    }
                });
        }
    }, [open, tutorId, supabase]);

    const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const canvas = document.createElement('canvas');
                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas not supported'));
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image load failed')); };
            img.src = objectUrl;
        });
    };

    const uploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tutorId) return;

        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File is too large. Max 10MB allowed.");
            return;
        }

        setUploadError(null);
        setUploading(true);
        setUploadProgress(0);

        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
        setUploadProgress(10);

        let progressInterval: NodeJS.Timeout | undefined = undefined;

        try {
            const compressed = await compressImage(file);
            setUploadProgress(20);

            const fileName = `${tutorId}/${Date.now()}.jpg`;
            const filePath = `class-thumbnails/${fileName}`;

            let currentFakeProgress = 20;
            progressInterval = setInterval(() => {
                currentFakeProgress += Math.floor(Math.random() * 5) + 3;
                if (currentFakeProgress > 90) currentFakeProgress = 90;
                setUploadProgress(currentFakeProgress);
            }, 100);

            const { error: uploadErr } = await supabase.storage
                .from('course-banners')
                .upload(filePath, compressed, { upsert: false, contentType: 'image/jpeg' });
            
            clearInterval(progressInterval);

            if (uploadErr) throw uploadErr;
            setUploadProgress(95);

            const { data } = supabase.storage
                .from('course-banners')
                .getPublicUrl(filePath);

            if (!data?.publicUrl) throw new Error("Could not retrieve public URL.");

            setUploadProgress(100);
            setImageUrl(data.publicUrl);
            URL.revokeObjectURL(localUrl);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setUploadError(err.message || "Upload failed. Please try again.");
        } finally {
            clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSchedule = () => {
        if (!title || !date || !tutorId || !subjectId || uploading) return;
        setLoading(true);
        
        const fullDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        fullDate.setHours(hours, minutes);

        const insertTitle = title;
        const insertStatus = status;
        const insertSubjectId = subjectId;

        setOpen(false);
        setTitle("");
        setDate(undefined);
        setTime("12:00");
        setStatus("upcoming");
        setSubjectId("");
        setImageUrl("");
        setLoading(false);
        if (onClassScheduled) onClassScheduled();

        supabase
            .from('live_classes')
            .insert({
                title: insertTitle,
                start_time: fullDate.toISOString(),
                status: insertStatus,
                tutor_id: tutorId,
                subject_id: insertSubjectId,
                approval_status: 'approved' // Setting approved for immediate visibility for now
            })
            .then(({ error }) => {
                if (error) {
                    console.error('Insert error:', JSON.stringify(error), error);
                    toast({
                        title: 'Could not save class',
                        description: error.message,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: '🎉 Class Scheduled!',
                        description: `"${insertTitle}" has been added to your schedule.`,
                    });
                    if (onClassScheduled) onClassScheduled();
                }
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#A7C957] hover:bg-[#6A994E] text-[#0A1A12] font-bold rounded-xl transition-all hover:scale-105">
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Schedule New Class
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#0A1A12] border-white/10 text-white overflow-hidden p-0 gap-0">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#A7C957] via-[#6A994E] to-[#A7C957] animate-gradient" />
                
                <DialogHeader className="p-8 pb-4 text-left">
                    <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Schedule New Live Class
                    </DialogTitle>
                    <DialogDescription className="text-white/40">
                        Craft your next session. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-8 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="title" className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Session Title</Label>
                        <Input 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="e.g. Masterclass: Advanced Physics" 
                            className="bg-white/5 border-white/10 rounded-xl h-12 text-base focus:ring-[#A7C957]/20"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Subject</Label>
                        <Select value={subjectId} onValueChange={setSubjectId}>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-sm focus:ring-[#A7C957]/20">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A1A12] border-white/10 text-white rounded-xl">
                                {subjects.length === 0 ? (
                                    <SelectItem value="none" disabled>No subjects assigned</SelectItem>
                                ) : (
                                    subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="focus:bg-[#A7C957] focus:text-[#0A1A12]">
                                            {s.name} ({s.level})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="bg-white/5 border-white/10 rounded-xl h-12 text-left justify-start text-white hover:bg-white/10">
                                        <CalendarIcon className="mr-2 h-4 w-4 text-[#A7C957]" />
                                        {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#0A1A12] border-white/10 text-white rounded-xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        className="bg-transparent text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7C957] pointer-events-none" />
                                <Input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-xl h-12 pl-12 focus:ring-[#A7C957]/20 [appearance:none] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Stream Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-white/5 border-white/10 rounded-xl h-12 text-sm focus:ring-[#A7C957]/20">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0A1A12] border-white/10 text-white rounded-xl">
                                <SelectItem value="upcoming" className="focus:bg-[#A7C957] focus:text-[#0A1A12]">Upcoming Session</SelectItem>
                                <SelectItem value="ongoing" className="focus:bg-[#A7C957] focus:text-[#0A1A12]">Live Now</SelectItem>
                                <SelectItem value="completed" className="focus:bg-[#A7C957] focus:text-[#0A1A12]">Past Session</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="p-8 pt-0">
                    <Button 
                        onClick={handleSchedule} 
                        disabled={loading || !title || !date || !subjectId || uploading} 
                        className="w-full h-14 bg-gradient-to-r from-[#A7C957] to-[#6A994E] hover:from-[#B5E48C] hover:to-[#A7C957] text-[#0A1A12] font-bold rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#A7C957]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
                        {loading ? 'Finalizing Class...' : 'Create & Schedule Class'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
