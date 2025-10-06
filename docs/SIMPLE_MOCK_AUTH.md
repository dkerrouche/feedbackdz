# Simple Mock Auth Setup

## Current Configuration

All complex authentication has been removed. The app now uses a simple mock auth system that:

1. **No sign-in required** - Direct access to dashboard
2. **Hardcoded business** - Fetches business by phone `+213123456789`
3. **No middleware protection** - All routes accessible
4. **No API auth checks** - All endpoints open

## How It Works

### Home Page (`src/app/page.tsx`)
- Simple landing page
- Direct "Go to Dashboard" button
- No auth context, no checks, no loading states

### Dashboard (`src/app/dashboard/page.tsx`)
- Loads business by hardcoded phone: `+213123456789`
- No user context
- No protected route wrapper (bypassed)
- Direct database access

### Middleware (`src/middleware.ts`)
- Completely bypassed
- All routes return `NextResponse.next()`
- No session checks

### API Routes (`src/app/api/surveys/route.ts`)
- No ownership validation
- No session checks
- Direct database operations

## Database Setup

Make sure you have a business with phone `+213123456789` in your database:

```sql
SELECT * FROM businesses WHERE phone = '+213123456789';
```

If not, create one:

```sql
INSERT INTO businesses (phone, name, category, description)
VALUES ('+213123456789', 'Test Restaurant', 'Restaurant', 'Test business for development');
```

## Usage

1. **Go to home:**
   ```
   http://localhost:3001/
   ```

2. **Click "Go to Dashboard"** - Instant access, no auth

3. **Dashboard loads** - Shows business with phone `+213123456789`

4. **All features work:**
   - View/create surveys
   - View responses
   - Analytics
   - Business profile

## What Was Removed

### Deleted Complex Auth:
- ❌ Google OAuth flow
- ❌ Email magic link
- ❌ Email/password sign-up/sign-in
- ❌ Session management
- ❌ Cookie handling
- ❌ Auth context provider
- ❌ Protected route checks
- ❌ Middleware auth validation
- ❌ API ownership checks

### Kept Simple:
- ✅ Direct dashboard access
- ✅ Hardcoded business lookup
- ✅ Open API endpoints
- ✅ No auth UI/UX

## Re-enabling Auth Later

When you want to add real auth back:

1. **Restore middleware** - Uncomment auth checks in `src/middleware.ts`
2. **Restore ProtectedRoute** - Add user context checks
3. **Update dashboard** - Load business by `user_id` instead of phone
4. **Update APIs** - Add ownership validation
5. **Add auth UI** - Sign-in/sign-up pages

See `docs/AUTH_SETUP.md` and `docs/features/0008_PLAN.md` for the complete auth implementation.

## Development Benefits

- ✅ Fast development - No auth flow to navigate
- ✅ Easy testing - Direct feature access
- ✅ Simple debugging - No session issues
- ✅ Quick iterations - No sign-in/sign-out cycles

## Production Warning

⚠️ **DO NOT DEPLOY THIS TO PRODUCTION**

This setup has:
- No security
- No user isolation
- No access control
- Open APIs

Only use for local development!
