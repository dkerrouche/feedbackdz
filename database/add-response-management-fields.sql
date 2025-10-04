-- Add response management fields to the responses table
-- Run this in your Supabase SQL Editor

-- Add new columns for response management
ALTER TABLE responses 
ADD COLUMN IF NOT EXISTS is_addressed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS addressed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_responses_addressed ON responses(is_addressed);
CREATE INDEX IF NOT EXISTS idx_responses_flagged ON responses(is_flagged);
CREATE INDEX IF NOT EXISTS idx_responses_addressed_at ON responses(addressed_at);
CREATE INDEX IF NOT EXISTS idx_responses_flagged_at ON responses(flagged_at);

-- Update existing responses to have default values
UPDATE responses 
SET 
  is_addressed = false,
  is_flagged = false,
  addressed_at = NULL,
  flagged_at = NULL,
  notes = NULL
WHERE is_addressed IS NULL OR is_flagged IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN responses.is_addressed IS 'Whether the response has been addressed by the business owner';
COMMENT ON COLUMN responses.is_flagged IS 'Whether the response has been flagged for review';
COMMENT ON COLUMN responses.addressed_at IS 'Timestamp when the response was marked as addressed';
COMMENT ON COLUMN responses.flagged_at IS 'Timestamp when the response was flagged';
COMMENT ON COLUMN responses.notes IS 'Internal notes about the response';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'responses' 
  AND column_name IN ('is_addressed', 'is_flagged', 'addressed_at', 'flagged_at', 'notes')
ORDER BY column_name;
