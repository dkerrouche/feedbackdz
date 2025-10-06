### Context
- FeedbackDZ is a restaurant feedback platform (MVP) with QR-based surveys, AI-generated questions, voice/text input, and a business dashboard. PRD, Technical Architecture, and Development Plan are approved and aligned toward a Next.js + Supabase + OpenAI stack.

### Repository structure (high-level)
- `src/app/`
  - `layout.tsx`, `page.tsx`: Root layout and landing page
  - `dashboard/page.tsx`: Business dashboard with tabs (overview/profile/create-survey)
  - `api/ai/generate-survey/route.ts`: AI question generation endpoint
  - `api/surveys/route.ts`: Create/list surveys
- `src/components/`
  - `Layout.tsx`: Basic header and container
  - `auth/PhoneAuth.tsx`, `auth/ProtectedRoute.tsx`: Dev-only mock phone OTP and guard
  - `business/BusinessProfile.tsx`, `business/BusinessProfileForm.tsx`: Business profile load/create/update
  - `survey/SurveyGenerator.tsx`: Generate AI questions and create surveys
  - `survey/UnifiedTextInput.tsx`: Chat-like text/voice input component with Lucide icons
  - `voice/VoiceRecorder.tsx`: Voice recording component with MediaRecorder API and Lucide icons
  - `dashboard/AnalyticsCards.tsx`, `dashboard/ResponseFeed.tsx`: Dashboard components with Lucide icons
- `src/lib/`
  - `openai.ts`: GPT-4 integration with strict JSON parsing and AR/FR/EN defaults
  - `supabase.ts`: Browser client + admin factory
  - `supabase-server.ts`: Service-role server client
- `database/`
  - `schema.sql`: Core tables (businesses, surveys, responses, ai_summaries), indexes, triggers, RLS policies, seed data
  - `fix-rls-policies.sql`, `disable-rls.sql`: RLS helpers
- `specs/`
  - `PRD.md`, `Technical-Architecture.md`, `Development-Plan.md`: Approved specs guiding scope and sequencing

### Key files to know
- `src/app/dashboard/page.tsx`: Orchestrates the dashboard tabs and calls business/survey components
- `src/components/business/BusinessProfile*.tsx`: End-to-end business profile CRUD via Supabase
- `src/components/survey/SurveyGenerator.tsx`: Calls `/api/ai/generate-survey` then `/api/surveys`
- `src/app/api/ai/generate-survey/route.ts`: Validates input, calls `generateSurveyQuestions`
- `src/lib/openai.ts`: Prompt, parsing, and fallbacks for question generation
- `database/schema.sql`: Canonical data model + RLS policies + seed

### What's implemented (working paths)
- Next.js 14 + TS + Tailwind base UI with layout and landing page
- Supabase client setup (browser + server/service role)
- Database schema with tables, indexes, triggers, RLS, and sample business/survey
- Dev "auth" via localStorage in `ProtectedRoute` and mock OTP UI
- Business profile creation/update and render (uses fixed dev phone `+213123456789`)
- AI survey question generation via GPT-4 (AR/FR/EN) with strict JSON handling and fallbacks
- Survey persistence: API to create and list surveys; dashboard flow wires generation → creation
- QR preview + PNG/SVG download in dashboard via `QrViewer` and `utils/qr`
- Dashboard UI with Overview, Business Profile, and Create Survey tabs
- Style guide added at `specs/guide_style.md`; components restyled for contrast
- Public survey flow: `/s/{qr_code}` page for rating + text; public APIs to fetch survey and submit responses
- Survey fixes: proper question ordering, independent rating handling, dashboard loads existing surveys
- Voice recording system: MediaRecorder API with WebM/Opus support, mobile-optimized
- Supabase Storage: Audio file upload with proper policies and public URLs
- AI processing pipeline: Whisper transcription + GPT-4 sentiment analysis + keyword extraction
- Background processing: Automatic AI processing after response submission
- Voice integration: Voice recording fully integrated into public survey page
- Unified input interface: Chat-like text/voice input combining both input methods seamlessly
- Question type simplification: Removed voice/text distinction, all text questions support both input methods
- Audio replacement mode: Audio recording completely replaces text input (not optional)
- Audio playback interface: Built-in HTML5 audio player with preview before submission
- Direct recording flow: Click mic starts recording immediately with trash cancel button
- UX improvements: Bottom-right mic icon, replacement mode, seamless audio/text switching
- Professional icon system: Replaced all emoji icons with Lucide React icons for better UI consistency
- Analytics API and wiring: `/api/analytics` computes metrics within date range and dashboard fetches them
- Responses API: `/api/responses` supports pagination and filters (date, rating, sentiment, search, QR)
- CSV export: `/api/responses/export` streams filtered CSV
- Dashboard filters: date range controls; analytics refresh on change

### What's not implemented (gaps)
- Real phone OTP authentication with Supabase (replace mock)
- Realtime analytics refresh via server push (client realtime feed exists; server analytics currently polled)
- Charts enhancements and full filter UI (rating/sentiment/search/QR) on dashboard
- Admin panel (user management, platform monitoring), daily summaries cron + email
- Full i18n for UI (beyond generated questions)

### Data model (essentials)
- `businesses`: phone-anchored identity, profile fields, `location` JSONB, `subscription_tier`
- `surveys`: `business_id`, unique `qr_code`, `questions` JSONB, `languages`
- `responses`: rating/sentiment/transcription/audio/keywords, device metadata
- `ai_summaries`: daily narrative + breakdowns per business
- RLS: owners can read/write their entities; public insert on `responses` for capture flows

### Next steps (prioritized)
1. Replace mock auth with Supabase OTP and user session handling; remove localStorage gate.
2. Dashboard filters UI: add rating, sentiment, search, QR filters; wire to `/api/analytics` and `/api/responses`.
3. Realtime polish: on new inserts, trigger lightweight analytics refetch; keep feed live.
4. Charts: last-30-days trend, rating distribution, keywords chart; use server datasets.
5. i18n toggle for UI (AR/FR) and RTL polish.

### Assumptions for current dev mode
- Using seeded business + fixed dev phone for profile linkage
- Environment variables set for Supabase and OpenAI
- RLS policies are active; dev helper scripts exist if needed

