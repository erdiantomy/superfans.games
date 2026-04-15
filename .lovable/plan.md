

## Venue-Scoped Navigation & Profile Page Overhaul

Based on the improvement report, the current venue bottom nav has 4 tabs (Home, Rankings, My Page, Top Up). The request is to expand to 5 tabs and clearly separate "Profile" (personal data / padel rating) from "Session" (match history).

### Current State
- **BottomNav** (`src/components/arena/BottomNav.tsx`): 4 tabs — Home, Rankings, My Page (links to player profile slug), Top Up
- **VenuePage** (`/:slug`): serves as the venue home — shows sessions/matches
- **RankPage** (`/:slug/rank`): leaderboard
- **PlayerProfilePage**: shows stats + donations + badges — mixes personal data with match stats
- **PlayerDashboard** (`/:slug/dashboard`): edit profile (owner only)
- No dedicated "Sessions" tab — sessions are embedded in the venue home page

### Plan

**1. Add 5th "Sessions" tab to BottomNav**

Update `src/components/arena/BottomNav.tsx`:
- Change from 4 tabs to 5: **Home** → **Rankings** → **Sessions** → **Profile** → **Top Up**
- Sessions tab links to `/:slug/sessions` (new route)
- Profile tab links to player's own profile page (existing `/:profileSlug`)
- Adjust icon sizing for 5 tabs to fit comfortably

**2. Create venue-scoped Sessions page**

Create new route `/:slug/sessions` that shows:
- Active and recent match sessions for this venue
- Match history and results
- Extract session listing logic currently embedded in VenuePage into a reusable component

**3. Restructure Profile page content**

Update `src/pages/PlayerProfilePage.tsx` to focus on personal identity:
- **Personal data section**: display name, bio, social links, avatar
- **Padel rating/skill section**: division, XP progress, badges
- **Playing stats**: games, wins, losses, win rate
- Move "Recent Support" / donation history to a secondary tab or collapsible section
- Clearly label this as the player's identity page, not a session log

**4. Add route for `/:slug/sessions`**

Update `src/App.tsx`:
- Add `<Route path="/:slug/sessions" element={<VenueLayout><VenueSessionsPage /></VenueLayout>} />`

**5. Update active-tab detection**

Update `getActive()` in BottomNav to detect the new `/sessions` path.

### Files Modified
- `src/components/arena/BottomNav.tsx` — 5 tabs, new sessions route, adjusted sizing
- `src/pages/VenueSessionsPage.tsx` — **new file**, venue-scoped sessions listing
- `src/pages/PlayerProfilePage.tsx` — restructure to focus on personal data & padel rating
- `src/App.tsx` — add `/:slug/sessions` route
- `src/pages/VenuePage.tsx` — potentially extract session list component for reuse

