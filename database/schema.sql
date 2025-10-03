-- FeedbackDZ Database Schema
-- Created: October 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  location JSONB, -- {address, city, coordinates}
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'trial'
);

-- Create surveys table
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  questions JSONB NOT NULL, -- [{type, text, required}, ...]
  languages JSONB DEFAULT '["ar", "fr"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  sentiment_score DECIMAL(3,2), -- 0.00 to 1.00
  transcription TEXT,
  audio_url TEXT,
  keywords JSONB, -- extracted keywords/tags
  language VARCHAR(10),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  is_spam BOOLEAN DEFAULT false
);

-- Create ai_summaries table
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary_text TEXT NOT NULL,
  response_count INTEGER,
  sentiment_breakdown JSONB, -- {positive: 8, neutral: 2, negative: 1}
  keywords JSONB,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_responses_business_created ON responses(business_id, created_at DESC);
CREATE INDEX idx_responses_survey_created ON responses(survey_id, created_at DESC);
CREATE INDEX idx_responses_sentiment ON responses(sentiment);
CREATE INDEX idx_surveys_business ON surveys(business_id);
CREATE INDEX idx_surveys_qr_code ON surveys(qr_code);
CREATE INDEX idx_ai_summaries_business_date ON ai_summaries(business_id, date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surveys_updated_at BEFORE UPDATE ON surveys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
CREATE POLICY "Users can view their own business" ON businesses
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own business" ON businesses
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own business" ON businesses
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for surveys
CREATE POLICY "Users can view their own surveys" ON surveys
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can update their own surveys" ON surveys
  FOR UPDATE USING (business_id IN (SELECT id FROM businesses WHERE auth.uid()::text = id::text));

CREATE POLICY "Users can insert their own surveys" ON surveys
  FOR INSERT WITH CHECK (business_id IN (SELECT id FROM businesses WHERE auth.uid()::text = id::text));

-- Create RLS policies for responses
CREATE POLICY "Users can view their own responses" ON responses
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE auth.uid()::text = id::text));

CREATE POLICY "Anyone can insert responses" ON responses
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for ai_summaries
CREATE POLICY "Users can view their own summaries" ON ai_summaries
  FOR SELECT USING (business_id IN (SELECT id FROM businesses WHERE auth.uid()::text = id::text));

CREATE POLICY "Service role can insert summaries" ON ai_summaries
  FOR INSERT WITH CHECK (true);

-- Create a function to generate QR codes
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QR_' || substr(md5(random()::text), 1, 16);
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO businesses (id, phone, name, category, description) VALUES
  ('00000000-0000-0000-0000-000000000001', '+213123456789', 'Restaurant Test', 'Italian', 'A test restaurant for development');

INSERT INTO surveys (business_id, qr_code, questions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'QR_TEST_123456789', 
   '[{"type": "rating", "text": "How was your experience?", "required": true}, {"type": "text", "text": "What did you like?", "required": false}, {"type": "voice", "text": "What can we improve?", "required": false}]');