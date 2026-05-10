-- Storage Buckets Setup (Must be created in dashboard first)
-- Buckets: learning-materials, student-uploads

-- learning-materials Policies
-- Enrolled students can read materials
CREATE POLICY "Enrolled students can access learning materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'learning-materials' AND
  EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.courses c ON e.course_id = c.id
    WHERE e.student_id = auth.uid() AND (storage.objects.name LIKE c.id::text || '/%')
  )
);

-- student-uploads Policies
-- Students can upload to their own folder
CREATE POLICY "Students can upload assignments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Students can view their own uploads
CREATE POLICY "Students can view own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
