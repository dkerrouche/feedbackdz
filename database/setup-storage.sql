-- Supabase Storage Setup for FeedbackDZ
-- Run this in Supabase SQL Editor

-- Create audio files bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for audio files
-- Allow anyone to upload audio files
CREATE POLICY "Anyone can upload audio files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audio-files');

-- Allow anyone to view audio files
CREATE POLICY "Anyone can view audio files" ON storage.objects
FOR SELECT USING (bucket_id = 'audio-files');

-- Allow service role to manage all audio files
CREATE POLICY "Service role can manage audio files" ON storage.objects
FOR ALL USING (bucket_id = 'audio-files');

-- Allow business owners to delete their own audio files
CREATE POLICY "Business owners can delete their audio files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'audio-files' AND
  EXISTS (
    SELECT 1 FROM responses r
    JOIN surveys s ON r.survey_id = s.id
    WHERE r.audio_url = storage.objects.name
    AND s.business_id IN (
      SELECT id FROM businesses WHERE auth.uid()::text = id::text
    )
  )
);

-- Create a function to generate unique audio file names
CREATE OR REPLACE FUNCTION generate_audio_filename()
RETURNS TEXT AS $$
BEGIN
  RETURN 'audio_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8) || '.webm';
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up old audio files (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_audio_files()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Find audio files older than 30 days that are not referenced in responses
  FOR file_record IN
    SELECT name FROM storage.objects
    WHERE bucket_id = 'audio-files'
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
      SELECT DISTINCT audio_url FROM responses 
      WHERE audio_url IS NOT NULL
    )
  LOOP
    -- Delete the file (this would need to be done via Supabase client)
    -- For now, just count them
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
