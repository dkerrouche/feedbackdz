-- Step 2: Create a survey for the business
-- Run this after Step 1 in your Supabase SQL Editor

INSERT INTO surveys (id, business_id, qr_code, questions, languages, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'CAFE_EL_DJAZAIR_001',
  '[
    {"id": "q1", "text": "How would you rate your overall experience?", "type": "rating", "required": true},
    {"id": "q2", "text": "What did you think about the food quality?", "type": "text", "required": true},
    {"id": "q3", "text": "How was the service?", "type": "text", "required": false}
  ]',
  '["ar", "fr", "en"]',
  true,
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (qr_code) DO NOTHING;

-- Verify the survey was created
SELECT id, qr_code, business_id FROM surveys WHERE qr_code = 'CAFE_EL_DJAZAIR_001';
