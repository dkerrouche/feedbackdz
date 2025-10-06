To explain the structure and main components, I’ll first inspect the directories you pointed out and list their contents. I’ll run these in parallel to be efficient.

I’ll inspect the source directories and key spec/DB files to map the structure and interactions. Listing subfolders and opening the main architecture docs and DB schema for context.

To give you an accurate picture of runtime flows and endpoints, I’ll open the API route directory and a few core library files that orchestrate data/auth/AI. This will clarify interactions between frontend components, API routes, Supabase, and OpenAI.
I will open key API route files and core libraries to understand how the frontend, Supabase, and OpenAI interact, then summarize the architecture.


I’ll open the API route implementations for responses, surveys, and AI (generate, analyze, transcribe) to accurately describe endpoints and their interactions with Supabase and OpenAI.

# Codebase Structure Overview

- **[src/app/](cci:7://file:///home/dkerrouche/startup/feedai/src/app:0:0-0:0)** (Next.js 14 App Router)
  - **[page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/page.tsx:0:0-0:0)**: Landing page with links to dashboard and auth.
  - **[layout.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/layout.tsx:0:0-0:0)**: Root layout and metadata.
  - **[auth/page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/auth/page.tsx:0:0-0:0)**: Sign-in page; uses `PhoneAuth` in [components/auth/](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth:0:0-0:0).
  - **[dashboard/page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/dashboard/page.tsx:0:0-0:0)**: Main business dashboard UI (analytics, feed, filters).
  - **`s/[qr_code]/`**: Public survey runtime route (customer-facing via QR).
  - **[api/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api:0:0-0:0)**: Serverless API routes
    - **[analytics/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/analytics/route.ts:0:0-0:0)**: Returns analytics for a business.
    - **[responses/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses/route.ts:0:0-0:0)**: List/create responses; triggers background AI processing.
    - **`responses/[id]/`**: Per-response management (PATCH/DELETE).
    - **[responses/export/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses/export:0:0-0:0)**: CSV export.
    - **[surveys/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/surveys/route.ts:0:0-0:0)**, **`surveys/[qr_code]/`**: CRUD/fetch surveys.
    - **[ai/generate-survey/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/ai/generate-survey:0:0-0:0)**, **[ai/transcribe/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/ai/transcribe:0:0-0:0)**, **[ai/analyze/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/ai/analyze:0:0-0:0)**: AI endpoints.

- **[src/components/](cci:7://file:///home/dkerrouche/startup/feedai/src/components:0:0-0:0)** (UI building blocks)
  - **[Layout.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/Layout.tsx:0:0-0:0)**: App shell used by public pages.
  - **[auth/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/auth:0:0-0:0)**: [PhoneAuth.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth/PhoneAuth.tsx:0:0-0:0), [ProtectedRoute.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth/ProtectedRoute.tsx:0:0-0:0).
  - **[dashboard/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/dashboard:0:0-0:0)**: [ResponseFeed.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseFeed.tsx:0:0-0:0), [ResponseItem.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseItem.tsx:0:0-0:0), [ResponseFilters.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseFilters.tsx:0:0-0:0), [AnalyticsCards.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/AnalyticsCards.tsx:0:0-0:0), [DashboardCharts.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/DashboardCharts.tsx:0:0-0:0), modals and charts.
  - **[survey/](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey:0:0-0:0)**: [SurveyGenerator.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey/SurveyGenerator.tsx:0:0-0:0), [QrViewer.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey/QrViewer.tsx:0:0-0:0), [UnifiedTextInput.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey/UnifiedTextInput.tsx:0:0-0:0) (voice/text input UX).
  - **[voice/](cci:7://file:///home/dkerrouche/startup/feedai/src/components/voice:0:0-0:0)**: Voice helpers/components (capture, playback).

- **[src/hooks/](cci:7://file:///home/dkerrouche/startup/feedai/src/hooks:0:0-0:0)**
  - **[useRealtimeResponses.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/hooks/useRealtimeResponses.ts:0:0-0:0)**: Subscribes to Supabase Realtime on [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0) for a `business_id`. Loads initial 50 responses, then handles INSERT/UPDATE/DELETE events to keep UI live.

- **[src/lib/](cci:7://file:///home/dkerrouche/startup/feedai/src/lib:0:0-0:0)** (integration logic)
  - **[supabase.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/supabase.ts:0:0-0:0)**: Client-side Supabase init with anon key and an admin client factory.
  - **[supabase-server.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/supabase-server.ts:0:0-0:0)**: Server-side Supabase client with service role for API routes.
  - **[openai.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:0:0-0:0)**: [generateSurveyQuestions()](cci:1://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:26:0-71:1) via GPT-4. Also JSON parsing and language defaults.
  - **[analytics.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/analytics.ts:0:0-0:0)**: Client/server-side analytics calculations and filters.
  - **[response-filters.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/response-filters.ts:0:0-0:0)**: Extra helpers for filtering (paired with UI).
  - **[response-management.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/response-management.ts:0:0-0:0)**: Client helpers to PATCH/DELETE/export responses via API.
  - **[audio/](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/audio:0:0-0:0)**: Audio utils (recording/format) used by survey input.
  - **[sample-data.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/sample-data.ts:0:0-0:0), [test-connection.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/test-connection.ts:0:0-0:0)**: Utilities for dev/testing.

- **[src/types/index.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/types/index.ts:0:0-0:0)**: Typed models for [Business](cci:2://file:///home/dkerrouche/startup/feedai/src/types/index.ts:1:0-21:1), [Survey](cci:2://file:///home/dkerrouche/startup/feedai/src/types/index.ts:23:0-32:1), [Response](cci:2://file:///home/dkerrouche/startup/feedai/src/types/index.ts:41:0-57:1), [AISummary](cci:2://file:///home/dkerrouche/startup/feedai/src/types/index.ts:59:0-73:1), analytics DTOs, and UI filter/state shapes.

- **[src/utils/qr.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/utils/qr.ts:0:0-0:0)**: QR code generation and download helpers (PNG/SVG) for surveys.

- **[database/](cci:7://file:///home/dkerrouche/startup/feedai/database:0:0-0:0)** (SQL)
  - **[schema.sql](cci:7://file:///home/dkerrouche/startup/feedai/database/schema.sql:0:0-0:0)**: Core tables: `businesses`, [surveys](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/surveys:0:0-0:0), [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0), `ai_summaries`; indexes; RLS policies; triggers; sample seeds.
  - Migration helpers: setup auth/storage, RLS fixes, response management field scripts, sample data.

- **[specs/](cci:7://file:///home/dkerrouche/startup/feedai/specs:0:0-0:0)** (documentation)
  - **[Technical-Architecture.md](cci:7://file:///home/dkerrouche/startup/feedai/specs/Technical-Architecture.md:0:0-0:0)**: Stack, endpoints, data flow, realtime, security.
  - **[PRD.md](cci:7://file:///home/dkerrouche/startup/feedai/specs/PRD.md:0:0-0:0)**: Product scope, personas, MVP features.
  - Plus development plan, style guide, and context.

# Main Components and Responsibilities

- **Authentication**
  - Supabase Auth (OTP). The UI is at [src/app/auth/page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/auth/page.tsx:0:0-0:0) and [components/auth/PhoneAuth.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth/PhoneAuth.tsx:0:0-0:0). Protected areas can use [ProtectedRoute.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth/ProtectedRoute.tsx:0:0-0:0).

- **Survey Generation and QR**
  - AI survey generation via [openai.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:0:0-0:0) and API route [api/ai/generate-survey/](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/ai/generate-survey:0:0-0:0).
  - Store surveys in [surveys](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/surveys:0:0-0:0) table ([database/schema.sql](cci:7://file:///home/dkerrouche/startup/feedai/database/schema.sql:0:0-0:0)).
  - QR handling via [src/utils/qr.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/utils/qr.ts:0:0-0:0), rendered in [components/survey/QrViewer.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey/QrViewer.tsx:0:0-0:0).
  - Public survey runtime under `app/s/[qr_code]/` for customers.

- **Response Collection**
  - Frontend captures rating + text/voice (e.g., [UnifiedTextInput.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/survey/UnifiedTextInput.tsx:0:0-0:0) for voice/text).
  - Submit responses to `POST /api/responses` ([src/app/api/responses/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses/route.ts:0:0-0:0)) which writes to [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0).
  - If `audio_url` present, the route fires background processing.

- **AI Processing Pipeline**
  - Triggered asynchronously by [processAudioInBackground()](cci:1://file:///home/dkerrouche/startup/feedai/src/app/api/responses/route.ts:116:0-188:1) in [api/responses/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses/route.ts:0:0-0:0).
  - Steps:
    - Transcription: `POST /api/ai/transcribe` → updates transcription.
    - Analysis: `POST /api/ai/analyze` → sentiment + score + keywords.
    - Write back to [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0) (sets `processed_at`, `keywords`, `sentiment`...).
  - AI helpers in [src/lib/openai.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:0:0-0:0) for prompting and parsing (survey gen specifically; analysis/transcribe live in their route handlers).

- **Realtime Dashboard**
  - [useRealtimeResponses()](cci:1://file:///home/dkerrouche/startup/feedai/src/hooks/useRealtimeResponses.ts:21:0-159:1) subscribes to [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0) table for a `business_id`.
  - Dashboard UI in [app/dashboard/page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/dashboard/page.tsx:0:0-0:0) renders:
    - **Feed**: [components/dashboard/ResponseFeed.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseFeed.tsx:0:0-0:0), [ResponseItem.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseItem.tsx:0:0-0:0).
    - **Filters**: [ResponseFilters.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseFilters.tsx:0:0-0:0) (maps to query params used by `GET /api/responses`).
    - **Analytics**: [AnalyticsCards.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/AnalyticsCards.tsx:0:0-0:0), [DashboardCharts.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/DashboardCharts.tsx:0:0-0:0) from data of `GET /api/analytics`.
    - **Details/Actions**: [ResponseDetailModal.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/dashboard/ResponseDetailModal.tsx:0:0-0:0) and [response-management.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/response-management.ts:0:0-0:0) for PATCH/DELETE/export calls.

- **Analytics**
  - `GET /api/analytics` ([src/app/api/analytics/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/analytics/route.ts:0:0-0:0)) fetches responses in a date range and computes:
    - Totals, average rating, sentiment breakdown, trends, top keywords, distribution.
  - [src/lib/analytics.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/analytics.ts:0:0-0:0) centralizes the calculations and filter application.

# Data Model and Policies

- **Tables**
  - `businesses`: core entity with phone, profile, subscription fields.
  - [surveys](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/surveys:0:0-0:0): per-business surveys, `qr_code`, `questions` JSON.
  - [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0): per survey/business, rating, transcription, `audio_url`, `keywords` JSON, sentiment fields.
  - `ai_summaries`: daily AI-generated summaries (post-MVP).

- **Indexes**: Optimized for `business_id`, date, `sentiment`, QR lookups ([database/schema.sql](cci:7://file:///home/dkerrouche/startup/feedai/database/schema.sql:0:0-0:0)).

- **RLS**
  - Businesses can access their own rows (`businesses`, [surveys](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/surveys:0:0-0:0), [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0), `ai_summaries`).
  - Public can INSERT into [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0) (for survey submissions).
  - Service role (server API) used for secure server-side access ([supabase-server.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/supabase-server.ts:0:0-0:0)).

# Request/Response Flows

- **Customer flow**
  - Scan QR → `app/s/[qr_code]/` loads survey via `GET /api/surveys/[qr_code]`.
  - Submit rating/text/voice → `POST /api/responses`.
  - If audio, background pipeline runs transcribe/analyze endpoints and updates the row.

- **Dashboard flow**
  - UI connects to Realtime ([useRealtimeResponses](cci:1://file:///home/dkerrouche/startup/feedai/src/hooks/useRealtimeResponses.ts:21:0-159:1)) for live updates on [responses](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses:0:0-0:0).
  - Lists/paginates with filters via `GET /api/responses`.
  - Fetches analytics via `GET /api/analytics`.
  - Manage responses via `PATCH /api/responses/[id]`, `DELETE /api/responses/[id]`, export via `GET /api/responses/export`.

# Notable Interactions

- **Next.js API routes ↔ Supabase**
  - Server routes use `supabaseServer` (service key) to bypass client RLS constraints where needed.
  - Client uses `supabase` anon client for realtime and any permitted selects.

- **API routes ↔ OpenAI**
  - [openai.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:0:0-0:0) provides GPT-4 survey generation. Transcription/sentiment/keywords are implemented in the AI route handlers and invoked by background jobs after response creation.

- **Realtime**
  - [hooks/useRealtimeResponses.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/hooks/useRealtimeResponses.ts:0:0-0:0) listens for `INSERT/UPDATE/DELETE` with filter `business_id=eq.<id>`, keeping the dashboard in sync within seconds.

# Where to Look for Each Concern

- **Endpoints**: `src/app/api/**`.
- **Database schema/policies**: [database/schema.sql](cci:7://file:///home/dkerrouche/startup/feedai/database/schema.sql:0:0-0:0) (+ RLS fix scripts).
- **Auth**: [components/auth/PhoneAuth.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/components/auth/PhoneAuth.tsx:0:0-0:0), Supabase Auth configuration in [supabase.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/supabase.ts:0:0-0:0).
- **AI logic**: [src/lib/openai.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/openai.ts:0:0-0:0), `src/app/api/ai/**`, background trigger in [api/responses/route.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/app/api/responses/route.ts:0:0-0:0).
- **Dashboard UI/logic**: [src/app/dashboard/page.tsx](cci:7://file:///home/dkerrouche/startup/feedai/src/app/dashboard/page.tsx:0:0-0:0), `src/components/dashboard/**`, [src/lib/analytics.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/lib/analytics.ts:0:0-0:0), [src/hooks/useRealtimeResponses.ts](cci:7://file:///home/dkerrouche/startup/feedai/src/hooks/useRealtimeResponses.ts:0:0-0:0).
- **Survey UI**: `src/components/survey/**`, public route `src/app/s/[qr_code]/`.

# Summary

- The app is a Next.js 14 PWA using Supabase (DB/Auth/Storage/Realtime) and OpenAI for survey generation, transcription, and sentiment/keywords.
- Public customers submit responses via QR; audio responses trigger background AI processing.
- Businesses view a real-time dashboard powered by Supabase Realtime and server-side analytics.
- API routes mediate all DB and AI interactions with strict RLS policies and service-role access on the server.

If you’d like, I can draw a quick sequence diagram or deep-dive into any specific module (e.g., AI routes, response export, or the dashboard state flow).