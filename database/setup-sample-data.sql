-- Complete sample data setup for testing dashboard features
-- This script sets up all necessary data for testing charts and analytics

-- 1. Ensure business exists
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

-- 2. Ensure survey exists
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

-- 3. Clear existing responses to avoid duplicates
DELETE FROM responses WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';

-- 4. Insert comprehensive sample responses
-- This creates a realistic distribution of responses over the last 30 days
-- with various ratings, sentiments, and keywords for testing all chart types

-- High-rated responses (4-5 stars) - Positive sentiment
INSERT INTO responses (id, survey_id, business_id, rating, sentiment, sentiment_score, transcription, keywords, language, ip_address, user_agent, created_at, processed_at, is_spam) VALUES
-- Recent responses (last 7 days)
('resp-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.9, 'Excellent food and service! The couscous was amazing and the staff was very friendly.', '["food", "service", "excellent", "couscous", "staff", "friendly"]', 'en', '192.168.1.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', false),
('resp-002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.85, 'Très bon restaurant! La nourriture était délicieuse et le service impeccable.', '["restaurant", "nourriture", "délicieuse", "service", "impeccable"]', 'fr', '192.168.1.2', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', false),
('resp-003', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.8, 'Good experience overall. The atmosphere was nice and the food was tasty.', '["experience", "atmosphere", "nice", "food", "tasty"]', 'en', '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', false),
('resp-004', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.95, 'مطعم رائع! الطعام لذيذ والخدمة ممتازة. أنصح به بشدة.', '["مطعم", "رائع", "طعام", "لذيذ", "خدمة", "ممتازة"]', 'ar', '192.168.1.4', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', false),
('resp-005', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.75, 'Great place! The coffee was perfect and the pastries were fresh.', '["place", "coffee", "perfect", "pastries", "fresh"]', 'en', '192.168.1.5', 'Mozilla/5.0 (Android 10; Mobile; rv:68.0)', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', false),
('resp-006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.9, 'Amazing experience! The traditional dishes were authentic and delicious.', '["amazing", "experience", "traditional", "dishes", "authentic", "delicious"]', 'en', '192.168.1.6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', false),
('resp-007', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.8, 'Very good restaurant with excellent service and tasty food.', '["good", "restaurant", "excellent", "service", "tasty", "food"]', 'en', '192.168.1.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X)', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', false),

-- Medium-rated responses (3 stars) - Neutral sentiment
('resp-008', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.5, 'It was okay. The food was decent but nothing special. Service was average.', '["okay", "food", "decent", "service", "average"]', 'en', '192.168.1.8', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', false),
('resp-009', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.45, 'Pas mal mais pourrait être mieux. Le service était un peu lent.', '["pas", "mal", "mieux", "service", "lent"]', 'fr', '192.168.1.9', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X)', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', false),
('resp-010', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.55, 'الطعام مقبول لكن الأسعار مرتفعة قليلاً.', '["طعام", "مقبول", "أسعار", "مرتفعة"]', 'ar', '192.168.1.10', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', false),
('resp-011', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.6, 'Average experience. Nothing special but not bad either.', '["average", "experience", "special", "bad"]', 'en', '192.168.1.11', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X)', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days', false),
('resp-012', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.5, 'Decent place but could improve the service speed.', '["decent", "place", "improve", "service", "speed"]', 'en', '192.168.1.12', 'Mozilla/5.0 (Android 10; Mobile; rv:68.0)', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', false),

-- Low-rated responses (1-2 stars) - Negative sentiment
('resp-013', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, 'negative', 0.2, 'Disappointed with the service. Food was cold and the waiter was rude.', '["disappointed", "service", "food", "cold", "waiter", "rude"]', 'en', '192.168.1.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days', false),
('resp-014', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 1, 'negative', 0.1, 'Très déçu. La nourriture était mauvaise et le service terrible.', '["déçu", "nourriture", "mauvaise", "service", "terrible"]', 'fr', '192.168.1.14', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', false),
('resp-015', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, 'negative', 0.25, 'Poor service and overpriced food. Not worth the money.', '["poor", "service", "overpriced", "food", "money"]', 'en', '192.168.1.15', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', false),
('resp-016', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 1, 'negative', 0.15, 'Terrible experience. Rude staff and bad food quality.', '["terrible", "experience", "rude", "staff", "bad", "food", "quality"]', 'en', '192.168.1.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days', false),

-- More responses for trend analysis (spread across the last 30 days)
('resp-017', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.8, 'Nice atmosphere and good food. Will come back again.', '["atmosphere", "good", "food", "come", "back"]', 'en', '192.168.1.17', 'Mozilla/5.0 (Android 12; Mobile; rv:68.0)', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', false),
('resp-018', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.9, 'Excellent! The best restaurant in the area. Highly recommended.', '["excellent", "best", "restaurant", "area", "recommended"]', 'en', '192.168.1.18', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', false),
('resp-019', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 3, 'neutral', 0.5, 'Average experience. Nothing special but not bad either.', '["average", "experience", "special", "bad"]', 'en', '192.168.1.19', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X)', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', false),
('resp-020', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.85, 'Good food and friendly staff. The location is convenient.', '["good", "food", "friendly", "staff", "location", "convenient"]', 'en', '192.168.1.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days', false),
('resp-021', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.95, 'Perfect! Everything was amazing. The couscous was the best I ever had.', '["perfect", "amazing", "couscous", "best"]', 'en', '192.168.1.21', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', NOW() - INTERVAL '26 days', NOW() - INTERVAL '26 days', false),
('resp-022', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 2, 'negative', 0.3, 'Not satisfied with the quality. Food was bland and service was slow.', '["satisfied", "quality", "food", "bland", "service", "slow"]', 'en', '192.168.1.22', 'Mozilla/5.0 (Android 10; Mobile; rv:68.0)', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days', false),
('resp-023', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.8, 'Great place with authentic Algerian cuisine. Highly recommend!', '["great", "place", "authentic", "algerian", "cuisine", "recommend"]', 'en', '192.168.1.23', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', false);

-- Add some responses with audio URLs for testing audio features
INSERT INTO responses (id, survey_id, business_id, rating, sentiment, sentiment_score, transcription, audio_url, keywords, language, ip_address, user_agent, created_at, processed_at, is_spam) VALUES
('resp-024', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 5, 'positive', 0.9, 'This is a voice response. The food was absolutely delicious and the service was outstanding!', 'https://example.com/audio/resp-024.webm', '["voice", "food", "delicious", "service", "outstanding"]', 'en', '192.168.1.24', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X)', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', false),
('resp-025', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 4, 'positive', 0.8, 'Voice feedback: Great atmosphere and good coffee. Will definitely return.', 'https://example.com/audio/resp-025.webm', '["voice", "atmosphere", "coffee", "return"]', 'en', '192.168.1.25', 'Mozilla/5.0 (Android 12; Mobile; rv:68.0)', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', false);

-- 5. Create AI summaries for testing
INSERT INTO ai_summaries (id, business_id, date, summary_text, response_count, sentiment_breakdown, top_keywords, created_at, updated_at)
VALUES (
  'ai-summary-001',
  '550e8400-e29b-41d4-a716-446655440000',
  CURRENT_DATE,
  'Today was a great day for Café El Djazair! We received mostly positive feedback with customers praising our authentic Algerian cuisine and friendly service. The couscous and traditional dishes were particularly well-received. A few customers mentioned that service could be faster during peak hours, which we will address.',
  25,
  '{"positive": 15, "neutral": 7, "negative": 3}',
  '["food", "service", "couscous", "authentic", "friendly", "atmosphere"]',
  NOW(),
  NOW()
) ON CONFLICT (business_id, date) DO NOTHING;
