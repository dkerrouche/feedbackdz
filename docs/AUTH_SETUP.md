# Authentication Setup Guide

## Current Status
The app is configured for **email-first authentication** with Supabase:
- Magic link (passwordless email)
- Email + password sign-up/sign-in
- Google OAuth

## Database Setup (REQUIRED)

### Step 1: Run the Auth Migration
1. Go to your Supabase project: https://supabase.com/dashboard/project/mfclgdwnmbrvexdojxgz
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database/setup-auth.sql`
4. Click **Run** to execute

This will:
- Enable Row Level Security (RLS) on all tables
- Add `user_id` column to `businesses` table
- Create proper RLS policies for user-owned data
- Allow public access for customer feedback submission

### Step 2: Configure Email Auth in Supabase

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended):
   - Go to **Authentication** → **Email Templates**
   - Customize "Confirm signup" and "Magic Link" templates
   - Set redirect URL to: `http://localhost:3000/auth/callback` (dev) or your production URL

### Step 3: Configure Google OAuth (Optional)

1. Create Google OAuth credentials:
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://mfclgdwnmbrvexdojxgz.supabase.co/auth/v1/callback`

2. In Supabase dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google** provider
   - Paste your Client ID and Client Secret
   - Save

## How Authentication Works

### Sign Up Flow
1. User enters email + password on `/auth` page
2. Supabase creates auth user
3. If email confirmation is enabled: user receives confirmation email
4. User is redirected to `/auth/callback` → `/dashboard`
5. On first dashboard visit: user creates their business profile
6. Business is linked to `user_id` automatically

### Sign In Flow
1. User enters email + password (or uses magic link/Google)
2. Supabase authenticates and creates session
3. Session cookies are set via `/auth/callback`
4. User is redirected to `/dashboard`
5. Dashboard loads business by `user_id`

### Magic Link Flow
1. User enters email on `/auth` page
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Session is established → redirected to `/dashboard`

### Google OAuth Flow
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. After approval → redirected to `/auth/callback`
4. Session is established → redirected to `/dashboard`

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled:

- **businesses**: Users can only view/edit their own business (matched by `user_id`)
- **surveys**: Users can only manage surveys for their business
- **responses**: Users can view responses for their business; public can submit
- **ai_summaries**: Users can only view summaries for their business

### API Protection
- `/api/surveys`: Validates that `business_id` belongs to authenticated user
- `/api/responses`: Public POST (for customers), authenticated GET (for owners)
- Middleware protects `/dashboard` and authenticated API routes

### Session Management
- Sessions are stored in HTTP-only cookies (secure)
- Middleware checks session on protected routes
- `useAuthContext` provides client-side auth state

## Testing

### Test Email Auth
1. Go to http://localhost:3000
2. Click "Sign In"
3. Switch to "Sign Up" tab
4. Enter email + password (min 6 chars)
5. Should redirect to `/dashboard`
6. Create business profile

### Test Magic Link
1. Go to http://localhost:3000/auth
2. Stay on "Magic Link" tab
3. Enter email
4. Check inbox for magic link
5. Click link → should redirect to `/dashboard`

### Test Google OAuth
1. Ensure Google provider is configured in Supabase
2. Go to http://localhost:3000/auth
3. Click "Continue with Google"
4. Authorize → should redirect to `/dashboard`

## Troubleshooting

### Seeing "Go to Dashboard" without signing in
This happens if old mock auth data is in localStorage.

**Fix:**
1. Go to http://localhost:3000/clear-storage.html
2. Click "Clear All Storage"
3. Return to home page
4. You should now see "Sign In" button

Or manually:
- Open browser DevTools (F12)
- Go to Application → Local Storage
- Delete all `feedbackdz_*` keys
- Refresh the page

### "Authentication required" errors
- Check that `database/setup-auth.sql` has been run
- Verify RLS policies exist: `SELECT * FROM pg_policies WHERE tablename = 'businesses'`
- Check browser console for session errors

### Email not sending
- Verify Email provider is enabled in Supabase
- Check Supabase logs: **Authentication** → **Logs**
- For production: configure SMTP settings in Supabase

### Google OAuth not working
- Verify redirect URI matches exactly in Google Console
- Check that Google provider is enabled in Supabase
- Ensure Client ID and Secret are correct

### Sign-up works but redirects to home page (not dashboard)
This was fixed by using `window.location.href` instead of `router.push()` to ensure a full page reload after authentication, allowing the auth context to pick up the new session.

If you still see this:
- Clear your browser cache and localStorage (use `/clear-storage.html`)
- Check browser console for errors
- Verify cookies are being set (DevTools → Application → Cookies)
- Check server logs for session exchange errors

### Business not loading
- Check that `user_id` column exists in `businesses` table
- Verify RLS policies allow SELECT for authenticated user
- Check browser console for errors

## Development vs Production

### Development (localhost)
- Email confirmations can be disabled in Supabase for faster testing
- Use magic links for quick auth
- Test with real email addresses (Supabase sends real emails)

### Production
- Enable email confirmations for security
- Configure custom SMTP for branded emails
- Set proper redirect URLs in Supabase
- Use environment variables for all keys

## Next Steps

After auth is working:
1. Test creating a business profile
2. Test creating a survey
3. Test submitting feedback (public route)
4. Verify RLS prevents cross-user access
