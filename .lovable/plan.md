

# SuperFans — Comprehensive Fix & Improvement Plan

This plan addresses all 7 items from your refined prompts, grouped into phases.

---

## Phase 1: Auth Guard Fix (Items #1 & #2 — shared root cause)

**Problem**: "Support Player" button on player profiles (/:slug) doesn't gate on auth properly. Logged-out users either see a 404 or the donation silently fails. The `DonationModal` has a toast guard but the button itself is always visible with no redirect to login.

**Fix**:
- In `PlayerProfilePage.tsx`: When user taps "Support Player" while logged out, redirect to `/auth?returnTo=/{slug}` instead of opening the modal.
- In `AuthScreen.tsx`: Read `returnTo` from URL search params. After successful login, navigate to `returnTo` instead of the default `/fanprize`.
- In `useAuth.tsx`: No changes needed — session hydration is already handled via `onAuthStateChange` + `getSession`.
- Add a loading/skeleton state to `SlugResolver` and `PlayerProfilePage` during auth hydration to prevent the race condition causing intermittent 404s.

**Files**: `PlayerProfilePage.tsx`, `AuthScreen.tsx`, `SlugResolver.tsx`

---

## Phase 2: Session Sync Fix (Items #6 & #7)

**Problem**: Sessions created by hosts sometimes don't appear in the admin panel.

**Current state**: The admin query at `AdminPage.tsx:24-35` filters by `venue_id` and orders by `created_at` — no `start_time <= now()` filter exists, so scheduled future sessions are NOT excluded. The previous fix ensured `venue_id` is always set on creation.

**Remaining fix**:
- Add Supabase Realtime subscription to the admin sessions query so new inserts appear without refresh. Currently `useArenaRealtime()` is called but it may not invalidate the `venue-admin-sessions` query key.
- In `useRealtime.ts`: Ensure the realtime channel for `sessions` table invalidates `["venue-admin-sessions"]` query key on INSERT events.
- Add a manual "Refresh" button on the admin sessions tab as a fallback.

**Files**: `src/hooks/useRealtime.ts`, `AdminPage.tsx`

---

## Phase 3: Indonesian Localization (Item #3)

**Approach**: Install `react-i18next` + `i18next`. Create translation files for `id` (default) and `en` (fallback).

**Scope — core flows first**:
- Auth screen (login, signup labels)
- Home page (hero, role tabs, CTAs)
- Session join flow (join button, status labels)
- Wallet/credits (top-up labels, transaction types)
- Player profile (stats labels, support CTA)
- Bottom nav labels
- Toast messages

**Structure**:
```text
src/
  i18n/
    index.ts          ← i18n init
    locales/
      id.json         ← Indonesian strings
      en.json         ← English strings
```

- Add a language toggle (🇮🇩/🇬🇧) in the profile screen and homepage footer.
- Wrap app with `I18nextProvider` in `main.tsx`.
- Replace hardcoded strings incrementally using `useTranslation()` hook.

**Files**: New `src/i18n/` directory, then updates across ~15 component files.

---

## Phase 4: UX Restructure — Entry Paths (Item #4)

**Current state**: Everything funnels through `HomePage.tsx` (role tabs) and venue-scoped routes. The homepage already has role-based content (player/venue/host tabs), but all three share one page.

**New structure**:
- Keep `HomePage.tsx` as the marketing landing with simplified hero + 3 clear CTAs linking to:
  - `/join` — "I want to play" → shows nearby venues, open sessions, join flow
  - `/host` — "I want to host" → redirects to `/:slug/host` after venue selection (or shows venue picker)
  - `/register` — "Register my venue" → existing registration form
- The existing `/:slug/host` and `/:slug/admin` routes stay as-is (they're venue-scoped).
- Add role detection: after login, if user has hosted before, show "Host" in bottom nav. If admin role, show "Admin".

**Files**: `HomePage.tsx` (simplify), new `src/pages/JoinPage.tsx`, update `App.tsx` routes.

---

## Phase 5: UX Clarity Pass (Item #5)

**Changes**:
1. **First-login onboarding**: After first sign-in (detect via `padel_players.created_at` being within last 60 seconds), show a 3-step onboarding modal: "Welcome → Pick your role → Here's what to do next".
2. **Reduce clutter per screen**: On venue page, collapse secondary actions into a "More" menu. Keep single primary CTA per view.
3. **Breadcrumbs**: Add lightweight breadcrumb to venue-scoped pages: `Home > Venue Name > Sessions`.
4. **Step indicators**: Already exist for registration form; extend to session creation form in `HostDashboard.tsx`.

**Files**: New `src/components/Onboarding.tsx`, updates to `VenuePage.tsx`, `HostDashboard.tsx`, `SessionPage.tsx`.

---

## Implementation Order

1. **Phase 1** (Auth guards) — highest impact, fixes broken user flow
2. **Phase 2** (Realtime sync) — fixes admin workflow
3. **Phase 3** (i18n) — unlocks Indonesian market
4. **Phase 4** (Entry paths) — structural UX improvement
5. **Phase 5** (UX clarity) — polish layer

---

## Technical Notes

- No database migrations needed for Phases 1-2.
- Phase 3 requires `npm install react-i18next i18next` — no backend changes.
- Phases 4-5 are frontend-only restructuring.
- All changes maintain existing RLS policies and auth patterns.

