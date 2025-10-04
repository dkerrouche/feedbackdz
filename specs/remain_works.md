### Remaining Work Plan

#### 1) Authentication (replace mock)
- Implement Supabase phone OTP end-to-end (send/verify, sessions)
- Replace LocalStorage guard with session-aware server/client checks
- Protect `dashboard` routes via middleware and/or server actions
- Acceptance: Sign-in with phone works; session persists; logout clears

#### 2) QR code generation & assets ✅
- Generate QR for each survey (PNG/SVG) and preview — DONE
- Download assets (PNG/SVG; later PDF templates) — DONE for PNG/SVG
- Store QR metadata/asset URLs (optional) or generate on-the-fly — On-the-fly now
- Acceptance: View + download QR from dashboard — DONE; link awaits public page

#### 3) Public survey experience (PWA) ✅
- Public page at `/s/{qr_code}` loads survey (rate + text) — DONE
- Submit response to `responses` with basic metadata — DONE
- Thank-you page; fast, mobile-first — DONE; AR/FR toggle pending
- Survey fixes: question ordering, independent ratings, proper loading — DONE
- Acceptance: <30s flow; successful inserts under RLS — DONE

#### 4) Response collection mechanics ✅
- API to fetch survey by `qr_code` — DONE
- API to create response (rating + text now) — DONE
- Store `ip_address` and `user_agent`; basic rate limit — PARTIAL (stored; rate limit pending)
- Acceptance: Responses visible in DB; minimal spam control — PARTIAL

#### 5) Voice pipeline (MVP) ✅ **COMPLETED**
- Client: MediaRecorder capture (WebM/Opus), size <1MB, retry ✅ **COMPLETED**
- Upload: Supabase Storage; create response with `audio_url` ✅ **COMPLETED**
- Background jobs: Whisper transcription → GPT sentiment/keywords ✅ **COMPLETED**
- Update response with `transcription`, `sentiment`, `keywords` ✅ **COMPLETED**
- Acceptance: 30–60s voice results processed <10s for 30s audio ✅ **COMPLETED**

#### 5.1) Unified Input Interface ✅ **COMPLETED**
- Chat-like text/voice input combining both input methods ✅ **COMPLETED**
- Question type simplification: removed voice/text distinction ✅ **COMPLETED**
- AI generation update: only rating + text questions ✅ **COMPLETED**
- Survey generator update: unified input approach ✅ **COMPLETED**
- Component architecture: UnifiedTextInput with modern UX ✅ **COMPLETED**
- Acceptance: Seamless text/voice experience like chat apps ✅ **COMPLETED**

#### 6) Dashboard enhancements
- List real surveys from DB; link to QR view/download
- Recent responses feed with transcription/sentiment
- Basic analytics (counts, average rating, sentiment breakdown)
- Acceptance: Cards reflect DB; feed updates as data arrives

#### 7) Realtime updates
- Supabase Realtime subscription on `responses` by `business_id`
- Push new responses to dashboard feed
- Acceptance: <5s latency on new response cards

#### 8) i18n & UX polish
- UI-level AR/FR translations, RTL for Arabic
- Error/empty/loading states, form validation
- CSV export for responses
- Acceptance: Smooth UX; accessible on low-end Android; RTL correct

#### 9) Admin & ops (post-MVP)
- Admin panel basics: business list, account status, usage
- AI usage metrics, error logs; feature flags
- Daily summary cron + email (midnight) using OpenAI
- Acceptance: Admin can view key data; summaries generated daily

### File touchpoints (initial)
- `src/middleware.ts` (auth guarding)
- `src/app/api/auth/*` (OTP endpoints if custom; or use Supabase client-side)
- `src/app/s/[qr_code]/page.tsx` (public survey page)
- `src/app/api/surveys/[qr_code]/route.ts` (public fetch)
- `src/app/api/responses/route.ts` (create response)
- `src/components/qr/QrViewer.tsx`, `src/utils/qr.ts` (QR helpers)
- `src/components/voice/Recorder.tsx` (voice capture)
- `src/lib/jobs/*` (background jobs stubs)
- `src/app/api/ai/*` (transcribe/analyze endpoints)
- `src/components/dashboard/*` (responses feed, analytics cards)

### Risks & mitigations (quick)
- iOS audio capture issues → progressive enhancement + text fallback
- RLS friction during POSTs → verify policies per endpoint; use service role only where needed
- OpenAI cost/latency → cache, batch, exponential backoff

### Milestones
- M1: Auth + QR assets + public survey (text) live ✅ **COMPLETED**
- M2: Responses in DB + dashboard metrics + realtime
- M3: Voice + transcription + sentiment/keywords ✅ **COMPLETED**
- M3.1: Unified input interface + question simplification ✅ **COMPLETED**
- M4: Admin basics + daily summaries + exports

