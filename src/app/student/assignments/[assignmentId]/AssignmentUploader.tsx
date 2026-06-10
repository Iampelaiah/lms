'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AssignmentUploader({ assignmentId }: { assignmentId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${user.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student_submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student_submissions')
        .getPublicUrl(fileName);

      // 3. Insert into submissions table
      const { error: dbError } = await supabase
        .from('submissions')
        .insert({
          assignment_id: assignmentId,
          student_id: user.id,
          file_url: publicUrl,
          status: 'submitted'
        });

      if (dbError) throw dbError;

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Your assignment has been submitted for grading.',
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Upload failed',
        description: error.message || 'An error occurred while uploading.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-8 text-center space-y-3">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
        <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Assignment Submitted</h3>
        <p className="text-sm text-green-600 dark:text-green-500 max-w-md mx-auto">
          Your work has been sent to your tutor for grading. You will be notified when it's reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-dashed rounded-xl p-8 text-center space-y-4">
      <h3 className="font-semibold text-lg">Submit Assignment</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Ready to submit? Upload your file below to send it to your tutor for grading.
      </p>

      <div className="max-w-xs mx-auto mt-6">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-muted cursor-pointer transition-colors"
        >
          {file ? (
            <div className="flex items-center gap-2 truncate text-sm font-medium">
              <FileText className="w-4 h-4 shrink-0 text-primary" />
              <span className="truncate">{file.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>Choose a file...</span>
            </div>
          )}
        </label>
      </div>

      <Button 
        className="mt-6 w-full max-w-xs" 
        size="lg" 
        disabled={!file || isUploading}
        onClick={handleUpload}
      >
        {isUploading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
        ) : (
          'Send for Grading'
        )}
      </Button>
    </div>
  );
}
