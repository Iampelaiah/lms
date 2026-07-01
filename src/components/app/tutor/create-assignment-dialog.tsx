'use client';

import { useState, useEffect } from "react";
import { PlusCircle, Loader2, Upload, Trash2, Calendar, Clock, BookOpen, FileQuestion, FileText, Tag, Image as ImageIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createBulkStudentAssignments } from "@/app/actions/student-tutor";
import { motion, AnimatePresence } from "framer-motion";

type QuestionItem = {
    question_text: string;
    points: number;
    image_url?: string;
    sequence_order: number;
};

export function CreateAssignmentDialog({ tutorId, trigger }: { 
    tutorId: string; 
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    // Subjects list & Selected Subject
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [studentsCount, setStudentsCount] = useState<number | null>(null);
    const [checkingStudents, setCheckingStudents] = useState(false);
    
    // Assignment Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().slice(0, 16); // format for datetime-local
    });
    const [totalPoints, setTotalPoints] = useState(10);
    const [pastPaperTag, setPastPaperTag] = useState("");
    const [topicTag, setTopicTag] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    
    // Interactive Questions Form State
    const [questions, setQuestions] = useState<QuestionItem[]>([]);
    
    // Upload state tracking
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingQuestionIndex, setUploadingQuestionIndex] = useState<number | null>(null);
    
    const supabase = createClient();

    // Fetch tutor's subjects when open
    useEffect(() => {
        if (open && tutorId) {
            const fetchSubjects = async () => {
                const { data } = await supabase
                    .from('tutor_subjects')
                    .select('subject_id, subjects(id, name, level)')
                    .eq('tutor_id', tutorId);
                
                if (data) {
                    setSubjects(data.map(d => d.subjects).filter(Boolean));
                }
            };
            fetchSubjects();
        }
    }, [open, tutorId, supabase]);

    // Check count of enrolled students when subject changes
    useEffect(() => {
        if (selectedSubjectId && tutorId) {
            const checkEnrolledStudents = async () => {
                setCheckingStudents(true);
                const { count, error } = await supabase
                    .from('enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('subject_id', selectedSubjectId)
                    .eq('tutor_id', tutorId)
                    .eq('status', 'approved');
                
                if (!error) {
                    setStudentsCount(count || 0);
                } else {
                    setStudentsCount(0);
                }
                setCheckingStudents(false);
            };
            checkEnrolledStudents();
        } else {
            setStudentsCount(null);
        }
    }, [selectedSubjectId, tutorId, supabase]);

    const uploadImageFile = async (file: File, pathPrefix: string): Promise<string> => {
        if (!file || !tutorId) return "";
        try {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${tutorId}/${pathPrefix}_${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('course-banners')
                .upload(fileName, file, { upsert: false });
            
            if (error) throw error;

            const { data } = supabase.storage.from('course-banners').getPublicUrl(fileName);
            return data?.publicUrl || "";
        } catch (err) {
            console.error("Image upload failed:", err);
            toast({
                title: "Upload failed",
                description: "Could not upload image to server.",
                variant: "destructive"
            });
            return "";
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBanner(true);
        const url = await uploadImageFile(file, 'assignment_banner');
        if (url) {
            setImageUrl(url);
            toast({
                title: "Image Uploaded",
                description: "Assignment banner image added successfully.",
            });
        }
        setUploadingBanner(false);
    };

    const handleQuestionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingQuestionIndex(index);
        const url = await uploadImageFile(file, `question_${index}`);
        if (url) {
            const updated = [...questions];
            updated[index].image_url = url;
            setQuestions(updated);
            toast({
                title: "Question Image Uploaded",
                description: `Image added to question #${index + 1}.`,
            });
        }
        setUploadingQuestionIndex(null);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: "",
                points: 5,
                sequence_order: questions.length + 1
            }
        ]);
    };

    const updateQuestion = (index: number, field: keyof QuestionItem, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        
        // Optimistically calculate sum of points if adding interactive questions
        if (field === 'points') {
            const sum = updated.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
            setTotalPoints(sum);
        }
        
        setQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        const filtered = questions.filter((_, i) => i !== index);
        const reordered = filtered.map((q, i) => ({ ...q, sequence_order: i + 1 }));
        setQuestions(reordered);
        
        const sum = reordered.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
        setTotalPoints(sum || 10);
    };

    const handleCreateAssignment = async () => {
        if (!selectedSubjectId || !title.trim() || !tutorId) return;
        
        if (studentsCount === 0) {
            toast({
                title: "Cannot Assign",
                description: "There are no approved students enrolled in this subject.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const res = await createBulkStudentAssignments(
                tutorId,
                selectedSubjectId,
                title,
                description,
                new Date(dueDate).toISOString(),
                imageUrl || undefined,
                pastPaperTag || undefined,
                topicTag || undefined,
                totalPoints,
                questions.length > 0 ? questions : undefined
            );

            if (res.error) {
                toast({
                    title: "Creation Failed",
                    description: res.error,
                    variant: "destructive"
                });
                return;
            }

            toast({
                title: "Assignment Created",
                description: `Successfully created and sent assignment to ${studentsCount} student(s) for review.`,
            });

            // Reset Form State
            setTitle("");
            setDescription("");
            setSelectedSubjectId("");
            setImageUrl("");
            setPastPaperTag("");
            setTopicTag("");
            setQuestions([]);
            setTotalPoints(10);
            setOpen(false);

        } catch (err: any) {
            console.error("Error submitting bulk assignment:", err);
            toast({
                title: "Error occurred",
                description: err.message || "An unexpected error occurred during creation.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger || (
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col p-0 bg-background border-l border-border shadow-2xl">
                <SheetHeader className="px-6 py-5 border-b border-border bg-muted/20 shrink-0">
                    <SheetTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Create Subject Assignment
                    </SheetTitle>
                    <SheetDescription className="text-sm text-muted-foreground mt-1">
                        Design an assignment that will automatically be distributed to all students enrolled in the selected subject.
                    </SheetDescription>
                </SheetHeader>
                
                <ScrollArea className="flex-grow px-6 py-6">
                    <div className="space-y-6 pb-8">
                        {/* Subject Selection & Student Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm text-foreground">Target Course</h4>
                            </div>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Assigned Subject</Label>
                                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                        <SelectTrigger className="w-full bg-background border-border">
                                            <SelectValue placeholder="Select subject..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.length === 0 && <SelectItem value="none" disabled>No active subjects found.</SelectItem>}
                                            {subjects.map((sub: any) => (
                                                <SelectItem key={sub.id} value={sub.id}>
                                                    {sub.name} ({sub.level})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="flex items-end">
                                    {selectedSubjectId && (
                                        <div className="w-full p-3 rounded-lg border border-border bg-muted/10 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-xs font-medium text-muted-foreground">Enrolled Students:</span>
                                            </div>
                                            {checkingStudents ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            ) : (
                                                <Badge variant={studentsCount === 0 ? "destructive" : "secondary"} className="font-semibold">
                                                    {studentsCount} {studentsCount === 1 ? 'student' : 'students'}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Assignment Details */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm text-foreground">Assignment Details</h4>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs font-semibold text-muted-foreground uppercase">Title</Label>
                                    <Input 
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Chapter 1 Practice Problems"
                                        className="bg-background border-border"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground uppercase">Instructions / Description</Label>
                                    <Textarea 
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Enter instructions, questions, or links to references..."
                                        className="bg-background border-border min-h-[100px]"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="dueDate" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Due Date
                                        </Label>
                                        <Input 
                                            id="dueDate"
                                            type="datetime-local"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="bg-background border-border"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="totalPoints" className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Total Points
                                        </Label>
                                        <Input 
                                            id="totalPoints"
                                            type="number"
                                            value={totalPoints}
                                            onChange={(e) => setTotalPoints(parseInt(e.target.value) || 0)}
                                            disabled={questions.length > 0} // Lock points if custom questions exist
                                            className="bg-background border-border"
                                        />
                                        {questions.length > 0 && (
                                            <span className="text-[10px] text-muted-foreground italic">Auto-calculated from interactive questions.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extra Tags & Banner */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                                <Tag className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-sm text-foreground">Tags & Media (Optional)</h4>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="pastPaperTag" className="text-xs font-semibold text-muted-foreground uppercase">Past Paper Tag</Label>
                                    <Input 
                                        id="pastPaperTag"
                                        value={pastPaperTag}
                                        onChange={(e) => setPastPaperTag(e.target.value)}
                                        placeholder="e.g. Nov 2025 Paper 2"
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="topicTag" className="text-xs font-semibold text-muted-foreground uppercase">Topic Tag</Label>
                                    <Input 
                                        id="topicTag"
                                        value={topicTag}
                                        onChange={(e) => setTopicTag(e.target.value)}
                                        placeholder="e.g. Calculus Introduction"
                                        className="bg-background border-border"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">Banner Image</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="Paste image URL or upload file..."
                                        className="bg-background border-border flex-1"
                                    />
                                    <div className="relative shrink-0">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            id="assignment-banner-upload" 
                                            className="hidden" 
                                            onChange={handleBannerUpload} 
                                            disabled={uploadingBanner}
                                        />
                                        <Label 
                                            htmlFor="assignment-banner-upload" 
                                            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold h-10 px-3 cursor-pointer ${uploadingBanner ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                        >
                                            {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        </Label>
                                    </div>
                                </div>
                                {imageUrl && (
                                    <div className="relative mt-2 w-full h-24 rounded-lg overflow-hidden border border-border">
                                        <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                        <Button 
                                            size="icon" 
                                            variant="destructive" 
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full"
                                            onClick={() => setImageUrl("")}
                                        >
                                            &times;
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Questions Builder */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border/80 pb-2">
                                <div className="flex items-center gap-2">
                                    <FileQuestion className="w-4 h-4 text-primary" />
                                    <h4 className="font-semibold text-sm text-foreground">Interactive Questions</h4>
                                </div>
                                <Button 
                                    type="button" 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={addQuestion}
                                    className="h-8 text-xs font-semibold"
                                >
                                    <PlusCircle className="w-3.5 h-3.5 mr-1" />
                                    Add Question
                                </Button>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center p-6 border border-dashed border-border rounded-xl bg-muted/5">
                                    <p className="text-xs text-muted-foreground">No interactive questions added. Students will upload a single submission by default.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {questions.map((q, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Card className="border border-border bg-card shadow-sm">
                                                    <CardHeader className="p-3 bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                                            Question {q.sequence_order}
                                                        </Badge>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeQuestion(idx)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </CardHeader>
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Question Prompt</Label>
                                                            <Input 
                                                                value={q.question_text}
                                                                onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)}
                                                                placeholder="e.g. Solve for x: 3x + 5 = 14"
                                                                className="bg-background border-border text-sm"
                                                            />
                                                        </div>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Points</Label>
                                                                <Input 
                                                                    type="number"
                                                                    value={q.points}
                                                                    onChange={(e) => updateQuestion(idx, 'points', parseInt(e.target.value) || 0)}
                                                                    className="bg-background border-border text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Question Image (Optional)</Label>
                                                                <div className="flex gap-2">
                                                                    <Input 
                                                                        value={q.image_url || ''}
                                                                        onChange={(e) => updateQuestion(idx, 'image_url', e.target.value)}
                                                                        placeholder="Image URL"
                                                                        className="bg-background border-border text-sm flex-grow"
                                                                    />
                                                                    <div className="relative shrink-0">
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            id={`q-img-upload-${idx}`} 
                                                                            className="hidden" 
                                                                            onChange={(e) => handleQuestionImageUpload(e, idx)} 
                                                                            disabled={uploadingQuestionIndex === idx}
                                                                        />
                                                                        <Label 
                                                                            htmlFor={`q-img-upload-${idx}`} 
                                                                            className={`inline-flex items-center justify-center rounded-md text-xs font-semibold h-9 px-2.5 cursor-pointer ${uploadingQuestionIndex === idx ? 'bg-muted text-muted-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                                                                        >
                                                                            {uploadingQuestionIndex === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {q.image_url && (
                                                            <div className="relative mt-2 w-full h-20 rounded border border-border overflow-hidden">
                                                                <img src={q.image_url} alt="Question Graphic" className="w-full h-full object-cover" />
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="destructive" 
                                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full"
                                                                    onClick={() => updateQuestion(idx, 'image_url', "")}
                                                                >
                                                                    &times;
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
                
                <SheetFooter className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex items-center justify-end gap-3 sm:space-x-0">
                    <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        className="border-border text-foreground hover:bg-muted"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateAssignment} 
                        disabled={loading || !selectedSubjectId || !title.trim() || studentsCount === 0}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-1.5"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Distribute Assignment
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
