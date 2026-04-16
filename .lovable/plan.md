

## Dashboard & Profile Navigation Fixes

### Problem 1: Dashboard has 3 redundant session cards
"Browse Sessions", "Join a Session", and "My Sessions" all navigate to `/sessions`. These should be consolidated into one card.

### Problem 2: Profile tab in BottomNav navigates to player's public profile slug
When clicking "Profile" in the venue bottom nav, it goes to `/${profileSlug}` (the public player profile page). Users expect it to go to their personal account/profile settings, not the public-facing page.

### Plan

**1. Consolidate Dashboard session cards** (`src/pages/Dashboard.tsx`)
- Replace the 3 separate cards ("Browse Sessions", "Join a Session", "My Sessions") with a single "Sessions" card
- Keep the session count in the description: e.g. "Browse, join & manage · {N} upcoming"
- Keep it as the primary (highlighted) card

**2. Fix Profile tab destination** (`src/components/arena/BottomNav.tsx`)
- Change the Profile tab to navigate to the venue-scoped dashboard (`/${slug}/dashboard`) instead of the public profile slug
- This is the existing PlayerDashboard page which contains personal account/edit profile functionality
- Keep the public profile accessible from within that dashboard or the Rankings page

### Files Modified
- `src/pages/Dashboard.tsx` — merge 3 session cards into 1
- `src/components/arena/BottomNav.tsx` — profile tab routes to `/${slug}/dashboard`

