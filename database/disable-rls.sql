-- Temporarily disable RLS for development
-- Run this in Supabase SQL Editor

ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries DISABLE ROW LEVEL SECURITY;

-- This will allow all operations without authentication
-- Re-enable RLS later with proper policies when ready for production