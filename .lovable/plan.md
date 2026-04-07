

# Fix Plan: Session Approval, Home vs Matches, and Coming Soon Items

## Issue 1: Session Approval Not Working (Accept/Reject)

**Root cause**: The venue admin page authenticates via a staff password (`verify_venue_password` RPC), but this does NOT establish a Supabase auth session. The `useUpdateSession` mutation calls `supabase.from("sessions").update(...)` which goes through RLS. The UPDATE policy on `sessions` requires either:
- The user is the host (`host_id` matches `auth.uid()` via `padel_players`)
- The user has the `admin` app_role

Since staff password auth doesn't set `auth.uid()`, the update silently fails (returns no rows, no error thrown by `.single()`... actually it will error on `.single()` with "no rows returned").

Additionally, `useUpdateSession.onSuccess` only invalidates `["sessions"]` and `["session"]` query keys — NOT `["venue-admin-sessions"]`, so even if the mutation succeeded, the admin list wouldn't refresh.

**Fix**:
1. Change the session approval/rejection flow in `AdminPage.tsx` to use an RPC function (`approve_session` / `reject_session`) with `SECURITY DEFINER` that bypasses RLS, validated by checking the venue password was verified (or simply checking the venue's `admin_password_hash` matches).
2. **Simpler alternative**: Add an RLS policy allowing any authenticated user to update sessions where they can verify the venue password. But since admin staff may not be logged in via Supabase Auth at all, the best approach is:
   - Create a new edge function `manage-session` that accepts `{ venue_slug, password, session_id, action: "approve"|"reject", note? }`, verifies the password server-side, and performs the update using the service role key.
   - Update `handleApproveSession` and `handleRejectSession` in `AdminPage.tsx` to call this edge function instead of `useUpdateSession`.
3. After success, invalidate `["venue-admin-sessions", venueId]` with the correct venueId parameter.

**Files**: New edge function `supabase/functions/manage-session/index.ts`, updates to `AdminPage.tsx`.

**Migration**: None needed — no schema changes.

---

## Issue 2: Home & Matches Tab Showing No Difference

**Root cause**: In `Index.tsx` line 96-97, both `"home"` and `"matches"` nav items map to the same screen:
```ts
const map = { home: "home", matches: "home", ... };
```
Both render `HomeScreen` which shows all matches (live, upcoming, finished) mixed with leaderboard.

**Fix**:
1. When `nav === "matches"`, render a dedicated matches-only view that shows ALL matches grouped by status (live → upcoming → finished) without the leaderboard, hero banner, or prize pool widget.
2. Keep `"home"` as the current view (hero + leaderboard + highlights).
3. Create a new `MatchesScreen` component that shows a filterable list of matches with status tabs (All / Live / Upcoming / Finished).

**Files**: New `src/components/fanprize/MatchesScreen.tsx`, update `Index.tsx` to add the screen mapping.

---

## Issue 3: Edit Profile & Help Center "Coming Soon"

**Fix**:
1. **Edit Profile**: Build a simple edit profile screen that lets users update their `display_name` and `avatar_url` in the `profiles` table. Add it as a new screen in the fanprize flow.
2. **Help Center**: Create a basic FAQ/help screen with common questions (How to earn points, How to support players, How credits work, Contact support). No backend needed — static content.
3. Remove the "coming soon" toasts and wire up real navigation.

**Files**: New `src/components/fanprize/EditProfileScreen.tsx`, new `src/components/fanprize/HelpCenterScreen.tsx`, update `ProfileScreen.tsx` and `Index.tsx`.

---

## Implementation Order

1. **Issue 1** — Session approval edge function + AdminPage update (critical bug)
2. **Issue 2** — MatchesScreen component + Index routing
3. **Issue 3** — EditProfile + HelpCenter screens

## Technical Details

### Edge Function: `manage-session`
```
POST /manage-session
Body: { venue_slug, password, session_id, action, note? }
→ Verifies password via SQL crypt()
→ Updates session status using service role
→ Returns updated session
```

### MatchesScreen
- Reuses existing `useMatches()` hook
- Adds filter tabs: All | Live | Upcoming | Finished
- Same match card components as HomeScreen but without leaderboard/hero

### EditProfileScreen
- Form with display_name, avatar_url fields
- Updates `profiles` table (existing RLS allows user to update own profile)
- Navigate back to ProfileScreen on save

