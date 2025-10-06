-- Add response management fields to responses table
-- Run this in Supabase SQL Editor

ALTER TABLE responses 
ADD COLUMN IF NOT EXISTS is_addressed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS addressed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_responses_is_addressed ON responses(is_addressed);
CREATE INDEX IF NOT EXISTS idx_responses_is_flagged ON responses(is_flagged);

-- Verify the fields were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'responses' 
  AND column_name IN ('is_addressed', 'addressed_at', 'is_flagged', 'flagged_at', 'notes')
ORDER BY column_name;

