-- Database indexes for enhanced filtering performance
-- Feature 0011: Enhanced Server-Side Filtering and Analytics API

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_responses_business_rating ON responses(business_id, rating);
CREATE INDEX IF NOT EXISTS idx_responses_business_sentiment ON responses(business_id, sentiment);
CREATE INDEX IF NOT EXISTS idx_responses_business_flagged ON responses(business_id, is_flagged);
CREATE INDEX IF NOT EXISTS idx_responses_business_addressed ON responses(business_id, is_addressed);

-- Index for audio/text filtering
CREATE INDEX IF NOT EXISTS idx_responses_business_audio ON responses(business_id, audio_url) WHERE audio_url IS NOT NULL;

-- Composite index for date range + rating (common combination)
CREATE INDEX IF NOT EXISTS idx_responses_business_date_rating ON responses(business_id, created_at DESC, rating);

-- Composite index for date range + sentiment (common combination)
CREATE INDEX IF NOT EXISTS idx_responses_business_date_sentiment ON responses(business_id, created_at DESC, sentiment);

-- Index for survey filtering
CREATE INDEX IF NOT EXISTS idx_responses_survey_created ON responses(survey_id, created_at DESC);

-- GIN index for keyword search (if using JSONB keywords extensively)
CREATE INDEX IF NOT EXISTS idx_responses_keywords_gin ON responses USING GIN (keywords);

-- Text search index for transcription (using trigram for ILIKE queries)
-- Note: This requires pg_trgm extension to be enabled
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_responses_transcription_trgm ON responses USING GIN (transcription gin_trgm_ops);

-- Verify existing indexes are still optimal
-- The following indexes should already exist from schema.sql:
-- idx_responses_business_created ON responses(business_id, created_at DESC)
-- idx_responses_survey_created ON responses(survey_id, created_at DESC) 
-- idx_responses_sentiment ON responses(sentiment)

-- Performance notes:
-- 1. These indexes support the most common filter combinations
-- 2. Postgres will use multiple indexes when beneficial
-- 3. The business_id + created_at DESC index is most important for pagination
-- 4. Consider monitoring query performance and adjusting based on actual usage patterns
