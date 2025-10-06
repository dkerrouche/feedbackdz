# Context Map for AI Agents & Context Engineering

**Purpose**: This document provides a structured reference for AI agents working on the FeedbackDZ codebase. Each section groups related files with their purpose, key exports, and when to reference them.

---

## 📋 Product & Architecture Specs

### High-Level Documentation
Files to understand product vision, technical decisions, and system design.

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `specs/PRD.md` | Product Requirements Document - features, user stories, success metrics | Understanding product goals, MVP scope, user personas |
| `specs/Technical-Architecture.md` | System architecture, tech stack, data flows, security | Understanding overall system design, deployment, scalability |
| `specs/Development-Plan.md` | Implementation roadmap and milestones | Planning feature development sequence |
| `specs/current_context.md` | Current development state and recent changes | Getting up-to-date on latest work |
| `specs/state.md` | Codebase structure overview and component interactions | Quick reference for file locations and responsibilities |

**Key Concepts**:
- Next.js 14 App Router + Supabase + OpenAI architecture
- Mobile-first PWA for restaurant feedback
- Real-time dashboard with AI processing pipeline
- Arabic/French/Darija support

---

## 🗄️ Database Schema & Migrations

### Database Structure
Files defining data models, relationships, and access policies.

| File | Purpose | Key Tables/Concepts |
|------|---------|---------------------|
| `database/schema.sql` | Core schema: tables, indexes, RLS policies, triggers | `businesses`, `surveys`, `responses`, `ai_summaries` |
| `database/setup-auth.sql` | Supabase Auth configuration and phone OTP setup | Auth flows, user management |
| `database/setup-storage.sql` | Storage buckets for audio files | Audio upload policies |
| `database/fix-rls-policies.sql` | Row Level Security policy fixes | Access control debugging |
| `database/add-response-management-fields.sql` | Response flags (addressed, flagged, notes) | Response management features |
| `database/setup-sample-data.sql` | Test data for development | Local testing setup |

**Key Concepts**:
- RLS policies: businesses see only their data
- Public can INSERT responses (survey submissions)
- Service role bypasses RLS for server operations
- JSONB fields: `questions`, `keywords`, `location`

---

## 🔧 Core Library Files (`src/lib/`)

### Integration & Business Logic
Reusable logic for external services and data processing.

#### Authentication & Database

| File | Exports | Purpose |
|------|---------|---------|
| `lib/supabase.ts` | `supabase`, `createSupabaseAdmin()` | Client-side Supabase client (anon key) |
| `lib/supabase-server.ts` | `supabaseServer` | Server-side client with service role key |

**When to use**:
- Use `supabase` in client components for realtime, auth
- Use `supabaseServer` in API routes for privileged operations

#### AI Services

| File | Exports | Purpose |
|------|---------|---------|
| `lib/openai.ts` | `generateSurveyQuestions()`, `SurveyQuestion` | GPT-4 survey generation with language support |

**Key Functions**:
- `generateSurveyQuestions(request)`: Creates 3 contextual questions (1 rating + 2 text)
- Supports Arabic, French, English
- Falls back to default questions on API failure

#### Analytics & Data Processing

| File | Exports | Purpose |
|------|---------|---------|
| `lib/analytics.ts` | `calculateAnalytics()`, `getDefaultFilters()`, `formatDateRange()` | Compute metrics from responses |
| `lib/response-filters.ts` | Filter utilities | Client-side response filtering |
| `lib/response-management.ts` | `updateResponse()`, `deleteResponse()`, `exportResponses()`, batch operations | Response CRUD operations |

**Key Functions**:
- `calculateAnalytics(responses, filters)`: Returns `AnalyticsData` with trends, sentiment, keywords
- `exportResponses(businessId, filters)`: Downloads CSV with filtered data
- `updateResponse(id, action, data)`: PATCH operations (mark addressed, flag, spam)

#### Audio Processing

| File | Purpose |
|------|---------|
| `lib/audio/` | Audio recording, format conversion, playback utilities |

#### Utilities

| File | Exports | Purpose |
|------|---------|---------|
| `utils/qr.ts` | `generateQrPngDataUrl()`, `generateQrSvgString()`, download helpers | QR code generation for surveys |
| `lib/sample-data.ts` | Mock data generators | Development/testing |
| `lib/test-connection.ts` | Connection testers | Debugging Supabase/OpenAI |

---

## 🎣 React Hooks (`src/hooks/`)

### Custom Hooks for State Management

| File | Hook | Purpose | Returns |
|------|------|---------|---------|
| `hooks/useRealtimeResponses.ts` | `useRealtimeResponses({ businessId, enabled })` | Supabase Realtime subscription for responses | `{ responses, loading, error, isConnected, addResponse, updateResponse, removeResponse }` |

**How it works**:
1. Loads initial 50 responses on mount
2. Subscribes to INSERT/UPDATE/DELETE events filtered by `business_id`
3. Automatically updates local state when DB changes
4. Cleans up subscription on unmount

**When to use**: Any component needing live response updates (dashboard feed)

---

## 📦 TypeScript Types (`src/types/`)

### Type Definitions

| File | Key Types | Purpose |
|------|-----------|---------|
| `types/index.ts` | `Business`, `Survey`, `Response`, `AISummary`, `RealtimeResponse`, `AnalyticsData`, `ResponseFilters` | All shared type definitions |

**Important Types**:
- `RealtimeResponse`: Extended response with management fields (`is_flagged`, `is_addressed`, `notes`)
- `AnalyticsData`: Complete analytics payload structure
- `ResponseFilters`: Filter criteria for queries
- `Question`: Survey question structure (`type`, `text`, `required`)

---

## 🌐 API Routes (`src/app/api/`)

### RESTful Endpoints
Server-side API routes handling business logic.

#### Responses API

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/responses` | POST | `api/responses/route.ts` | Create response, trigger AI processing |
| `/api/responses` | GET | `api/responses/route.ts` | List responses with pagination & filters |
| `/api/responses/[id]` | PATCH | `api/responses/[id]/route.ts` | Update response (flag, address, notes) |
| `/api/responses/[id]` | DELETE | `api/responses/[id]/route.ts` | Delete response |
| `/api/responses/export` | GET | `api/responses/export/route.ts` | Export filtered responses as CSV |

**POST /api/responses Flow**:
1. Validates `survey_id`, `business_id`, `rating`
2. Inserts response with IP/user-agent
3. If `audio_url` present → triggers `processAudioInBackground()`
4. Background job calls `/api/ai/transcribe` → `/api/ai/analyze` → updates response

**Query Parameters (GET)**:
- `business_id` (required)
- `page`, `limit` (pagination)
- `start_date`, `end_date` (date range)
- `ratings` (comma-separated: `5,4`)
- `sentiments` (comma-separated: `positive,neutral`)
- `search` (text search in transcription/keywords)
- `qrs` (comma-separated QR codes)

#### Surveys API

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/surveys` | POST | `api/surveys/route.ts` | Create survey with QR code |
| `/api/surveys` | GET | `api/surveys/route.ts` | List business surveys |
| `/api/surveys/[qr_code]` | GET | `api/surveys/[qr_code]/route.ts` | Fetch survey by QR (public) |

#### Analytics API

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/analytics` | GET | `api/analytics/route.ts` | Compute analytics for business |

**Returns**: `AnalyticsData` with totals, averages, sentiment breakdown, trends, keywords

#### AI Services API

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/ai/generate-survey` | POST | `api/ai/generate-survey/route.ts` | Generate survey questions via GPT-4 |
| `/api/ai/transcribe` | POST | `api/ai/transcribe/route.ts` | Transcribe audio via Whisper API |
| `/api/ai/analyze` | POST | `api/ai/analyze/route.ts` | Extract sentiment + keywords via GPT-4 |

**AI Pipeline**:
```
Audio Upload → Transcribe (Whisper) → Analyze (GPT-4) → Update Response
```

---

## 🎨 React Components (`src/components/`)

### Component Organization

#### Authentication Components (`components/auth/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `PhoneAuth.tsx` | Phone OTP login form | - |
| `ProtectedRoute.tsx` | Auth guard wrapper | `children` |

#### Dashboard Components (`components/dashboard/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `ResponseFeed.tsx` | List of response items with infinite scroll | `responses`, `onResponseClick` |
| `ResponseItem.tsx` | Single response card | `response`, `onClick` |
| `ResponseFilters.tsx` | Filter UI (date, rating, sentiment, search) | `filters`, `onFiltersChange` |
| `ResponseDetailModal.tsx` | Full response view with actions | `response`, `isOpen`, `onClose` |
| `AnalyticsCards.tsx` | Metric cards (total, avg rating, sentiment) | `analytics` |
| `DashboardCharts.tsx` | Trend charts wrapper | `analytics` |
| `charts/` | Individual chart components (line, bar, pie) | Various |

#### Survey Components (`components/survey/`)

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `SurveyGenerator.tsx` | AI survey creation wizard | `businessId`, `onComplete` |
| `QrViewer.tsx` | QR code display & download | `qrCode`, `surveyUrl` |
| `UnifiedTextInput.tsx` | Voice + text input with recording UI | `onSubmit`, `language` |

#### Voice Components (`components/voice/`)

| Component | Purpose |
|-----------|---------|
| Voice recording/playback utilities | Audio capture and playback |

#### Layout Components

| Component | Purpose |
|-----------|---------|
| `Layout.tsx` | App shell for public pages |

---

## 📱 Pages & Routes (`src/app/`)

### Application Routes

| Route | File | Purpose | Access |
|-------|------|---------|--------|
| `/` | `app/page.tsx` | Landing page | Public |
| `/auth` | `app/auth/page.tsx` | Sign in with phone OTP | Public |
| `/dashboard` | `app/dashboard/page.tsx` | Business dashboard (main app) | Protected |
| `/s/[qr_code]` | `app/s/[qr_code]/page.tsx` | Customer survey interface | Public |

**Dashboard Page Structure**:
- Uses `useRealtimeResponses()` for live data
- Renders `AnalyticsCards`, `ResponseFilters`, `ResponseFeed`
- Manages modal state for response details
- Fetches analytics via `/api/analytics`

**Survey Page Flow**:
1. Fetch survey by QR code via `/api/surveys/[qr_code]`
2. Display questions with `UnifiedTextInput` for voice/text
3. Submit to `/api/responses` with rating + transcription/audio
4. Show thank you page

---

## 🔄 Data Flow Patterns

### Pattern 1: Customer Submits Feedback

```
Customer scans QR
  ↓
GET /api/surveys/[qr_code] (fetch survey)
  ↓
Customer records voice/types text
  ↓
POST /api/responses (create response)
  ↓
Background: POST /api/ai/transcribe
  ↓
Background: POST /api/ai/analyze
  ↓
Supabase UPDATE responses (transcription, sentiment, keywords)
  ↓
Realtime event → Dashboard updates via useRealtimeResponses
```

### Pattern 2: Business Views Dashboard

```
Dashboard loads
  ↓
useRealtimeResponses subscribes to responses table
  ↓
Initial fetch: 50 recent responses
  ↓
GET /api/analytics (compute metrics)
  ↓
Render AnalyticsCards + ResponseFeed
  ↓
New response arrives → Realtime INSERT event → UI updates
```

### Pattern 3: Business Filters Responses

```
User changes filters in ResponseFilters
  ↓
GET /api/responses?business_id=X&ratings=5,4&start_date=...
  ↓
Server applies filters to query
  ↓
Returns paginated results
  ↓
ResponseFeed re-renders with filtered data
```

---

## 🔐 Security & Access Patterns

### Row Level Security (RLS)

**Businesses Table**:
- SELECT/UPDATE/INSERT: `auth.uid() = id` (own business only)

**Surveys Table**:
- SELECT/UPDATE/INSERT: `business_id IN (SELECT id FROM businesses WHERE auth.uid() = id)`

**Responses Table**:
- SELECT: Own business responses only
- INSERT: Public (anyone can submit)

**Service Role Bypass**:
- API routes use `supabaseServer` with service role key
- Bypasses RLS for server-side operations
- Used in `/api/responses`, `/api/analytics`, etc.

---

## 🧪 Testing & Development

### Development Files

| File | Purpose |
|------|---------|
| `database/setup-sample-data.sql` | Seed test businesses, surveys, responses |
| `lib/sample-data.ts` | Generate mock data programmatically |
| `lib/test-connection.ts` | Test Supabase/OpenAI connectivity |

### Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 📝 Context Engineering Guidelines

### For AI Agents Working on This Codebase

#### Starting a New Feature
1. Read `specs/PRD.md` for product context
2. Check `specs/Technical-Architecture.md` for system constraints
3. Review `database/schema.sql` for data model
4. Check `specs/state.md` for file locations

#### Debugging an Issue
1. Check `specs/current_context.md` for recent changes
2. Review relevant API route in `src/app/api/`
3. Check RLS policies in `database/schema.sql`
4. Test with `lib/test-connection.ts`

#### Adding a New API Endpoint
1. Create route file in `src/app/api/[feature]/route.ts`
2. Use `supabaseServer` from `lib/supabase-server.ts`
3. Add types to `src/types/index.ts`
4. Update this context map

#### Adding a New UI Component
1. Place in appropriate `src/components/[category]/`
2. Import types from `src/types/index.ts`
3. Use `supabase` client for realtime if needed
4. Follow existing component patterns

#### Modifying Database Schema
1. Create migration SQL in `database/`
2. Update `database/schema.sql` as source of truth
3. Update TypeScript types in `src/types/index.ts`
4. Test RLS policies thoroughly

---

## 🗺️ Quick Reference Map

### "I need to..."

| Task | Files to Reference |
|------|-------------------|
| Understand the product | `specs/PRD.md`, `specs/Technical-Architecture.md` |
| See database structure | `database/schema.sql` |
| Add an API endpoint | `src/app/api/*/route.ts`, `lib/supabase-server.ts` |
| Create a UI component | `src/components/`, `src/types/index.ts` |
| Work with responses | `lib/response-management.ts`, `api/responses/route.ts` |
| Work with analytics | `lib/analytics.ts`, `api/analytics/route.ts` |
| Work with AI features | `lib/openai.ts`, `api/ai/*/route.ts` |
| Add realtime features | `hooks/useRealtimeResponses.ts`, `lib/supabase.ts` |
| Work with surveys | `components/survey/`, `api/surveys/route.ts` |
| Debug auth issues | `components/auth/`, `database/setup-auth.sql` |
| Generate QR codes | `utils/qr.ts`, `components/survey/QrViewer.tsx` |
| Export data | `lib/response-management.ts`, `api/responses/export/route.ts` |

---

## 📊 File Dependency Graph

```
specs/PRD.md
  └─> specs/Technical-Architecture.md
       └─> database/schema.sql
            ├─> src/types/index.ts (type definitions)
            │    └─> src/lib/* (business logic)
            │         └─> src/app/api/* (API routes)
            │              └─> src/components/* (UI)
            │                   └─> src/app/* (pages)
            └─> src/lib/supabase*.ts (DB clients)
```

---

**Last Updated**: 2025-10-06  
**Maintainer**: Keep this updated when adding new files or major refactors  
**Version**: 1.0
