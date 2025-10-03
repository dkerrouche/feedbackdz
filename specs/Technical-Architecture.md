# Technical Architecture Document
## Restaurant Feedback Platform - "FeedbackDZ"

**Version:** 1.0  
**Date:** October 2025  
**Author:** Solo Founder  
**Status:** Pre-Development

---

## 1. System Overview

### Architecture Philosophy
- **Mobile-First:** Progressive Web App (PWA) for maximum accessibility
- **Serverless:** Minimize infrastructure management overhead
- **AI-Native:** Leverage OpenAI APIs for transcription, analysis, and insights
- **Real-Time:** Live updates for restaurant dashboards
- **Scalable:** Stateless design for horizontal scaling

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   Restaurant    │    │   Admin Panel   │
│   Mobile Web    │    │   Dashboard     │    │   (Platform)    │
│   (PWA)         │    │   (Web App)     │    │   (Web App)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼───────┐         ┌────────▼────────┐
            │   API Gateway │         │   Static Assets │
            │   (Vercel)    │         │   (CDN)         │
            └───────┬───────┘         └─────────────────┘
                    │
            ┌───────▼───────┐
            │   Backend     │
            │   Services    │
            │   (Vercel)    │
            └───────┬───────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────▼───────┐ ┌─▼───────┐ ┌─▼─────────────┐
│   Database    │ │  File   │ │   AI Services │
│   (Supabase)  │ │ Storage │ │   (OpenAI)    │
│               │ │(Supabase)│ │               │
└───────────────┘ └─────────┘ └───────────────┘
```

---

## 2. Technology Stack

### Frontend Technologies
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS + Headless UI
- **State Management:** Zustand (lightweight)
- **PWA:** Next.js PWA plugin
- **Icons:** Lucide React
- **Charts:** Recharts
- **Audio:** Web Audio API + MediaRecorder API

### Backend Technologies
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Authentication:** Supabase Auth (OTP)
- **Database:** Supabase PostgreSQL
- **File Storage:** Supabase Storage
- **Real-time:** Supabase Realtime subscriptions
- **Queue:** Vercel Queue (for background jobs)

### AI & External Services
- **Voice Transcription:** OpenAI Whisper API
- **Text Analysis:** OpenAI GPT-4 API
- **Survey Generation:** OpenAI GPT-4 API
- **Sentiment Analysis:** OpenAI GPT-4 API
- **Keyword Extraction:** OpenAI GPT-4 API

### Infrastructure & Deployment
- **Hosting:** Vercel (Frontend + API)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **CDN:** Vercel Edge Network
- **Monitoring:** Vercel Analytics + Sentry
- **Domain:** Custom domain with SSL
- **Environment:** Vercel Environment Variables

### Development Tools
- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript
- **Testing:** Jest + React Testing Library
- **Deployment:** Vercel Git Integration

---

## 3. Database Schema

### Core Tables

#### `businesses`
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  location JSONB, -- {address, city, coordinates}
  logo_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  subscription_tier VARCHAR(20) DEFAULT 'trial'
);
```

#### `surveys`
```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  questions JSONB NOT NULL, -- [{type, text, required}, ...]
  languages JSONB DEFAULT '["ar", "fr"]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `responses`
```sql
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
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  is_spam BOOLEAN DEFAULT false
);
```

#### `ai_summaries`
```sql
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  summary_text TEXT NOT NULL,
  response_count INTEGER,
  sentiment_breakdown JSONB, -- {positive: 8, neutral: 2, negative: 1}
  keywords JSONB,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(business_id, date)
);
```

### Indexes for Performance
```sql
-- Response queries
CREATE INDEX idx_responses_business_created ON responses(business_id, created_at DESC);
CREATE INDEX idx_responses_survey_created ON responses(survey_id, created_at DESC);
CREATE INDEX idx_responses_sentiment ON responses(sentiment);

-- Survey queries
CREATE INDEX idx_surveys_business ON surveys(business_id);
CREATE INDEX idx_surveys_qr_code ON surveys(qr_code);

-- AI summaries
CREATE INDEX idx_ai_summaries_business_date ON ai_summaries(business_id, date DESC);
```

---

## 4. API Design

### RESTful Endpoints

#### Authentication
```
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/logout
GET  /api/auth/me
```

#### Business Management
```
GET    /api/businesses/me
PUT    /api/businesses/me
POST   /api/businesses/me/surveys
GET    /api/businesses/me/surveys
PUT    /api/businesses/me/surveys/{id}
DELETE /api/businesses/me/surveys/{id}
```

#### Response Collection
```
POST   /api/surveys/{qr_code}/responses
GET    /api/surveys/{qr_code}  # Public endpoint for survey data
```

#### Dashboard Data
```
GET /api/businesses/me/responses?page=1&limit=20&filter=...
GET /api/businesses/me/analytics?period=7d
GET /api/businesses/me/summaries?date=2025-01-15
```

#### AI Services
```
POST /api/ai/generate-survey
POST /api/ai/transcribe-audio
POST /api/ai/analyze-sentiment
POST /api/ai/extract-keywords
POST /api/ai/generate-summary
```

### Real-time Subscriptions (Supabase)
```typescript
// Real-time response updates
supabase
  .channel('responses')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'responses',
    filter: `business_id=eq.${businessId}`
  }, (payload) => {
    // Update dashboard in real-time
  })
  .subscribe();
```

---

## 5. Data Flow Architecture

### Customer Feedback Flow
```
1. Customer scans QR code
   ↓
2. Mobile web app loads survey
   ↓
3. Customer provides rating + voice/text feedback
   ↓
4. Audio uploaded to Supabase Storage
   ↓
5. Response stored in database
   ↓
6. Background job: Transcribe audio (OpenAI Whisper)
   ↓
7. Background job: Analyze sentiment (OpenAI GPT-4)
   ↓
8. Background job: Extract keywords (OpenAI GPT-4)
   ↓
9. Real-time update to restaurant dashboard
```

### AI Processing Pipeline
```
Audio File → Whisper API → Transcription
    ↓
Transcription → GPT-4 API → Sentiment Analysis
    ↓
Transcription → GPT-4 API → Keyword Extraction
    ↓
All Data → Database Update → Real-time Notification
```

### Daily Summary Generation
```
1. Cron job triggers at midnight (Vercel Cron)
   ↓
2. Query all responses from past 24 hours
   ↓
3. Generate summary using OpenAI GPT-4
   ↓
4. Store summary in database
   ↓
5. Send email notification to business owner
```

---

## 6. Security Architecture

### Authentication & Authorization
- **Phone OTP:** 6-digit code, 5-minute expiry
- **JWT Tokens:** Supabase handles token management
- **Rate Limiting:** Vercel Edge Config (100 requests/minute per IP)
- **CORS:** Restricted to production domains only

### Data Protection
- **HTTPS:** SSL certificates via Vercel
- **Encryption:** Audio files encrypted at rest (Supabase)
- **GDPR Compliance:** Data retention policies
- **Input Validation:** Zod schemas for all API inputs
- **SQL Injection:** Parameterized queries only

### Privacy Measures
- **Anonymous Responses:** No personal data collection
- **IP Hashing:** Store hashed IPs for spam detection
- **Data Minimization:** Only collect necessary data
- **Right to Delete:** Business can delete all data

---

## 7. Performance Optimization

### Frontend Performance
- **Code Splitting:** Next.js automatic code splitting
- **Image Optimization:** Next.js Image component
- **PWA Caching:** Service worker for offline capability
- **Bundle Size:** Tree shaking, dynamic imports
- **CDN:** Vercel Edge Network for global delivery

### Backend Performance
- **Database Indexing:** Optimized queries with proper indexes
- **Connection Pooling:** Supabase connection management
- **Caching:** Redis for frequently accessed data
- **Background Jobs:** Async processing for heavy operations
- **API Rate Limiting:** Prevent abuse and ensure fair usage

### Audio Processing Optimization
- **Compression:** WebM/Opus format for smaller files
- **Chunked Upload:** Large files uploaded in chunks
- **Progressive Enhancement:** Fallback to text if audio fails
- **Caching:** Transcribed results cached to avoid re-processing

---

## 8. Scalability Considerations

### Horizontal Scaling
- **Stateless API:** No server-side sessions
- **Database Scaling:** Supabase handles scaling automatically
- **CDN Distribution:** Global edge network
- **Microservices Ready:** Modular architecture for future splitting

### Load Handling
- **Concurrent Users:** 1,000+ simultaneous responses
- **Database Connections:** Supabase connection pooling
- **File Storage:** Supabase Storage with CDN
- **API Limits:** OpenAI rate limiting and retry logic

### Cost Optimization
- **Efficient Queries:** Optimized database queries
- **Caching Strategy:** Reduce API calls to OpenAI
- **Resource Monitoring:** Track usage and costs
- **Auto-scaling:** Vercel automatic scaling

---

## 9. Monitoring & Observability

### Application Monitoring
- **Error Tracking:** Sentry for error monitoring
- **Performance:** Vercel Analytics for web vitals
- **Uptime:** Vercel status page monitoring
- **Logs:** Structured logging with Winston

### Business Metrics
- **Response Rates:** Track QR scan to completion rate
- **Processing Times:** Monitor AI processing latency
- **User Engagement:** Dashboard usage analytics
- **Cost Tracking:** OpenAI API usage monitoring

### Alerting
- **Critical Errors:** Immediate Slack notifications
- **Performance Degradation:** Automated alerts
- **High Usage:** Cost threshold alerts
- **System Health:** Database and API health checks

---

## 10. Disaster Recovery

### Backup Strategy
- **Database Backups:** Supabase automated daily backups
- **File Backups:** Supabase Storage redundancy
- **Code Backups:** GitHub repository with branches
- **Configuration:** Environment variables in Vercel

### Recovery Procedures
- **Database Recovery:** Point-in-time recovery via Supabase
- **Application Recovery:** Vercel instant rollback capability
- **Data Migration:** Automated migration scripts
- **Incident Response:** Documented recovery procedures

---

## 11. Development Environment

### Local Development Setup
```bash
# Clone repository
git clone [repository-url]
cd feedbackdz

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Run tests
npm run test
```

### Environment Configuration
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Vercel
VERCEL_URL=your_vercel_url
VERCEL_ENV=development

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FeedbackDZ
```

---

## 12. Future Architecture Considerations

### Phase 2 Enhancements
- **Microservices:** Split AI processing into separate services
- **Message Queue:** Redis/RabbitMQ for better job management
- **Caching Layer:** Redis for improved performance
- **API Gateway:** Kong or AWS API Gateway for advanced routing

### Phase 3 Scaling
- **Multi-region:** Deploy to multiple regions
- **Database Sharding:** Horizontal database scaling
- **CDN Optimization:** Advanced caching strategies
- **Load Balancing:** Multiple server instances

### Technology Evolution
- **Edge Computing:** Vercel Edge Functions for global performance
- **AI Optimization:** Custom models for better accuracy
- **Real-time Features:** WebSocket connections for live updates
- **Mobile Apps:** React Native for native mobile experience

---

## 13. Risk Mitigation

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API Downtime | High | Fallback to text-only, cached responses |
| Database Performance | Medium | Proper indexing, query optimization |
| Audio Processing Failures | Medium | Text fallback, retry mechanisms |
| Scalability Issues | Low | Stateless design, horizontal scaling |

### Security Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Data Breach | Critical | Encryption, access controls, monitoring |
| Spam/Abuse | Medium | Rate limiting, IP tracking, validation |
| API Abuse | Medium | Authentication, rate limiting, monitoring |
| Privacy Violations | High | GDPR compliance, data minimization |

---

**Document Status:** APPROVED for Development  
**Next Steps:** Proceed to Development Plan Implementation