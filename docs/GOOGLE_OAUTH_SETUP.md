# Google OAuth Setup Guide

## What You Need To Do

### 1. Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen if not done:
   - Add scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - Add test users if in development
6. Create OAuth client:
   - Application type: **Web application**
   - Name: FeedbackDZ (or your app name)
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     http://localhost:3001
     https://yourapp.com (production)
     ```
   - **Authorized redirect URIs:**
     ```
     https://mfclgdwnmbrvexdojxgz.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (for local dev)
     ```
7. Save the **Client ID** and **Client Secret**

### 2. Supabase Dashboard Setup

1. Go to https://supabase.com/dashboard/project/mfclgdwnmbrvexdojxgz
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Enable the provider
5. Paste your **Client ID** from Google Console
6. Paste your **Client Secret** from Google Console
7. Click **Save**

### 3. Test The Setup

1. **Clear browser storage:**
   ```
   http://localhost:3001/clear-storage.html
   ```

2. **Test sign-in:**
   - Go to home page
   - Click "Sign In"
   - Click "Continue with Google"
   - Complete Google OAuth
   - Should redirect to `/auth/callback`
   - Then redirect to `/dashboard`

3. **Check console logs:**
   - Should see: `🔐 PKCE flow detected, exchanging code for session`
   - Should see: `✅ Session established for user: <user-id>`
   - Should see: `🔄 Performing redirect to dashboard...`

## What I Fixed In The Code

### 1. Updated `src/lib/auth.ts`
Changed Google OAuth to use PKCE flow (more secure):
```typescript
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',  // Get refresh token
      prompt: 'consent',       // Always show consent
    },
  },
})
```

### 2. Callback Handler (`src/app/auth/callback/page.tsx`)
- Handles **PKCE flow** (primary): Exchanges `?code=...` for session
- Handles **Implicit flow** (fallback): Uses `#access_token=...` if present
- Proper error handling and logging
- Immediate redirect after session establishment

## How It Works Now

```
User clicks "Continue with Google"
  ↓
signInWithOAuth() called
  ↓
Redirect to Google consent screen
  ↓
User approves
  ↓
Google redirects to: https://...supabase.co/auth/v1/callback?code=xxx
  ↓
Supabase processes and redirects to: http://localhost:3001/auth/callback?code=xxx
  ↓
Callback page: exchangeCodeForSession(code)
  ↓
Session established in cookies
  ↓
Redirect to /dashboard
  ↓
Dashboard sees authenticated user ✅
```

## Troubleshooting

### Still seeing hash tokens (`#access_token=...`)?
This means implicit flow is still being used. Check:
1. Supabase dashboard: Ensure Google provider is enabled
2. Google Console: Verify redirect URIs match exactly
3. Clear browser cache and test in incognito

### Getting "redirect_uri_mismatch" error?
1. In Google Console, add exact redirect URI:
   ```
   https://mfclgdwnmbrvexdojxgz.supabase.co/auth/v1/callback
   ```
2. Make sure there are no typos
3. Wait a few minutes for Google to propagate changes

### Code exchange fails?
Check browser console for error messages. Common issues:
- Code already used (refresh the page to try again)
- Code expired (try sign-in again)
- Invalid client credentials (check Supabase dashboard)

### Session not persisting?
1. Check DevTools → Application → Cookies
2. Should see `sb-*-auth-token` cookies
3. If not, check Supabase client configuration

## Security Notes

- PKCE flow is more secure than implicit flow
- Tokens are exchanged server-side (via Supabase)
- Access tokens never appear in browser history
- Refresh tokens are stored securely in httpOnly cookies

## Production Checklist

Before going live:
- [ ] Remove `localhost` URLs from Google Console
- [ ] Add production domain to authorized origins
- [ ] Add production callback URL to authorized redirects
- [ ] Verify brand in Google Console (optional but recommended)
- [ ] Test OAuth flow on production domain
- [ ] Monitor Supabase Auth logs for issues
