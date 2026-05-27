'use client';

import { useState } from "react";
import { PlusCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function CreateCourseDialog({ tutorId, onCourseCreated, trigger }: { 
    tutorId: string; 
    onCourseCreated?: () => void;
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [lessons, setLessons] = useState<{ title: string; content: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const supabase = createClient();

    /**
     * Compresses an image using a canvas element before upload.
     * Resizes to max 1000px wide and applies JPEG quality compression.
     * Typically reduces size by 70-90%, making uploads 3-10x faster.
     */
    const compressImage = (file: File, maxWidth = 1000, quality = 0.7): Promise<Blob> => {
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

    const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        let progressInterval: NodeJS.Timeout;

        try {
            // Step 2: Compress in background (fast, ~100-300ms)
            const compressed = await compressImage(file);
            setUploadProgress(20);

            const fileName = `${tutorId}/${Date.now()}.jpg`;
            const filePath = `banners/${fileName}`;

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
        } finally {
            if (progressInterval!) clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const addLesson = () => {
        setLessons([...lessons, { title: "", content: "" }]);
    };

    const updateLesson = (index: number, field: 'title' | 'content', value: string) => {
        const newLessons = [...lessons];
        newLessons[index][field] = value;
        setLessons(newLessons);
    };

    const removeLesson = (index: number) => {
        setLessons(lessons.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!title || !tutorId) return;
        setLoading(true);
        
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .insert({
                title,
                description,
                image_url: imageUrl || `https://picsum.photos/seed/${title}/600/400`,
                tutor_id: tutorId,
                status: 'Pending Review'
            })
            .select()
            .single();

        if (courseError) {
            console.error(courseError);
            setLoading(false);
            return;
        }

        if (lessons.length > 0) {
            const lessonsToInsert = lessons.map((l, index) => ({
                course_id: courseData.id,
                title: l.title || "Untitled Lesson",
                content: l.content,
                order_index: index + 1
            }));

            const { error: lessonsError } = await supabase
                .from('lessons')
                .insert(lessonsToInsert);
            
            if (lessonsError) console.error(lessonsError);
        }

        setOpen(false);
        setTitle("");
        setDescription("");
        setImageUrl("");
        setLessons([]);
        if (onCourseCreated) onCourseCreated();
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Course
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                        Define your course, add a banner, and outline its contents.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm border-b pb-2">Basic Information</h4>
                        <div className="grid gap-2">
                            <Label htmlFor="title">Course Title</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Advanced Calculus" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Course Description</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will students learn?" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Course Banner</Label>
                            <div className="flex flex-col gap-3">
                                {imageUrl ? (
                                    /* Preview fetched from local blob or Supabase public URL */
                                    <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden border bg-muted group">
                                        <img
                                            src={imageUrl}
                                            alt="Banner preview"
                                            className="object-cover w-full h-full"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                                <p className="text-xs text-white font-medium">
                                                    {uploadProgress < 30 ? 'Compressing' : uploadProgress < 85 ? 'Uploading' : 'Finalizing'} {uploadProgress}%
                                                </p>
                                                <div className="w-[60%] bg-white/20 h-1 rounded-full overflow-hidden mt-1">
                                                    <div 
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {!uploading && (
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-start justify-end p-2 opacity-0 group-hover:opacity-100 duration-200">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => setImageUrl("")}
                                                >
                                                    Change Image
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ) : uploading ? (
                                    /* Fail-safe placeholder if uploading but no local preview url exists */
                                    <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden border bg-muted animate-pulse flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Uploading to Supabase ({uploadProgress}%)…</p>
                                    </div>
                                ) : (
                                    /* Default: URL input + file upload button */
                                    <>
                                        <div className="flex gap-2">
                                            <Input
                                                id="image"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="Paste image URL..."
                                                className="flex-grow"
                                            />
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="banner-upload"
                                                    onChange={uploadBanner}
                                                />
                                                <Label
                                                    htmlFor="banner-upload"
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 cursor-pointer"
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload
                                                </Label>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Recommended: 1200x600px (2:1 aspect ratio)</p>
                                    </>
                                )}
                                {uploadError && (
                                    <p className="text-xs text-destructive font-medium">{uploadError}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="font-medium text-sm">Course Contents (Lessons)</h4>
                            <Button variant="outline" size="sm" onClick={addLesson}>
                                <PlusCircle className="mr-2 h-3 w-3" />
                                Add Lesson
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {lessons.map((lesson, index) => (
                                <Card key={index} className="bg-muted/30">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold uppercase tracking-wider">Lesson {index + 1}</Label>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeLesson(index)}>
                                                &times;
                                            </Button>
                                        </div>
                                        <Input 
                                            value={lesson.title} 
                                            onChange={(e) => updateLesson(index, 'title', e.target.value)} 
                                            placeholder="Lesson Title" 
                                            className="bg-background"
                                        />
                                        <Textarea 
                                            value={lesson.content} 
                                            onChange={(e) => updateLesson(index, 'content', e.target.value)} 
                                            placeholder="Lesson Content/Objectives" 
                                            className="bg-background min-h-[80px]"
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                            {lessons.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 italic">No lessons added yet. You can add them later too.</p>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
                    <Button onClick={handleCreate} disabled={loading || !title} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Course & Contents
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
