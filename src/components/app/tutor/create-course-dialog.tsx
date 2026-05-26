'use client';

import { useState } from "react";
import { PlusCircle, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
    const [uploadError, setUploadError] = useState<string | null>(null);
    const supabase = createClient();


    const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !tutorId) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError("File is too large. Max 5MB allowed.");
            return;
        }

        setUploadError(null);
        setUploading(true); // Show loading skeleton — NO local blob yet

        const fileExt = file.name.split('.').pop();
        const fileName = `${tutorId}/${Date.now()}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        try {
            // Step 1: Upload file to Supabase Storage bucket
            const { error: uploadErr } = await supabase.storage
                .from('course-banners')
                .upload(filePath, file, { upsert: false });

            if (uploadErr) throw uploadErr;

            // Step 2: Fetch the public URL from Supabase (not local blob)
            const { data } = supabase.storage
                .from('course-banners')
                .getPublicUrl(filePath);

            if (!data?.publicUrl) throw new Error("Could not retrieve public URL from Supabase.");

            // Step 3: Set preview to the Supabase-hosted URL
            setImageUrl(data.publicUrl);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setUploadError(err.message || "Upload failed. Check your storage bucket settings.");
        } finally {
            setUploading(false);
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
                                {uploading ? (
                                    /* Loading skeleton while uploading to Supabase */
                                    <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden border bg-muted animate-pulse flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">Uploading to Supabase…</p>
                                    </div>
                                ) : imageUrl ? (
                                    /* Preview fetched from Supabase public URL */
                                    <div className="relative aspect-[2/1] w-full rounded-lg overflow-hidden border bg-muted group">
                                        <Image
                                            src={imageUrl}
                                            alt="Banner preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-start justify-end p-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setImageUrl("")}
                                            >
                                                Change Image
                                            </Button>
                                        </div>
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
