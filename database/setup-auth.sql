-- Complete Auth Setup for FeedbackDZ
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- 2. Add user_id column to businesses if not exists
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create index for user_id
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;
DROP POLICY IF EXISTS "Users can update their own business" ON businesses;
DROP POLICY IF EXISTS "Users can insert their own business" ON businesses;
DROP POLICY IF EXISTS "Users can delete their own business" ON businesses;

DROP POLICY IF EXISTS "Users can view their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can insert their own surveys" ON surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON surveys;
DROP POLICY IF EXISTS "Public can view surveys by QR code" ON surveys;

DROP POLICY IF EXISTS "Users can view their own responses" ON responses;
DROP POLICY IF EXISTS "Public can insert responses" ON responses;
DROP POLICY IF EXISTS "Public can view responses by survey" ON responses;

DROP POLICY IF EXISTS "Users can view their own summaries" ON ai_summaries;

-- 5. Create RLS policies for businesses
CREATE POLICY "Users can view their own business" ON businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business" ON businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business" ON businesses
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for surveys
CREATE POLICY "Users can view their own surveys" ON surveys
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can update their own surveys" ON surveys
  FOR UPDATE USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can insert their own surveys" ON surveys
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can delete their own surveys" ON surveys
  FOR DELETE USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

-- Allow public to view surveys by QR code (for customer feedback)
CREATE POLICY "Public can view surveys by QR code" ON surveys
  FOR SELECT USING (is_active = true);

-- 7. Create RLS policies for responses
CREATE POLICY "Users can view their own responses" ON responses
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

-- Allow public to insert responses (customers submitting feedback)
CREATE POLICY "Public can insert responses" ON responses
  FOR INSERT WITH CHECK (true);

-- Allow public to view responses for their survey (optional, for confirmation)
CREATE POLICY "Public can view responses by survey" ON responses
  FOR SELECT USING (true);

-- 8. Create RLS policies for ai_summaries
CREATE POLICY "Users can view their own summaries" ON ai_summaries
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

CREATE POLICY "Users can insert their own summaries" ON ai_summaries
  FOR INSERT WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE auth.uid() = user_id
    )
  );

-- 9. Add helpful comments
COMMENT ON COLUMN businesses.user_id IS 'Links business to authenticated user via auth.users.id';
COMMENT ON TABLE businesses IS 'Restaurant/business profiles owned by authenticated users';
COMMENT ON TABLE surveys IS 'Feedback surveys created by businesses';
COMMENT ON TABLE responses IS 'Customer feedback responses (public can submit)';
COMMENT ON TABLE ai_summaries IS 'AI-generated summaries of feedback';

-- 10. Verify the setup
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('businesses', 'surveys', 'responses', 'ai_summaries')
ORDER BY tablename, policyname;

-- 11. Check if user_id column exists
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name = 'user_id';
