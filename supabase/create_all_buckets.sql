-- =========================================================================
--            SUPABASE STORAGE BUCKETS & SCHEMA INITIALIZATION SQL
-- =========================================================================
-- Paste and execute this SQL query in your Supabase Dashboard SQL Editor 
-- (https://supabase.com/dashboard/project/_/sql/new) to create all 
-- required buckets, schema columns, and update the API cache.

-- 1. ADD COLUMNS TO GLOBAL_MESSAGES
ALTER TABLE public.global_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.global_messages ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';

-- 2. CHAT MEDIA BUCKET (Used for Chat File & Image Attachments)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_media', 'chat_media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can view chat media" ON storage.objects;
CREATE POLICY "Users can view chat media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat_media' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can upload chat media" ON storage.objects;
CREATE POLICY "Users can upload chat media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat_media' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can delete their own chat media" ON storage.objects;
CREATE POLICY "Users can delete their own chat media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat_media' AND auth.uid() = owner
);


-- 2. STUDENT SUBMISSIONS BUCKET (Used for Student Assignment Submissions)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student_submissions', 'student_submissions', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Students can upload submissions" ON storage.objects;
CREATE POLICY "Students can upload submissions" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'student_submissions' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Users can view submissions" ON storage.objects;
CREATE POLICY "Users can view submissions" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'student_submissions' );


-- 3. CLASS RESOURCES BUCKET (Used for Tutor-Uploaded Learning Resources)
INSERT INTO storage.buckets (id, name, public)
VALUES ('class_resources', 'class_resources', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'class_resources' );

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'class_resources' and auth.role() = 'authenticated' );


-- 4. AVATARS BUCKET (Used for Profile Picture Uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );


-- 5. COURSE BANNERS BUCKET (Used for Course Banner Images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-banners', 'course-banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Banner Access" ON storage.objects;
CREATE POLICY "Public Banner Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'course-banners' );

DROP POLICY IF EXISTS "Authenticated users can upload banners" ON storage.objects;
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'course-banners' AND auth.role() = 'authenticated' );
