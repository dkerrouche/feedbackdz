# Auth Redirect Fix

## Problem
After successful sign-up or sign-in with email/password or Google OAuth, users were being redirected back to the home page with the "Sign In" button instead of going to the dashboard.

## Root Causes

### Issue 1: Race Condition on Redirect
When using `router.push('/dashboard')` for client-side navigation, the redirect happened too quickly before:
1. The Supabase session was fully established in cookies
2. The `useAuth` hook could pick up the session change
3. The auth context state was updated

This created a race condition where:
- User signs in → Session created in Supabase
- Immediate redirect to dashboard → Auth context still shows `user = null`
- Dashboard's `ProtectedRoute` sees no user → Redirects back to home

### Issue 2: OAuth Hash-based Flow Not Handled
Supabase OAuth (Google) returns tokens in URL hash fragments:
```
/#access_token=...&refresh_token=...
```

The original `/auth/callback` route handler only processed PKCE flow with `?code=...` query params, so hash-based tokens were ignored and the session never established.

## Solution

### 1. Force Full Page Reload After Auth
Changed from `router.push()` to `window.location.href` with a small delay:

**Before:**
```typescript
if (res.success) {
  router.push('/dashboard')  // Client-side navigation - too fast
}
```

**After:**
```typescript
if (res.success) {
  // Wait for session to be established
  await new Promise(resolve => setTimeout(resolve, 500))
  // Force full reload to ensure auth context picks up session
  window.location.href = '/dashboard'
}
```

**Why this works:**
- `window.location.href` triggers a full page reload
- The 500ms delay ensures cookies are set
- On reload, `useAuth` hook fetches fresh session from Supabase
- Auth context has the user before dashboard renders

### 2. Handle Hash-based OAuth Tokens
Created client-side callback page to handle OAuth implicit flow:

**New file: `/auth/callback/page.tsx`**
```typescript
// Check for hash fragments (OAuth implicit flow)
const hashParams = new URLSearchParams(window.location.hash.substring(1))
const accessToken = hashParams.get('access_token')
const refreshToken = hashParams.get('refresh_token')

if (accessToken) {
  // Set the session from hash fragments
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || '',
  })
  
  // Wait and redirect to dashboard
  await new Promise(resolve => setTimeout(resolve, 500))
  window.location.href = '/dashboard'
}
```

**Why this works:**
- Hash fragments (`#access_token=...`) are only available client-side
- Server-side route handler can't read hash fragments
- Client component reads tokens from hash and establishes session
- Then redirects to dashboard with full reload

### 3. Better Error Handling in Server Callback
Enhanced `/auth/callback/route.ts` to:
- Check for OAuth errors in URL params
- Validate session after code exchange
- Redirect to home with error message on failure
- Log session establishment for debugging

**Added:**
```typescript
// Check for OAuth errors
if (error) {
  const homeUrl = new URL('/', req.url)
  homeUrl.searchParams.set('error', error_description || error)
  return NextResponse.redirect(homeUrl)
}

// Validate session was created
if (!data.session) {
  const homeUrl = new URL('/', req.url)
  homeUrl.searchParams.set('error', 'No session created')
  return NextResponse.redirect(homeUrl)
}
```

### 4. Show Errors on Home Page
Updated home page to display error messages from failed auth:

```typescript
const searchParams = useSearchParams()
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  const errorParam = searchParams.get('error')
  if (errorParam) {
    setError(errorParam)
  }
}, [searchParams])
```

## Files Changed

1. **`src/components/auth/EmailAuth.tsx`**
   - Changed `handleSignUp` and `handleSignIn` to use `window.location.href`
   - Added 500ms delay before redirect

2. **`src/app/auth/callback/page.tsx` (NEW)**
   - Client-side callback handler for OAuth hash-based tokens
   - Reads `access_token` and `refresh_token` from URL hash
   - Establishes session using `setSession()`
   - Redirects to dashboard after session is set

3. **`src/app/auth/callback/route.ts`**
   - Added OAuth error checking
   - Added session validation
   - Enhanced error logging
   - Redirect to home with error message on failure

4. **`src/app/page.tsx`**
   - Added error state and display
   - Read error from URL search params

5. **`docs/AUTH_SETUP.md`**
   - Added troubleshooting section for this issue

## Testing

### Test Sign Up
1. Clear storage: http://localhost:3000/clear-storage.html
2. Go to http://localhost:3000
3. Click "Sign In"
4. Switch to "Sign Up" tab
5. Enter email + password
6. Submit
7. **Expected:** After 500ms, redirected to `/dashboard` with full reload
8. **Expected:** Dashboard shows your user info and business creation form

### Test Sign In
1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter existing email + password
4. Submit
5. **Expected:** After 500ms, redirected to `/dashboard` with full reload
6. **Expected:** Dashboard shows your business data

### Test Google OAuth
1. Click "Continue with Google"
2. Complete OAuth flow
3. **Expected:** Redirected to `/auth/callback` → `/dashboard`
4. **Expected:** Dashboard shows your user info

### Test Magic Link
1. Enter email
2. Click "Send Magic Link"
3. Check email
4. Click link
5. **Expected:** Redirected to `/auth/callback` → `/dashboard`
6. **Expected:** Dashboard shows your user info

## Alternative Solutions Considered

### 1. Wait for onAuthStateChange event
**Issue:** Event might not fire immediately after sign-in
**Complexity:** Requires Promise wrapper around event listener

### 2. Poll for session
**Issue:** Unnecessary network requests
**Complexity:** Need to manage polling interval and cleanup

### 3. Pass session from sign-in to dashboard
**Issue:** Not secure to pass session in URL
**Complexity:** Requires session serialization

### 4. Use Supabase auth helpers with Next.js
**Status:** We already use `@supabase/ssr` for server-side
**Current approach:** Simple and works reliably

## Why Full Reload is OK

**Performance:** One-time reload after authentication is acceptable
**Simplicity:** No complex state synchronization needed
**Reliability:** Ensures fresh session from cookies
**User Experience:** Brief loading spinner, then dashboard appears

The 500ms + reload adds ~1 second to sign-in flow, which is reasonable for authentication.

## Future Improvements

If performance becomes a concern:
1. Pre-fetch dashboard data during auth
2. Use Supabase Realtime for instant session updates
3. Implement optimistic UI updates
4. Use SWR/React Query for better cache management

For now, the full reload approach is simple, reliable, and fast enough.
