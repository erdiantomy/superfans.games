# CLAUDE.md — SuperFansPro (Tom's Padel Arena)

## Project Overview

SuperFansPro is a **padel sports gamification platform** (Tom's Padel Arena). Players join sessions, compete, earn XP, climb division ranks, and participate in a fan support economy. Venue owners manage arenas with live leaderboards and monthly prize pools.

**Stack:** Vite + React 18 + TypeScript 5 + Tailwind CSS 3 + shadcn/ui + Supabase (PostgreSQL + Auth + Realtime + Edge Functions) + Xendit payments

**Domain:** tomspadel.com | Indonesian market (IDR currency)

## Commands

```bash
npm run dev          # Vite dev server on port 8080
npm run build        # Production build to /dist
npm run preview      # Preview production build
npm run lint         # ESLint
npm run test         # Vitest (run once)
npm run test:watch   # Vitest (watch mode)
```

## Architecture

### Directory Structure

```
src/
  pages/              # 18 page components (route-level)
  components/
    ui/               # shadcn/ui primitives (40+ Radix-based)
    arena/            # Session, leaderboard, match components
    fanprize/         # Fan prize & mobile app screens
    profile/          # Player profile & claim system
    wallet/           # Wallet & payment components
  hooks/              # Custom React hooks (business logic)
  lib/                # Utility functions & core logic
  integrations/
    supabase/         # Client init + auto-generated types
    lovable/          # OAuth helpers
  data/               # Constants
  test/               # Test setup, mocks, utilities

supabase/
  migrations/         # 21+ SQL migration files
  functions/          # Deno edge functions (payments, email, webhooks)

remotion/             # Separate Bun project for video rendering
```

### Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route config + provider stack (Query, Auth, Venue, Tooltip) |
| `src/hooks/useArena.ts` | TanStack Query hooks for sessions, players, scores, supports |
| `src/hooks/useAuth.tsx` | Supabase auth context provider (Google OAuth) |
| `src/hooks/useRealtime.ts` | Supabase Realtime subscriptions |
| `src/hooks/useVenue.tsx` | Venue-scoped context |
| `src/lib/gamification.ts` | XP formula, divisions, support payout calculations |
| `src/lib/notifyAdmin.ts` | Admin notification triggers |
| `src/integrations/supabase/client.ts` | Supabase client initialization |
| `src/integrations/supabase/types.ts` | Auto-generated DB types (37KB) |
| `src/data/constants.ts` | App-wide constants |
| `supabase/migrations/002_arena_tables.sql` | Core arena schema + triggers |

### Routing

Routes are venue-scoped via `/:slug` parameter:

```
/                         → HomePage (landing)
/auth                     → AuthScreen (Google OAuth)
/register                 → RegisterPage
/topup                    → TopUpPage (credit purchase)
/payment/success|failed   → Payment callbacks
/superadmin               → SuperAdminPage (platform admin)
/:slug                    → SlugResolver (player profile or venue)
/:slug/rank               → RankPage (leaderboard)
/:slug/host               → HostDashboard (create/manage sessions)
/:slug/admin              → AdminPage (approve scores/sessions)
/:slug/session/:code      → SessionPage (live match page)
```

### Provider Stack (in App.tsx)

```
QueryClientProvider → AuthProvider → VenueProvider → TooltipProvider → BrowserRouter
```

### Data Flow

```
Component → useArena() hook → TanStack Query → Supabase REST/RPC → PostgreSQL
                                    ↕
                         Auto-revalidate on mutation
                         Realtime subscriptions invalidate cache
```

**React Query config:** `staleTime: 30_000, retry: 1`

## Code Conventions

### Components
- Functional components only, no class components
- TypeScript interfaces for props (no `I` prefix)
- Default exports for pages, named exports for shared components
- shadcn/ui for all UI primitives — do not build custom buttons, dialogs, etc.

### Hooks
- Custom hooks in `src/hooks/` encapsulate all Supabase queries
- Use TanStack Query (`useQuery`, `useMutation`) for server state
- React Context for auth and venue state

### Styling
- Tailwind CSS utility classes (no CSS modules)
- shadcn/ui theming via CSS variables (defined in `index.css`)
- Custom fonts: Barlow Condensed (headings), Inter (body)
- Framer Motion for entrance animations
- Dark mode: class-based

### TypeScript
- **Loose config:** `noImplicitAny: false`, `allowJs: true`, no strict null checks
- Path alias: `@/*` maps to `src/*`
- Arena tables lack generated types — cast via `as any` when calling Supabase RPCs
- `@typescript-eslint/no-unused-vars` is turned off

### Formatting
- No Prettier config — ESLint only
- Currency formatters: `idr(n)` for Rupiah, `cr(n)` for credits (in `gamification.ts`)

## Database (Supabase)

### Core Tables

| Table | Purpose |
|-------|---------|
| `padel_players` | Player profiles: XP, division, credits, wins/losses |
| `sessions` | Tournament sessions with approval workflow |
| `session_players` | Join requests + approved roster |
| `score_submissions` | Self-reported scores pending admin approval |
| `session_supports` | Fan support pool per session |
| `monthly_resets` | Monthly prize cycle tracking |
| `credit_packages` | Top-up tiers and pricing |
| `payment_orders` | Xendit payment tracking |
| `notifications` | In-app + email notifications |
| `notification_preferences` | User notification settings |

### RPC Functions

| Function | Purpose |
|----------|---------|
| `upsert_padel_player()` | Create/update player on sign-in |
| `credit_xp_for_score(submission_id)` | Award XP after admin approval |
| `resolve_support_payouts(session_id, winner_id)` | Distribute 70/20/10 split |
| `update_division()` | Auto-trigger: update division badge from XP |
| `credit_player_balance()` | Add credits from payments |

### Row-Level Security Patterns

```sql
-- Public read (leaderboards)
CREATE POLICY "..." ON padel_players FOR SELECT USING (true);
-- User-specific write
CREATE POLICY "..." ON padel_players FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Role-based
CREATE POLICY "..." ON sessions FOR UPDATE USING (
  host_id IN (SELECT id FROM padel_players WHERE user_id = auth.uid())
);
```

### Migrations

Stored in `supabase/migrations/`, timestamped filenames. Core schema is in `002_arena_tables.sql`. Run in order when setting up a new Supabase project.

## Gamification Engine

**Source of truth:** `src/lib/gamification.ts`

### XP Formula
```
XP = (Win: 100 / Loss: 50) × rank_multiplier
Multipliers: 1st×2.0, 2nd×1.7, 3rd×1.4, 4-6×1.2, 7+×1.0
```

### Divisions (based on lifetime_xp)
| Division | Min XP |
|----------|--------|
| Diamond | 3000 |
| Platinum | 2400 |
| Gold | 1600 |
| Silver | 900 |
| Bronze | 0 |

### Two Accumulators
- **lifetime_xp** — never resets, determines division badge
- **monthly_pts** — resets monthly, drives prize ladder (top 3 share IDR 2,000,000)

### Support Economy (70/20/10 split)
- 70% to winning supporters (proportional to stake)
- 20% to winning player (wallet credit)
- 10% platform fee

## Edge Functions (Supabase)

Deno-based serverless functions in `supabase/functions/`:

| Function | Purpose |
|----------|---------|
| `create-payment` | Create Xendit invoice for credit top-up |
| `xendit-webhook` | Handle payment confirmation, credit player wallet |
| `send-notification-email` | Send transactional emails via Resend |
| `notify-admin` | Trigger admin alerts |

## Testing

### Unit Tests (Vitest)
- Config: `vitest.config.ts` (jsdom environment)
- Setup: `src/test/setup.ts` (mocks for matchMedia, ResizeObserver, IntersectionObserver)
- Tests live in `src/**/__tests__/` directories
- Run: `npm run test` or `npm run test:watch`

### E2E Tests (Playwright)
- Config: `playwright.config.ts` (uses Lovable integration wrapper)
- Fixture: `playwright-fixture.ts`

### Test Mocks
Browser APIs are mocked in setup: `matchMedia`, `ResizeObserver`, `IntersectionObserver`, `scrollTo`, `navigator.clipboard`, `URL.createObjectURL`.

## Environment Variables

### Frontend (Vite — must be prefixed with `VITE_`)
```
VITE_SUPABASE_URL           # Supabase project URL
VITE_SUPABASE_ANON_KEY      # Supabase anonymous/public key
```

### Edge Functions (set in Supabase dashboard)
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY
XENDIT_SECRET_KEY
```

## Session Workflow (Anti-Fraud)

```
Host creates session (status: pending_approval)
  → Admin approves → status: active
  → Host shares invite link
  → Players sign in (Google OAuth) → request to join
  → Host approves/declines each player
  → Session runs → players self-report scores
  → Admin approves scores → XP credited → support payouts resolved
  → Leaderboard updates live via Supabase Realtime
```

## Common Pitfalls

1. **Arena type casting:** Auto-generated Supabase types in `types.ts` may not include arena tables. Use `as any` casts when calling arena RPCs until types are regenerated.
2. **Loose TypeScript:** The project uses permissive TS config. Don't add strict checks without coordinating across the codebase.
3. **Port 8080:** Dev server binds to `0.0.0.0:8080`, not the default 5173.
4. **Real-time invalidation:** Supabase Realtime subscriptions auto-invalidate React Query cache — avoid adding polling.
5. **Venue scoping:** Most routes are scoped to `/:slug`. Always resolve venue context before querying data.
6. **Payment flow:** Xendit payments go through edge functions, not direct API calls from the frontend.
7. **No SSR:** This is a client-side SPA deployed to Vercel with a catch-all rewrite to `index.html`.

## Deployment

```bash
npm run build    # Outputs to /dist
```

Deploy `/dist` to Vercel (configured via `vercel.json` with SPA rewrite). Supabase handles all backend concerns (database, auth, realtime, edge functions).
