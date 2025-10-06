# OAuth Hash Fragment Fix

## Problem
After Google OAuth sign-in, the browser was redirected to:
```
http://localhost:3001/#access_token=...&refresh_token=...&expires_in=3600
```

But the user stayed on this URL instead of being redirected to the dashboard, and no session was established.

## Root Cause
Supabase OAuth uses **implicit/hash-based flow** by default, which returns tokens in URL hash fragments:
```
/#access_token=xxx&refresh_token=yyy
```

Our original callback handler was a **server-side route** (`/auth/callback/route.ts`) that only handled PKCE flow with query params:
```
/?code=xxx
```

**The problem:** Hash fragments (`#...`) are **not sent to the server**. They're only available in the browser's JavaScript. So the server-side route handler never saw the tokens and couldn't establish a session.

## Solution
Created a **client-side page component** at `/auth/callback/page.tsx` that:

1. Runs in the browser (can access hash fragments)
2. Extracts `access_token` and `refresh_token` from URL hash
3. Calls `supabase.auth.setSession()` to establish the session
4. Waits 500ms for cookies to be set
5. Redirects to `/dashboard` with full page reload

## Implementation

### New File: `src/app/auth/callback/page.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    const handleCallback = async () => {
      // Parse hash fragments
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken) {
        // Establish session from tokens
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        // Wait for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    }

    handleCallback()
  }, [])

  return <div>Completing authentication...</div>
}
```

### How It Works

1. **Google OAuth redirect:**
   ```
   User clicks "Continue with Google"
   → Google consent screen
   → Approve
   → Redirect to: http://localhost:3001/#access_token=xxx...
   ```

2. **Client-side handler catches it:**
   ```
   /auth/callback/page.tsx renders
   → useEffect runs
   → Reads hash fragments
   → Calls supabase.auth.setSession()
   → Session is established in cookies
   ```

3. **Redirect to dashboard:**
   ```
   window.location.href = '/dashboard'
   → Full page reload
   → Auth context picks up session from cookies
   → Dashboard sees authenticated user
   → Shows dashboard content
   ```

## Unified Callback Handler

We have a **single client-side page** at `/auth/callback/page.tsx` that handles **both** OAuth flows:

1. **Hash-based (implicit) flow:** `#access_token=...`
   - Reads tokens from URL hash
   - Calls `supabase.auth.setSession()`

2. **PKCE flow:** `?code=...`
   - Reads code from query params
   - Calls `supabase.auth.exchangeCodeForSession()`

This covers all Supabase auth flows:
- **Email magic link:** Uses PKCE (`?code=...`) → Client exchanges code
- **Email + password:** Creates session directly → No callback needed
- **Google OAuth:** Uses implicit (`#access_token=...`) → Client sets session

**Why client-side only?**
- Hash fragments can't be read server-side
- Client can handle both hash and query params
- Simpler architecture with one handler

## Testing

### Test Google OAuth
1. Clear storage: http://localhost:3000/clear-storage.html
2. Go to http://localhost:3000
3. Click "Sign In"
4. Click "Continue with Google"
5. Complete Google OAuth
6. **Expected:** 
   - Redirected to `http://localhost:3001/#access_token=...`
   - Briefly see "Completing authentication..."
   - After 500ms, redirected to `/dashboard`
   - Dashboard shows your profile

### Verify Session
1. After OAuth, open DevTools
2. Application → Cookies → `http://localhost:3000`
3. Should see Supabase auth cookies:
   - `sb-<project>-auth-token`
   - `sb-<project>-auth-token.0`
   - `sb-<project>-auth-token.1`

## Alternative: Force PKCE Flow

If you want Google OAuth to use PKCE instead of implicit flow, update the OAuth call:

```typescript
// In src/lib/auth.ts
export async function signInWithProvider(provider: 'google') {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: false,
      // Force PKCE flow instead of implicit
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
}
```

However, this requires additional Supabase configuration and may not work with all OAuth providers. The hash-based flow is simpler and works out of the box.

## Hash Fragments vs Query Params

| Aspect | Hash Fragments (`#`) | Query Params (`?`) |
|--------|---------------------|-------------------|
| **Format** | `/#access_token=xxx` | `/?code=xxx` |
| **Server Access** | ❌ Not sent to server | ✅ Sent to server |
| **Client Access** | ✅ Available in JS | ✅ Available in JS |
| **Security** | Lower (tokens in browser history) | Higher (code is exchanged server-side) |
| **Flow Type** | Implicit / Hash | PKCE / Authorization Code |
| **Use Case** | SPAs, simple apps | Server-rendered, more secure |

## Why Supabase Uses Hash Flow for OAuth

1. **Simplicity:** Works without server-side code exchange
2. **Compatibility:** Works with all OAuth providers
3. **Speed:** No extra server round-trip
4. **SPA-friendly:** Designed for client-side apps

For production, you can configure Supabase to use PKCE flow for better security.

## Security Note

Hash-based tokens appear in browser history and can be logged. For production:
1. Use PKCE flow when possible
2. Ensure short token expiry
3. Use `httpOnly` cookies
4. Enable HTTPS only

Current implementation is fine for development and internal apps.
