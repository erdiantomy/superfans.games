

## Fix: Super Admin Login for Google OAuth Accounts

**Problem**: The `/superadmin` login gate uses `supabase.auth.signInWithPassword()`, but your account (`erdian.tomy@gmail.com`) was created via Google OAuth. There's no password associated with it, so email+password login always fails with "Invalid login credentials."

**Solution**: Add a "Sign in with Google" button alongside the existing email+password form in the AuthGate component. This way you can authenticate with your Google account (which already has the `admin` role assigned).

### Changes

**File**: `src/pages/SuperAdminPage.tsx`

1. Import `lovable` from `@/integrations/lovable` (same OAuth helper used in AuthScreen)
2. Add a "Sign in with Google" button below the existing SIGN IN button in the AuthGate's login form
3. Wire it to `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/superadmin" })` so after Google auth the user returns to `/superadmin`
4. Add a visual divider ("or") between the email+password form and the Google button

The existing admin role check (`useIsAdmin`) remains unchanged — after Google sign-in, the page will verify the user has the `admin` role before granting access.

