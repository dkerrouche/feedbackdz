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

### What’s implemented (working paths)
- Next.js 14 + TS + Tailwind base UI with layout and landing page
- Supabase client setup (browser + server/service role)
- Database schema with tables, indexes, triggers, RLS, and sample business/survey
- Dev “auth” via localStorage in `ProtectedRoute` and mock OTP UI
- Business profile creation/update and render (uses fixed dev phone `+213123456789`)
- AI survey question generation via GPT-4 (AR/FR/EN) with strict JSON handling and fallbacks
- Survey persistence: API to create and list surveys; dashboard flow wires generation → creation
- QR preview + PNG/SVG download in dashboard via `QrViewer` and `utils/qr`
- Dashboard UI with Overview, Business Profile, and Create Survey tabs (analytics placeholders)
- Style guide added at `specs/guide_style.md`; components restyled for contrast

### What’s not implemented (gaps)
- Real phone OTP authentication with Supabase (replace mock)
- Public customer-facing survey page (QR landing) and response submission
- Voice recording/upload, Whisper transcription, sentiment and keyword pipelines
- Realtime updates (Supabase Realtime), charts/analytics, filters/search, exports
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
2. Implement survey QR code assets:
   - Generate QR (PNG/SVG), preview, and download from `dashboard/page.tsx`.
3. Build customer-facing survey route:
   - `GET /api/surveys/{qr_code}` public fetch + public PWA page to answer survey.
4. Response collection:
   - Submit rating + text; store in `responses`; wire confirmation page.
5. Voice pipeline (MVP):
   - Client recording (MediaRecorder), upload to Supabase Storage, create response with `audio_url`, async job for Whisper + sentiment/keywords, update response.
6. Dashboard basics:
   - List real surveys from DB for the business; simple metrics from `responses` with indexes.
7. Realtime:
   - Subscribe to `responses` by `business_id` to update dashboard feed.
8. Polish:
   - Error states, i18n toggle for UI, minimal charts, CSV export.

### Assumptions for current dev mode
- Using seeded business + fixed dev phone for profile linkage
- Environment variables set for Supabase and OpenAI
- RLS policies are active; dev helper scripts exist if needed

