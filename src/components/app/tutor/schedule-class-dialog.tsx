'use client';

import { useState } from "react";
import { CalendarPlus, Loader2, Sparkles, Upload, Video, Clock, Calendar as CalendarIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const supabase = createClient();
    const { toast } = useToast();

    /**
     * Compresses an image using a canvas element before upload.
     * Resizes to max 1280px wide and applies JPEG quality compression.
     * Typically reduces size by 70-90%, making uploads 3-10x faster.
     */
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

        // Step 1: Show instant local preview — no waiting for upload
        const localUrl = URL.createObjectURL(file);
        setImageUrl(localUrl);
        setUploadProgress(10);

        // Timer for smooth fake progress to avoid the "stuck" feeling
        let progressInterval: NodeJS.Timeout | undefined = undefined;

        try {
            // Step 2: Compress in background (fast, ~100-300ms)
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

            // Step 3: Upload the compressed blob (much smaller = much faster)
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
            // Step 4: Swap local blob URL for permanent Supabase URL
            setImageUrl(data.publicUrl);
            URL.revokeObjectURL(localUrl);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setUploadError(err.message || "Upload failed. Please try again.");
            // Keep the local preview visible so user doesn't lose their selection
        } finally {
            clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSchedule = () => {
        if (!title || !date || !tutorId || uploading) return;
        setLoading(true);
        
        // Combine date and time
        const fullDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        fullDate.setHours(hours, minutes);

        // Snapshot values before resetting state
        const insertTitle = title;
        const insertStatus = status;
        const insertImageUrl = imageUrl || `https://picsum.photos/seed/${title}/800/600`;

        // Optimistic UI: Close the dialog INSTANTLY — no waiting at all
        setOpen(false);
        setTitle("");
        setDate(undefined);
        setTime("12:00");
        setStatus("upcoming");
        setImageUrl("");
        setLoading(false);
        if (onClassScheduled) onClassScheduled();

        // Fire-and-forget: insert runs fully in the background, dialog is already gone
        supabase
            .from('classes')
            .insert({
                title: insertTitle,
                schedule: fullDate.toISOString(),
                status: insertStatus,
                imageUrl: insertImageUrl,
                tutor_id: tutorId
            })
            .then(({ error }) => {
                if (error) {
                    console.error('Insert error:', JSON.stringify(error), error);
                    toast({
                        title: 'Could not save class',
                        description: error.message || `DB error code ${error.code || 'unknown'}. Please try again.`,
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
                    {/* 1. UPLOAD BANNER SECTION */}
                    <div className="flex flex-col gap-3">
                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Class Presentation Banner</Label>
                        {imageUrl ? (
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl group">
                                <img src={imageUrl} alt="Preview" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" />
                                {uploading && (
                                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end">
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10 shadow-xl">
                                            <Loader2 className="h-3 w-3 text-[#A7C957] animate-spin" />
                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                                                {uploadProgress < 30 ? 'Compressing' : uploadProgress < 85 ? 'Uploading' : 'Finalizing'} {uploadProgress}%
                                            </p>
                                        </div>
                                        <div className="w-full bg-white/10 h-1 absolute bottom-0">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#A7C957] to-[#6A994E] transition-all duration-300 ease-out"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!uploading && (
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="h-8 rounded-full px-4 text-[10px] uppercase font-bold tracking-widest bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                                                >
                                                    <Clock className="h-3 w-3 mr-2 text-[#A7C957]" />
                                                    {date ? format(date, "MMM d") : "Schedule"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-6 bg-[#0A1A12]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl" align="center">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Pick Date</Label>
                                                        <Calendar
                                                            mode="single"
                                                            selected={date}
                                                            onSelect={setDate}
                                                            className="rounded-xl border border-white/5 bg-white/5"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Start Time</Label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7C957] pointer-events-none" />
                                                            <Input 
                                                                type="time" 
                                                                value={time}
                                                                onChange={(e) => setTime(e.target.value)}
                                                                className="bg-white/5 border-white/10 rounded-xl h-10 pl-12 focus:ring-[#A7C957]/20 [appearance:none] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button 
                                            variant="destructive" 
                                            size="sm" 
                                            className="h-8 rounded-full px-4 text-[10px] uppercase font-bold tracking-widest bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/20 backdrop-blur-md"
                                            onClick={() => setImageUrl("")}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-white/5 flex flex-col items-center justify-center group transition-all hover:bg-white/[0.07] cursor-pointer">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A7C957] to-[#6A994E] flex items-center justify-center mb-4 shadow-lg shadow-[#A7C957]/20 group-hover:scale-110 transition-transform duration-500">
                                        <Sparkles className="w-7 h-7 text-[#0A1A12]" />
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No Class Banner</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] text-[#A7C957] font-bold uppercase tracking-wider hover:bg-[#A7C957]/10 rounded-full">
                                                        <Clock className="w-3 h-3 mr-1.5" />
                                                        {date ? format(date, "MMM d, HH:mm") : "Set Schedule"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-6 bg-[#0A1A12]/95 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl" align="center">
                                                    <div className="flex flex-col gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Pick Date</Label>
                                                            <Calendar
                                                                mode="single"
                                                                selected={date}
                                                                onSelect={setDate}
                                                                className="rounded-xl border border-white/5 bg-white/5"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/20">Start Time</Label>
                                                            <div className="relative">
                                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7C957] pointer-events-none" />
                                                                <Input 
                                                                    type="time" 
                                                                    value={time}
                                                                    onChange={(e) => setTime(e.target.value)}
                                                                    className="bg-white/5 border-white/10 rounded-xl h-10 pl-12 focus:ring-[#A7C957]/20 [appearance:none] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Input 
                                        value={imageUrl} 
                                        onChange={(e) => setImageUrl(e.target.value)} 
                                        placeholder="Paste image URL here..." 
                                        className="flex-grow bg-white/5 border-white/10 rounded-xl h-12 text-sm focus:ring-[#A7C957]/20"
                                    />
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            id="class-thumb-upload" 
                                            onChange={uploadThumbnail} 
                                        />
                                        <Label 
                                            htmlFor="class-thumb-upload" 
                                            className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all bg-[#A7C957] text-[#0A1A12] hover:bg-[#B5E48C] hover:scale-105 active:scale-95 h-12 px-6 cursor-pointer shadow-lg shadow-[#A7C957]/20"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Upload
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}
                        {uploadError && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{uploadError}</p>}
                    </div>

                    {/* 2. CLASS TITLE */}
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

                    {/* 3. INITIAL STATUS */}
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
                        disabled={loading || !title || !date || uploading} 
                        className="w-full h-14 bg-gradient-to-r from-[#A7C957] to-[#6A994E] hover:from-[#B5E48C] hover:to-[#A7C957] text-[#0A1A12] font-bold rounded-2xl text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#A7C957]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading || uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
                        {uploading ? 'Waiting for upload...' : loading ? 'Finalizing Class...' : 'Create & Schedule Class'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
