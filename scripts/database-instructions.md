# Database Setup Instructions

## 🚀 Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor
1. **Go to:** https://mfclgdwnmbrvexdojxgz.supabase.co/project/default/sql
2. **Click:** "New Query" button
3. **Copy the entire content** from `database/schema.sql` file

### Step 2: Execute the Schema
1. **Paste the SQL** into the query editor
2. **Click:** "Run" button (or press Ctrl+Enter)
3. **Wait for completion** (should take 10-30 seconds)

### Step 3: Verify Tables Created
1. **Go to:** Table Editor in the left sidebar
2. **Check these tables exist:**
   - ✅ `businesses`
   - ✅ `surveys` 
   - ✅ `responses`
   - ✅ `ai_summaries`

### Step 4: Test Connection
1. **Go back to:** http://localhost:3006
2. **Click:** "Go to Dashboard"
3. **Enter any phone number** (e.g., +213123456789)
4. **Enter any 6-digit OTP** (e.g., 123456)
5. **Verify:** You can access the dashboard

## 🎯 Expected Results
- ✅ All 4 tables created successfully
- ✅ Sample data inserted (1 test business + 1 test survey)
- ✅ Authentication flow works
- ✅ Dashboard loads without errors

## 🚨 If Issues Occur
- **Check Supabase logs** for any SQL errors
- **Verify API keys** are correct in `.env.local`
- **Restart dev server** if needed: `npm run dev`

## 📋 Next Steps After Database Setup
1. **Test Authentication** - Verify OTP flow works
2. **Business Profile Form** - Build registration interface
3. **AI Integration** - Connect OpenAI API
4. **QR Code Generation** - Create downloadable QR codes