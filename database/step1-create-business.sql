-- Step 1: Create a business for testing
-- Run this first in your Supabase SQL Editor

INSERT INTO businesses (id, phone, name, category, description, location, subscription_tier, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '+213123456789',
  'Café El Djazair',
  'restaurant',
  'Traditional Algerian café serving authentic local cuisine and fresh pastries',
  '{"address": "123 Rue Didouche Mourad, Algiers", "city": "Algiers", "country": "Algeria"}',
  'free',
  NOW() - INTERVAL '30 days',
  NOW()
) ON CONFLICT (phone) DO NOTHING;

-- Verify the business was created
SELECT id, name, phone FROM businesses WHERE phone = '+213123456789';
