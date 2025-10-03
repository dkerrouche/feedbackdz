-- Fix RLS policies for FeedbackDZ
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;

DROP POLICY IF EXISTS "Users can view their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can insert their own surveys" ON surveys;

DROP POLICY IF EXISTS "Users can view their own responses" ON responses;
DROP POLICY IF EXISTS "Anyone can insert responses" ON responses;

DROP POLICY IF EXISTS "Users can view their own summaries" ON ai_summaries;
DROP POLICY IF EXISTS "Service role can insert summaries" ON ai_summaries;

-- Create new, more permissive policies for development
-- Businesses table
CREATE POLICY "Allow all operations on businesses" ON businesses
  FOR ALL USING (true) WITH CHECK (true);

-- Surveys table  
CREATE POLICY "Allow all operations on surveys" ON surveys
  FOR ALL USING (true) WITH CHECK (true);

-- Responses table
CREATE POLICY "Allow all operations on responses" ON responses
  FOR ALL USING (true) WITH CHECK (true);

-- AI summaries table
CREATE POLICY "Allow all operations on ai_summaries" ON ai_summaries
  FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to keep RLS enabled but more permissive
-- You can also temporarily disable RLS for development:
-- ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE surveys DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE responses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE ai_summaries DISABLE ROW LEVEL SECURITY;