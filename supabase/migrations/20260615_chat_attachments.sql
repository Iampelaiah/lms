-- Add file attachment columns to global_messages
ALTER TABLE public.global_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.global_messages ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create storage bucket for chat media if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_media', 'chat_media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat_media bucket
-- Allow authenticated users to view media
CREATE POLICY "Users can view chat media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat_media' AND auth.role() = 'authenticated'
);

-- Allow authenticated users to upload media
CREATE POLICY "Users can upload chat media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat_media' AND auth.role() = 'authenticated'
);

-- Allow users to delete their own media
CREATE POLICY "Users can delete their own chat media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'chat_media' AND auth.uid() = owner
);
