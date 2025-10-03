# Product Requirements Document (PRD)
## Restaurant Feedback Platform - "FeedbackDZ"

**Version:** 1.0  
**Date:** October 2025  
**Author:** Solo Founder  
**Status:** Pre-Development

---

## 1. Executive Summary

### Product Vision
Become Algeria's leading customer feedback platform by enabling restaurants to collect actionable insights in real-time through voice and text feedback, while rewarding customers for their input.

### Problem Statement
Algerian restaurants invest heavily without visibility into customer satisfaction. Current feedback methods are:
- Non-existent or informal (word of mouth)
- Too complex (traditional surveys with low response rates)
- Not actionable (social media complaints without structure)
- Language barriers (no Darija support in existing tools)

### Solution
A mobile-first platform where:
- **Restaurants:** Generate QR codes in 2 minutes, get real-time feedback with AI insights
- **Customers:** Scan QR, speak or type feedback in 30 seconds, get rewarded
- **Platform:** Voice transcription (Arabic/French/Darija), sentiment analysis, daily AI summaries

### Success Metrics (6 Months)
- 30 active restaurants
- 5,000+ total responses
- 25%+ response rate (industry avg: 5-10%)
- 70%+ restaurant retention after trial
- 3+ responses per restaurant per day

---

## 2. Target Market

### Phase 1 Focus: Restaurants in Algiers
**Geographic:** Didouche Mourad & surrounding neighborhoods (pilot area)

**Restaurant Types:**
- Sit-down restaurants (50-200 seats)
- Quick Service Restaurants (QSR)
- Cafés with food service
- Fast-casual dining

**Excluded (for now):**
- High-end fine dining (different needs)
- Street food / kiosks (no sitting area)
- Hotel restaurants (complex hierarchies)

### Market Size
- Algiers: ~2,000 restaurants (estimated)
- Target segment: ~500 restaurants
- Phase 1 goal: 30 restaurants (6% penetration)

---

## 3. User Personas

### Primary Persona: Restaurant Owner/Manager

**Ahmed, 38 - Restaurant Owner**
- **Business:** Owns 2 mid-sized restaurants in Algiers
- **Investment:** 10M+ DA invested
- **Tech proficiency:** Low (uses WhatsApp, Facebook)
- **Pain points:**
  - No visibility into customer satisfaction
  - Discovers problems too late (after negative social media posts)
  - Competitors seem busier, doesn't know why
  - Staff say "everything is fine" but revenue declining
- **Goals:**
  - Understand what customers really think
  - Fix problems before they escalate
  - Improve service quality
  - Justify investments to partners/family
- **Motivations:**
  - Pride in business reputation
  - Fear of failure/loss
  - Desire to grow and expand

**Behavior:**
- Checks phone constantly throughout the day
- Responds personally to Facebook comments
- Asks regular customers directly for feedback
- Makes decisions based on gut feel + friends' advice

---

### Secondary Persona: Customer/Diner

**Amira, 26 - Marketing Professional**
- **Lifestyle:** Eats out 3-4× per week
- **Income:** Middle class (comfortable)
- **Tech proficiency:** High (smartphone native)
- **Pain points:**
  - Poor service but no effective way to complain
  - Restaurants don't improve because they don't hear feedback
  - Writing reviews takes too long
  - No incentive to give feedback
- **Goals:**
  - Quick way to share opinion (good or bad)
  - Feel heard by restaurants
  - Get rewarded for time
  - Help improve her favorite places
- **Motivations:**
  - Desire to be heard
  - Small rewards/recognition
  - Contributing to community
  - Expressing opinions

**Behavior:**
- Phones always accessible at restaurant table
- Willing to scan QR codes (used to COVID menus)
- Prefers voice over typing
- Won't spend >30 seconds unless strongly motivated

---

## 4. Product Requirements

### 4.1 Business Dashboard (Web Application)

#### Onboarding & Setup
**Requirements:**
- Phone number authentication (OTP-based)
- Business profile creation (name, category, location)
- AI-powered survey generation from business description
- Instant QR code generation
- Downloadable QR code assets (PDF/PNG/SVG)
  - Table tent template (10×15cm)
  - Sticker design (5×5cm)
  - Poster format (A4)

**User Flow:**
1. Enter phone number → Receive OTP
2. Create account (business name, category)
3. Paste business description OR select template
4. AI generates 3 survey questions
5. Review/edit questions
6. Generate QR code
7. Download print assets
8. **Time to complete: <5 minutes**

#### Dashboard Features
**Real-Time Feed:**
- Live stream of incoming responses
- Response cards showing: time, rating, sentiment, transcription
- Filter by: date range, rating, sentiment
- Search transcriptions

**Analytics Overview:**
- Overall satisfaction score (visual gauge)
- Total responses (today/week/month/all-time)
- Response trend chart (last 30 days)
- Sentiment breakdown (% positive/neutral/negative)
- Response rate (QR scans vs completed surveys)

**AI Insights:**
- Daily AI summary (narrative format)
- Keyword cloud (most mentioned topics)
- Sentiment trend (improving/declining)
- Action recommendations (AI-generated)
- Alert badges for negative feedback spikes

**Response Management:**
- View individual responses
- Play voice recordings
- Read transcriptions
- Mark as "addressed" or "important"
- Export to CSV/PDF

**Survey Editor:**
- Edit questions (max 3)
- Toggle question types (emoji/stars/text/voice)
- Enable/disable languages (AR/FR)
- Preview mobile interface
- Regenerate QR code if needed

**Settings:**
- Business profile (logo, hours, description)
- Notification preferences (email/SMS alerts)
- Team members (add managers - future)
- Subscription management
- QR code redesign

---

### 4.2 Customer Response Interface (Mobile Web / PWA)

#### Core Requirements
**Technical:**
- Mobile-first responsive design (320px - 768px)
- Progressive Web App (works offline, installable)
- No app download required
- Load time: <3 seconds on 3G
- Works on iOS Safari + Android Chrome
- Handles 100+ concurrent users per restaurant

**Language Support:**
- Arabic (right-to-left)
- French (left-to-right)
- Language toggle button
- Auto-detection based on device locale

#### User Flow
1. **Scan QR Code** → Opens web page
2. **Landing:**
   - Restaurant name + logo
   - "Share your experience in 30 seconds"
   - Language toggle (AR/FR)
3. **Question 1 (Required):** "How was your experience?"
   - Visual: 3 emoji buttons (😊😐😞) OR 5-star rating
   - One-tap selection
4. **Question 2 (Optional):** "What did you like?"
   - Voice button (press and hold to record)
   - Text input fallback
   - Skip button
5. **Question 3 (Optional):** "What can we improve?"
   - Same as Q2
6. **Submit** → Processing animation
7. **Thank You Page:**
   - "Thank you! Your voice matters."
   - Restaurant's current rating
   - Optional: Enter phone for rewards (future)
   - "Give feedback to another restaurant" button

**Time to Complete:** 20-30 seconds (target)

#### Voice Recording Interface
**Features:**
- Large microphone button
- Press-and-hold to record (10-60 seconds)
- Visual recording indicator (waveform animation)
- Cancel or re-record options
- Auto-stop at 60 seconds
- "Processing your voice..." feedback
- Fallback to text if microphone denied

**Technical:**
- Web Audio API
- MediaRecorder API
- Format: WebM/Opus or MP3
- Max file size: 1MB
- Upload to storage immediately
- Async transcription (background job)

---

### 4.3 AI Features

#### Survey Generation (Ope AI API)
**Input:** Restaurant description or category
**Output:** 3 contextually relevant questions
**Example:**
- Input: "Italian pizza restaurant, family-friendly, fast service"
- Output:
  1. "How was your overall experience?"
  2. "How was the pizza quality and taste?"
  3. "Was our service fast enough for you?"

**Requirements:**
- Generated in Arabic OR French (user choice)
- Questions must be simple (10 words max)
- Compatible with emoji/star ratings
- Editable by user

#### Voice Transcription (OpenAI Whisper)
**Input:** Audio file (WebM/MP3)
**Output:** Text transcription
**Languages:** Arabic (Modern Standard + Darija), French, Mixed
**Requirements:**
- Accuracy: >85% for clear audio
- Processing time: <10 seconds for 30-sec audio
- Handle background noise (restaurant environment)
- Detect language automatically
- Store both audio + transcription

#### Sentiment Analysis (OpenAi API)
**Input:** Transcribed text (Arabic/French/Mixed)
**Output:** Classification (Positive/Neutral/Negative) + confidence score
**Requirements:**
- Understand context and sarcasm
- Handle mixed language (code-switching)
- Understand Darija expressions
- Fast processing (<2 seconds)

#### Keyword Extraction (Open AI API)
**Input:** Transcribed text
**Output:** Tags/categories
**Categories:**
- Food Quality (taste, freshness, temperature)
- Service (speed, friendliness, attentiveness)
- Cleanliness (hygiene, presentation)
- Ambiance (noise, decor, comfort)
- Value (pricing, portion size)
- Specific items (menu dishes mentioned)

#### Daily Summary (OpenAI API)
**Input:** All responses from past 24 hours
**Output:** Narrative summary (3-5 sentences in Arabic or French)
**Example:**
> "اليوم، تلقيت 12 تعليقًا، 75% منها إيجابية. أشاد العملاء بجودة البيتزا وسرعة الخدمة. ومع ذلك، اشتكى 3 عملاء من أن المكان كان صاخبًا جدًا. نصيحة: فكر في إضافة مواد عازلة للصوت."

**Requirements:**
- Generated daily at midnight
- Includes actionable recommendations
- Highlights trends vs previous days
- Sent via email to business owner

---

### 4.4 Admin Panel (Platform Management)

**Purpose:** Your backend to manage the platform

**Features:**
- User management (businesses)
  - View all businesses
  - Approve/suspend accounts
  - View subscription status
- Response monitoring
  - Platform-wide analytics
  - Detect spam/fake responses
  - Manual transcription overrides
- AI monitoring
  - API usage tracking
  - Cost per business
  - Error logs
- Feature flags
  - Enable/disable features per business
  - A/B testing controls
- Support tools
  - View business support tickets
  - Impersonate business view (for debugging)

---

## 5. Non-Functional Requirements

### Performance
- Page load: <3 seconds on 3G
- Dashboard real-time updates: <5 seconds latency
- Voice transcription: <10 seconds for 30-sec audio
- Support 1,000 concurrent responses
- 99.5% uptime

### Security
- HTTPS everywhere (SSL certificates)
- Phone OTP authentication (6-digit, 5-min expiry)
- Rate limiting (prevent spam)
- GDPR-compliant data storage
- Audio files encrypted at rest
- No credit card storage (use payment gateway)

### Scalability
- Support 100 businesses without infrastructure changes
- Database: Handle 100,000 responses without degradation
- CDN for static assets (QR codes, images)
- Horizontal scaling ready (stateless API)

### Accessibility
- Works on low-end Android devices (2GB RAM)
- Works on iOS Safari (no Web Audio issues)
- High contrast mode for readability
- Large tap targets (44×44px minimum)
- Clear error messages in user's language

### Localization
- Full Arabic translation (RTL support)
- Full French translation
- Date/time in local format
- Currency in Algerian Dinar (DA)
- Phone number format: +213 XXX XXX XXX

---

## 6. Feature Prioritization

### Must Have (MVP - Launch Blocker)
✅ Business authentication (phone OTP)  
✅ AI survey generation  
✅ QR code generation + downloadable assets  
✅ Customer response interface (mobile web)  
✅ Voice recording + transcription (Whisper)  
✅ Text input fallback  
✅ Emoji/star rating  
✅ Basic dashboard (response feed, analytics)  
✅ Sentiment analysis (Claude)  
✅ Arabic + French support  
✅ Real-time response updates  

### Should Have (Post-MVP - Month 2-3)
⭐ Daily AI summaries  
⭐ Keyword extraction + tagging  
⭐ Advanced filtering/search  
⭐ Export to CSV/PDF  
⭐ Email alerts for negative feedback  
⭐ QR code redesign templates  
⭐ Response "mark as addressed"  

### Could Have (Future - Month 4+)
💡 Photo feedback (upload food/issue photos)  
💡 Customer rewards system (points/discounts)  
💡 Public review platform (like Yelp)  
💡 Multi-location support (restaurant chains)  
💡 Team members (invite managers)  
💡 WhatsApp integration (send surveys via WhatsApp)  
💡 Competitor benchmarking (anonymous)  
💡 Custom branding (white-label)  

### Won't Have (Out of Scope)
❌ Native mobile apps (web is sufficient)  
❌ Table reservation system  
❌ Menu management  
❌ POS system integration  
❌ Delivery tracking  

---

## 7. User Stories

### Business Owner Stories

**Epic 1: Onboarding**
- As a restaurant owner, I want to sign up with just my phone number, so I don't need to remember passwords
- As a restaurant owner, I want AI to generate survey questions for me, so I don't waste time thinking
- As a restaurant owner, I want to download QR codes immediately, so I can start collecting feedback today

**Epic 2: Monitoring**
- As a restaurant owner, I want to see new feedback in real-time, so I can respond to issues immediately
- As a restaurant owner, I want to know if customers are happy or unhappy today, so I can gauge daily performance
- As a restaurant owner, I want to read what customers said in their own words, so I understand specific issues

**Epic 3: Insights**
- As a restaurant owner, I want AI to summarize my daily feedback, so I don't read every response
- As a restaurant owner, I want to see trends over time, so I know if we're improving
- As a restaurant owner, I want alerts when multiple negative reviews come in, so I can act fast

### Customer Stories

**Epic 4: Giving Feedback**
- As a customer, I want to scan a QR code and immediately give feedback, so it takes less than 30 seconds
- As a customer, I want to speak my feedback, so I don't type on my phone
- As a customer, I want to give feedback in Arabic or French, so I use my preferred language
- As a customer, I want to stay anonymous, so I can be honest without concern
- As a customer, I want confirmation that my feedback was received, so I know it mattered

---

## 8. Out of Scope (for MVP)

❌ Native mobile applications (iOS/Android)  
❌ Blockchain/Web3 features  
❌ Video feedback  
❌ Live chat with restaurants  
❌ Integration with Google/Facebook reviews  
❌ Automated responses to customers  
❌ CRM features  
❌ Inventory management  
❌ Employee scheduling  

---

## 9. Assumptions & Dependencies

### Assumptions
- Target restaurants have smartphones to access dashboard
- Customers have smartphones with camera (for QR scanning)
- Restaurants have Wi-Fi or 4G for dashboard access
- Customers comfortable speaking into their phones
- 3G internet sufficient for voice upload
- Restaurants can print QR codes (or we provide stickers)

### Dependencies
- OpenAI Whisper API availability + pricing stability
- Open AI API availability + pricing stability
- Supabase service uptime
- Vercel hosting reliability
- Algerian mobile networks stability
- Browser compatibility (Safari, Chrome)

### Constraints
- Solo developer (limited velocity)
- Bootstrap budget (must minimize costs)
- No native mobile apps (web-only MVP)
- Algeria market only (no international)
- French/Arabic languages only (no English for now)

---

## 10. Success Criteria

### Launch Criteria (Ready to Onboard First Restaurant)
✅ Business can sign up and create survey in <5 minutes  
✅ QR code generates and downloads correctly  
✅ Customer can scan QR, answer survey in <30 seconds  
✅ Voice recording works on iOS and Android  
✅ Transcription accuracy >80% for clear audio  
✅ Dashboard shows responses in real-time (<10 sec delay)  
✅ Sentiment analysis works for Arabic + French  
✅ No critical bugs in main user flows  
✅ Mobile responsive on all screen sizes  
✅ Load time <3 seconds on 3G  

### Success Metrics (6 Months Post-Launch)

**Adoption:**
- 30 active paying restaurants
- 10+ restaurants per neighborhood (density)
- 5,000+ total responses collected
- 50% of restaurants with >100 responses

**Engagement:**
- 25%+ response rate (QR scans → completed surveys)
- 60%+ responses include voice feedback
- 3+ responses per restaurant per day
- <30 second average completion time

**Retention:**
- 70%+ restaurant retention after 3-month trial
- 50%+ customers leave feedback at same restaurant twice
- <5% churn rate per month

**Quality:**
- 85%+ voice transcription accuracy (manual audit)
- 90%+ correct sentiment classification
- <1% spam/fake responses
- 4.5+ star rating from restaurants (platform satisfaction)

**Financial:**
- Revenue: 30 restaurants × 5,000 DA = 150,000 DA/month
- Costs: <50,000 DA/month (API + hosting + support)
- Positive unit economics by month 6

---

## 11. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low customer response rates | Critical | High | Heavy incentives, gamification, 10-sec surveys |
| Poor Darija transcription | High | Medium | Fallback to text, improve training data |
| Restaurant churn after trial | High | Medium | Prove value fast, show ROI within 2 weeks |
| Competitor launches similar product | Medium | Low | Speed to market, local relationships |
| API costs exceed revenue | Medium | Low | Aggressive caching, cheaper alternatives |
| Spam/fake responses | Medium | Medium | Rate limiting, IP tracking, manual review |
| Restaurants don't print QR codes | Medium | Medium | Offer printed stickers as part of signup |
| Voice recording doesn't work on iOS | High | Low | Extensive testing, fallback to text |

---

## 12. Future Roadmap (Post-MVP)

### Phase 2 (Month 4-6): Enhanced Features
- Photo feedback capability
- Customer rewards system (loyalty points)
- WhatsApp integration
- Advanced analytics (cohort analysis, trends)
- Multi-location support for chains

### Phase 3 (Month 7-12): Platform Expansion
- Public review platform (consumer-facing)
- Competitor benchmarking
- API for third-party integrations
- White-label solution for larger clients
- Expand to e-commerce, retail, services

### Phase 4 (Year 2): Market Leadership
- Expand to Tunisia, Morocco
- Enterprise features (custom integrations)
- Predictive analytics (churn prediction)
- Industry benchmarking reports
- Franchise/licensing model

---

## 13. Appendix

### Glossary
- **QR Code:** Quick Response code, scannable with phone camera
- **PWA:** Progressive Web App, website that works like an app
- **Darija:** Algerian Arabic dialect
- **OTP:** One-Time Password for authentication
- **RTL:** Right-to-Left (for Arabic text)
- **API:** Application Programming Interface
- **DA:** Algerian Dinar (currency)

### References
- Voice transcription: OpenAI Whisper API
- AI processing: OenAI API
- Database: Supabase (PostgreSQL)
- Hosting: Vercel
- Analytics: Vercel Analytics

### Contact
- **Product Owner:** [Your Name]
- **Technical Lead:** [Your Name]
- **Support:** [WhatsApp/Email]

---

**Document Status:** APPROVED for Development  
**Next Steps:** Proceed to Technical Specification & Development Plan