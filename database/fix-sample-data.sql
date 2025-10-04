-- Fixed sample data setup that handles existing business data
-- This script will work with whatever business ID already exists

-- 1. First, let's check what business exists and use that ID
-- If no business exists, we'll create one with a proper UUID

-- Check if there's any business in the database
DO $$
DECLARE
    existing_business_id UUID;
    existing_survey_id UUID;
BEGIN
    -- Get the first business ID that exists
    SELECT id INTO existing_business_id FROM businesses LIMIT 1;
    
    IF existing_business_id IS NULL THEN
        -- No business exists, create one
        INSERT INTO businesses (id, phone, name, category, description, location, subscription_tier, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            '+213123456789',
            'Café El Djazair',
            'restaurant',
            'Traditional Algerian café serving authentic local cuisine and fresh pastries',
            '{"address": "123 Rue Didouche Mourad, Algiers", "city": "Algiers", "country": "Algeria"}',
            'free',
            NOW() - INTERVAL '30 days',
            NOW()
        ) RETURNING id INTO existing_business_id;
        
        RAISE NOTICE 'Created new business with ID: %', existing_business_id;
    ELSE
        RAISE NOTICE 'Using existing business with ID: %', existing_business_id;
    END IF;
    
    -- Check if there's a survey for this business
    SELECT id INTO existing_survey_id FROM surveys WHERE business_id = existing_business_id LIMIT 1;
    
    IF existing_survey_id IS NULL THEN
        -- No survey exists, create one
        INSERT INTO surveys (id, business_id, qr_code, questions, languages, is_active, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            existing_business_id,
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
        ) RETURNING id INTO existing_survey_id;
        
        RAISE NOTICE 'Created new survey with ID: %', existing_survey_id;
    ELSE
        RAISE NOTICE 'Using existing survey with ID: %', existing_survey_id;
    END IF;
    
    -- Clear existing responses for this business to avoid duplicates
    DELETE FROM responses WHERE business_id = existing_business_id;
    RAISE NOTICE 'Cleared existing responses for business: %', existing_business_id;
    
    -- Store the IDs in a temporary table for use in the main script
    CREATE TEMP TABLE temp_ids (business_id UUID, survey_id UUID);
    INSERT INTO temp_ids VALUES (existing_business_id, existing_survey_id);
    
END $$;

-- 2. Now insert sample responses using the actual business and survey IDs
INSERT INTO responses (id, survey_id, business_id, rating, sentiment, sentiment_score, transcription, keywords, language, ip_address, user_agent, created_at, processed_at, is_spam)
SELECT 
    'resp-' || generate_series(1, 25)::text,
    ti.survey_id,
    ti.business_id,
    CASE 
        WHEN generate_series(1, 25) % 4 = 0 THEN 5
        WHEN generate_series(1, 25) % 4 = 1 THEN 4
        WHEN generate_series(1, 25) % 4 = 2 THEN 3
        ELSE 2
    END as rating,
    CASE 
        WHEN generate_series(1, 25) % 4 = 0 THEN 'positive'
        WHEN generate_series(1, 25) % 4 = 1 THEN 'positive'
        WHEN generate_series(1, 25) % 4 = 2 THEN 'neutral'
        ELSE 'negative'
    END as sentiment,
    CASE 
        WHEN generate_series(1, 25) % 4 = 0 THEN 0.9
        WHEN generate_series(1, 25) % 4 = 1 THEN 0.8
        WHEN generate_series(1, 25) % 4 = 2 THEN 0.5
        ELSE 0.2
    END as sentiment_score,
    'Sample response ' || generate_series(1, 25)::text || ' - This is a test response for dashboard testing.',
    ARRAY['test', 'sample', 'response', 'dashboard'],
    CASE generate_series(1, 25) % 3
        WHEN 0 THEN 'en'
        WHEN 1 THEN 'fr'
        ELSE 'ar'
    END as language,
    '192.168.1.' || (generate_series(1, 25) % 254 + 1)::text as ip_address,
    'Mozilla/5.0 (compatible; TestBot/1.0)' as user_agent,
    NOW() - (generate_series(1, 25) * INTERVAL '1 day') as created_at,
    NOW() - (generate_series(1, 25) * INTERVAL '1 day') as processed_at,
    false as is_spam
FROM temp_ids ti;

-- 3. Add some specific responses with more realistic data
INSERT INTO responses (id, survey_id, business_id, rating, sentiment, sentiment_score, transcription, keywords, language, ip_address, user_agent, created_at, processed_at, is_spam)
SELECT 
    'resp-real-' || generate_series(1, 10)::text,
    ti.survey_id,
    ti.business_id,
    CASE generate_series(1, 10)
        WHEN 1 THEN 5
        WHEN 2 THEN 4
        WHEN 3 THEN 5
        WHEN 4 THEN 3
        WHEN 5 THEN 4
        WHEN 6 THEN 2
        WHEN 7 THEN 5
        WHEN 8 THEN 3
        WHEN 9 THEN 1
        ELSE 4
    END as rating,
    CASE generate_series(1, 10)
        WHEN 1 THEN 'positive'
        WHEN 2 THEN 'positive'
        WHEN 3 THEN 'positive'
        WHEN 4 THEN 'neutral'
        WHEN 5 THEN 'positive'
        WHEN 6 THEN 'negative'
        WHEN 7 THEN 'positive'
        WHEN 8 THEN 'neutral'
        WHEN 9 THEN 'negative'
        ELSE 'positive'
    END as sentiment,
    CASE generate_series(1, 10)
        WHEN 1 THEN 0.9
        WHEN 2 THEN 0.8
        WHEN 3 THEN 0.95
        WHEN 4 THEN 0.5
        WHEN 5 THEN 0.75
        WHEN 6 THEN 0.2
        WHEN 7 THEN 0.9
        WHEN 8 THEN 0.6
        WHEN 9 THEN 0.1
        ELSE 0.8
    END as sentiment_score,
    CASE generate_series(1, 10)
        WHEN 1 THEN 'Excellent food and service! The couscous was amazing and the staff was very friendly.'
        WHEN 2 THEN 'Good experience overall. The atmosphere was nice and the food was tasty.'
        WHEN 3 THEN 'Perfect! Everything was amazing. The couscous was the best I ever had.'
        WHEN 4 THEN 'It was okay. The food was decent but nothing special. Service was average.'
        WHEN 5 THEN 'Great place! The coffee was perfect and the pastries were fresh.'
        WHEN 6 THEN 'Disappointed with the service. Food was cold and the waiter was rude.'
        WHEN 7 THEN 'Amazing experience! The traditional dishes were authentic and delicious.'
        WHEN 8 THEN 'Average experience. Nothing special but not bad either.'
        WHEN 9 THEN 'Terrible experience. Rude staff and bad food quality.'
        ELSE 'Very good restaurant with excellent service and tasty food.'
    END as transcription,
    CASE generate_series(1, 10)
        WHEN 1 THEN ARRAY['food', 'service', 'excellent', 'couscous', 'staff', 'friendly']
        WHEN 2 THEN ARRAY['experience', 'atmosphere', 'nice', 'food', 'tasty']
        WHEN 3 THEN ARRAY['perfect', 'amazing', 'couscous', 'best']
        WHEN 4 THEN ARRAY['okay', 'food', 'decent', 'service', 'average']
        WHEN 5 THEN ARRAY['place', 'coffee', 'perfect', 'pastries', 'fresh']
        WHEN 6 THEN ARRAY['disappointed', 'service', 'food', 'cold', 'waiter', 'rude']
        WHEN 7 THEN ARRAY['amazing', 'experience', 'traditional', 'dishes', 'authentic', 'delicious']
        WHEN 8 THEN ARRAY['average', 'experience', 'special', 'bad']
        WHEN 9 THEN ARRAY['terrible', 'experience', 'rude', 'staff', 'bad', 'food', 'quality']
        ELSE ARRAY['good', 'restaurant', 'excellent', 'service', 'tasty', 'food']
    END as keywords,
    CASE generate_series(1, 10) % 3
        WHEN 0 THEN 'en'
        WHEN 1 THEN 'fr'
        ELSE 'ar'
    END as language,
    '192.168.1.' || (generate_series(1, 10) + 100)::text as ip_address,
    'Mozilla/5.0 (compatible; TestBot/1.0)' as user_agent,
    NOW() - (generate_series(1, 10) * INTERVAL '2 days') as created_at,
    NOW() - (generate_series(1, 10) * INTERVAL '2 days') as processed_at,
    false as is_spam
FROM temp_ids ti;

-- 4. Create AI summary for the business
INSERT INTO ai_summaries (id, business_id, date, summary_text, response_count, sentiment_breakdown, top_keywords, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    ti.business_id,
    CURRENT_DATE,
    'Today was a great day for our restaurant! We received mostly positive feedback with customers praising our authentic cuisine and friendly service. The traditional dishes were particularly well-received. A few customers mentioned that service could be faster during peak hours, which we will address.',
    35,
    '{"positive": 20, "neutral": 10, "negative": 5}',
    '["food", "service", "excellent", "couscous", "staff", "friendly", "atmosphere", "traditional", "authentic"]',
    NOW(),
    NOW()
FROM temp_ids ti
ON CONFLICT (business_id, date) DO NOTHING;

-- 5. Clean up
DROP TABLE temp_ids;

-- Show summary
SELECT 
    'Sample data setup complete!' as status,
    COUNT(*) as total_responses,
    AVG(rating) as average_rating,
    COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_responses,
    COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_responses,
    COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_responses
FROM responses;
