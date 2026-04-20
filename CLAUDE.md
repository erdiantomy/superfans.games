# SuperFans Pro — Fan Engagement Platform

## Overview

SuperFans Pro is a padel gaming / fan engagement platform where players compete in sessions, fans support players with credits, and the platform distributes payouts based on results. Core features: session management, XP/division system, wallet/credits, Xendit payments, AI chat assistant, and real-time updates.

## Stack

- **Frontend**: React 18 + TypeScript + Vite (dev server on port 8080)
- **Backend**: Supabase (auth, DB, edge functions, realtime)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS v3 + Framer Motion
- **State**: TanStack Query v5 (React Query)
- **Forms**: react-hook-form v7 + @hookform/resolvers
- **Routing**: React Router v6
- **Payments**: Xendit (via Supabase edge functions)
- **Video**: Remotion v4 (in `/remotion` — separate package.json)
- **AI Chat**: Google Gemini 2.5 Flash (via chat-assistant edge function)
- **Auth**: Supabase Auth + Lovable OAuth (@lovable.dev/cloud-auth-js)
- **i18n**: i18next + i18next-browser-languagedetector
- **Notifications**: Sonner (toasts)
- **Testing**: Vitest v3 + Playwright v1 (E2E)

## Architecture

```
src/
├── assets/               # Images/media
├── components/
│   ├── ui/               # 48 shadcn/ui components — DO NOT manually edit
│   ├── fanprize/         # Core fan prize/match experience (16 components)
│   ├── arena/            # Arena features (BottomNav, PlayerLink)
│   ├── wallet/           # Credits display, transaction history
│   └── profile/          # Player profiles, claim/donation modals, SlugResolver
│   ChatAssistant.tsx     # AI assistant UI
│   TopNav.tsx            # Top navigation bar
│   MarketingLayout.tsx   # Marketing pages layout
│   Onboarding.tsx        # Onboarding flow
├── data/                 # Type definitions + sample constants + tests
├── hooks/                # Custom React hooks (see Hooks section)
├── i18n/                 # i18next config + locale files
├── integrations/
│   ├── supabase/         # Auto-generated client + DB types
│   └── lovable/          # Lovable OAuth wrapper
├── lib/
│   ├── gamification.ts   # XP, division, payout logic
│   ├── notifyAdmin.ts    # Admin notification system
│   ├── utils.ts          # cn() (clsx + tailwind-merge)
│   └── chat-assistant/   # Context registry + prompt builder for AI
├── pages/                # 24 route-level page components
└── test/                 # Vitest setup, fixtures, integration tests

supabase/
├── functions/            # 7 Deno edge functions
└── migrations/           # 25+ SQL migrations

remotion/                 # Video generation (separate package.json)
scripts/                  # check-context-staleness.mjs
docs/                     # SuperFans-Platform-Manual.pdf
```

## Pages & Routing

**App routes** (defined in `src/App.tsx`):

| Route | Page | Description |
|-------|------|-------------|
| `/` | `HomePage` | Landing page |
| `/gamification` | `GamificationPage` | Feature explanation |
| `/sessions` | `SessionsPage` | Session list |
| `/venues` | `VenuesPage` | Venue list |
| `/pricing` | `PricingPage` | Pricing |
| `/top-players` | `TopPlayersPage` | Leaderboard |
| `/auth` | `AuthScreen` | OAuth login |
| `/register` | `RegisterPage` | Venue registration |
| `/dashboard` | `Dashboard` | User dashboard |
| `/fanprize` | `Index` | Fanprize app (auth-gated) |
| `/topup` | `TopUpPage` | Credit purchase |
| `/payment/success` | `PaymentSuccessPage` | Payment confirmation |
| `/payment/failed` | `PaymentFailedPage` | Payment failure |
| `/rank` | `RankPage` | Leaderboard |
| `/host` | `HostDashboard` | Host/session manager |
| `/admin` | `AdminPage` | Venue admin panel |
| `/superadmin` | `SuperAdminPage` | Platform super-admin |
| `/s/:code` | `SessionPage` | Session detail (universal link) |
| `/:slug/*` | Venue-scoped | Dashboard, rank, host, admin, session |
| `/player/:slug` | `PlayerProfilePage` | Player profile |
| `*` | `NotFound` | 404 |

**Backwards-compat redirects**: `/session/:code` → `/s/:code`, `/match/:code` → `/s/:code`

**Provider hierarchy** (outermost → innermost):
`QueryClientProvider` → `AuthProvider` → `VenueProvider` → `TooltipProvider` → `BrowserRouter` → `Toaster`

## Auth & Roles

- Auth via Supabase + Lovable OAuth (Google/Apple)
- Roles: `player`, `host`, `admin`, `super-admin`
- RLS enforced on all tables — never expose cross-user data
- Role checking: `useAdmin` hook → `useIsAdmin()` query
- Venue-scoped routes wrapped in `VenueProvider` (loads venue by slug)

## Hooks (`src/hooks/`)

| Hook | Purpose |
|------|---------|
| `useAuth.tsx` | Auth context: session, user, loading, signOut |
| `useAdmin.ts` | `useIsAdmin()` — check admin role via DB query |
| `useArena.ts` | Arena data: PadelPlayer, Session, ScoreSubmission, SessionSupport types + queries/mutations |
| `useData.ts` | `useMatches()`, `useProfile()`, `useWalletTransactions()`, `useLeaderboard()` |
| `useQuests.ts` | Quest progression by cadence (daily/weekly/monthly) |
| `useRealtime.ts` | `useArenaRealtime()` + `useSessionRealtime()` — Supabase realtime for auto-refresh |
| `useVenue.tsx` | VenueProvider — loads venue by slug; venue context |
| `useNotifications.ts` | User notifications, preferences, realtime, mark-read mutations |
| `usePlayerNotifications.ts` | Arena player notifications, preferences, realtime |
| `use-mobile.tsx` | `useIsMobile()` — responsive hook (768px breakpoint) |
| `use-toast.ts` | Toast integration (Sonner) |

## Key Domain Concepts

### XP & Divisions (`src/lib/gamification.ts`)

```ts
// Rank multipliers for XP calculation (position 1–6)
const RANK_MULTIPLIERS = [2.0, 1.7, 1.4, 1.2, 1.2, 1.2];
calcXP(won: boolean, rank: number): number

// Divisions by XP threshold
diamond   >= 3000
platinum  >= 2400
gold      >= 1600
silver    >= 900
bronze    >= 0

getDivision(xp), getDivisionProgress(xp), getXpToNextDivision(xp)
```

### Support Payout Logic

- 70% of pot → winning supporters (proportional to stake)
- 20% → winning player
- 10% → platform fee
- Losing supporters' pool funds the winners

### Credits & Wallet

- Users top up credits via Xendit payment flow
- Wallet transactions tracked in `wallet_transactions` table
- Top-up page → `create-payment` edge function → Xendit → webhook callback updates wallet

### Sessions

- Sessions are padel matches with players, scores, and supporters
- `session_players`, `score_submissions`, `session_supports` tables
- Real-time updates via Supabase realtime subscriptions

### Player Profiles

- Slug-based routing: `/:slug` for venue, `/player/:slug` for players
- `ClaimProfileModal`, `DonationModal`, `SlugResolver` components

## Edge Functions (Deno runtime — `/supabase/functions/`)

| Function | Purpose |
|----------|---------|
| `chat-assistant` | AI chat — Gemini 2.5 Flash, 30 req/day limit, 400 max tokens, usage tracked in DB |
| `create-payment` | Xendit payment initiation — creates invoice, returns payment URL |
| `xendit-webhook` | Webhook receiver — updates payment status, credits wallet |
| `send-notification-email` | Email notifications (rank changes, payouts) |
| `notify-admin` | Admin notification trigger |
| `manage-session` | Session lifecycle management |
| `reset-monthly-leaderboard` | Scheduled job — monthly leaderboard reset |

**Deno constraints:**
- No Playwright/headless browsers
- No Node.js-only packages
- Use Deno-compatible imports

## Database Schema (Supabase)

Key tables (from `src/integrations/supabase/types.ts` — auto-generated, do not edit):

- `profiles` — User profiles
- `user_roles` — Role assignments
- `venues` — Venue registration and config
- `padel_players` — Arena players
- `sessions` — Match sessions
- `session_players` — Players in a session
- `score_submissions` — Score data
- `session_supports` — Fan support bets
- `wallet_transactions` — Credit transactions
- `credit_packages` — Available top-up packages
- `notifications` — User notifications
- `admin_notifications` — Admin-side notifications
- `notification_preferences` — Per-user notification config
- `chat_assistant_usage` — AI usage tracking
- `xendit_payment_logs` — Payment audit trail

DB functions: `upsert_padel_player`, leaderboard queries

## Build & Test

```bash
npm run dev           # Local dev server (port 8080)
npm run build         # Production build — MUST pass before PR
npm run build:dev     # Dev build
npm run lint          # ESLint
npm run preview       # Preview built output
npm run test          # Run Vitest once
npm run test:watch    # Vitest watch mode
npx tsc --noEmit      # Type check
```

**Proxy** (vite.config.ts): `/api/chat-assistant` → `localhost:54321` (Supabase edge functions)

**Path alias**: `@` → `./src`

**Build chunks**: vendor, supabase, ui (manual chunk splitting)

## Testing (`src/test/`)

**Setup files:**
- `setup.ts` — Mocks: matchMedia, ResizeObserver, IntersectionObserver, scrollTo, clipboard, URL.createObjectURL
- `test-utils.tsx` — Custom render utilities
- `mocks/supabase.ts` — Supabase mock client
- `mocks/fixtures.ts` — Test data fixtures

**Test coverage (20 test files):**
- Integration: `session-lifecycle`, `support-payout`, `venue-registration`, `xp-progression`
- Pages (13): AdminPage, AuthScreen, HomePage, HostDashboard, Index, NotFound, Payment flows, RankPage, RegisterPage, SessionPage, SuperAdminPage, TopUpPage, VenuePage
- Unit: `gamification.test.ts`, `constants.test.ts`
- Smoke: `example.test.ts`

**Pattern**: `src/**/*.{test,spec}.{ts,tsx}` | **Environment**: jsdom

## TypeScript

- Target: ES2020, Module: ESNext, JSX: react-jsx
- `strict: false`, `noImplicitAny: false` (project setting — don't change)
- Path alias: `@/*` → `./src/*`
- `src/integrations/supabase/types.ts` is auto-generated — do not manually edit

## Styling

- Tailwind CSS v3 with class-based dark mode
- Fonts: **Barlow Condensed** (display) + **Inter** (body)
- Colors: HSL-based CSS variables (see `tailwind.config.ts`)
- `cn()` utility from `src/lib/utils.ts` for conditional classnames
- `tailwindcss-animate` plugin for animations

## i18n

- `src/i18n/index.ts` — i18next initialization with browser language detection
- `src/i18n/locales/` — Translation files per language
- `LanguageToggle.tsx` — Language switcher component

## Remotion Video Generation (`/remotion/`)

Separate package with its own `package.json` and dependencies (React 19, Remotion v4).

```
remotion/src/
├── Root.tsx         # Composition root
├── MainVideo.tsx    # Main video composition
├── AppDemo.tsx      # Demo composition
├── Scene1–5.tsx     # Modular video scenes
└── components/PersistentBg.tsx
```

Run separately from the main app.

## Data & Constants (`src/data/constants.ts`)

Core interfaces: `Player`, `Match`, `Reward`, `LeaderboardUser`, `Transaction`

Currency formatters:
- `idr(n)` — Indonesian Rupiah
- `cr(n)` — Credits

Sample fixtures for dev: PLAYERS (4), MATCHES (4), REWARDS (6), LEADERBOARD (5), TRANSACTIONS (5)

## Deployment

- **Vercel**: SPA rewrite (`vercel.json`) — all routes → `/index.html`
- **CI/CD**: `.github/workflows/context-check.yml`

## Conventions

- **Components**: Function components with TypeScript, named exports
- **Queries**: TanStack Query via `useQuery`/`useMutation` — no direct Supabase calls in components
- **Realtime**: Use `useRealtime` hooks; don't create ad-hoc Supabase channel subscriptions
- **Notifications**: Toast via `sonner` — import from `@/components/ui/sonner` or use `toast()` directly
- **Routing**: Venue-scoped features must be inside `VenueProvider` context
- **Payments**: All payment flows go through `create-payment` edge function, never call Xendit directly from client
- **Auth**: Always use `useAuth()` hook; never access `supabase.auth` directly in components
- **shadcn/ui**: Do not manually edit files in `src/components/ui/` — use the CLI to add/update components
- **Types**: DB types come from `src/integrations/supabase/types.ts` (auto-generated)
