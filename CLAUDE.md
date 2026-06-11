# Superfans — Sports Social Network

> **Superfans is not a betting platform.** It's a sports social network where fans
> **compete, create, predict, and build reputation** — think Twitter + Reddit +
> Polymarket + Sofascore + Patreon.
>
> **Mission:** turn every sports fan into a creator.
> **Vision:** become the world's largest sports intelligence network.
>
> Product docs live in `docs/superfans/` — read [00-VISION](docs/superfans/00-VISION.md),
> [01-PRD](docs/superfans/01-PRD.md), [09-MONETIZATION](docs/superfans/09-MONETIZATION.md),
> and the [ROADMAP](docs/superfans/ROADMAP.md) before building features.

## Status: mid-pivot
This repo began as **SuperFans Pro** (a padel / fan-prize app) and is being
pivoted into Superfans. The existing systems (auth, profiles, gamification,
wallet, realtime, match results) are being **repurposed**, not thrown away — see
the reuse map in `docs/superfans/ROADMAP.md`. Expect old "padel/arena/venue"
naming to coexist with new "feed/match-hub/prediction" code during the transition.

## Hard product rules
- **No gambling. No real-money wagering. No odds/stakes.** Predictions are
  **reputation-based only**.
- When repurposing the wallet/credits/Xendit code, it's for **subscriptions and
  creator payouts** — never for bets.
- RLS enforced on every table — never expose cross-user data.
- Every decision should compound **network effects** (follows, communities, reputation).

## Stack (current)
- React 18 + TypeScript + **Vite** + React Router
- Supabase (auth, DB, edge functions, realtime)
- shadcn/ui + Tailwind CSS (mobile-first, dark mode)
- Xendit (payments) — being reframed for subscriptions/payouts
- Vitest for testing

> **Target stack (deferred):** Next.js (App Router) on Vercel + Cloudflare, plus an
> OpenAI-powered AI layer. We **stay on Vite for now**; the Next.js migration is a
> later milestone (see ROADMAP). Do not start migrating frameworks without sign-off.

## Architecture (current tree)
- `/src/components/fanprize/` — match/prediction experience (core to repurpose)
- `/src/components/arena/` — competition features
- `/src/components/wallet/` — credits/transactions → subscriptions/payouts
- `/src/components/profile/` — user profiles, claims
- `/src/components/ui/` — shadcn components (DO NOT manually edit)
- `/src/pages/` — route-level pages
- `/src/hooks/` — useAuth, useArena, useData, useRealtime, useVenue, useNotifications, useAdmin
- `/src/lib/` — gamification → reputation engine, utils
- `/src/data/` — constants + tests
- `/src/integrations/supabase/` — client + types
- `/supabase/functions/` — create-payment, notify-admin, send-notification-email, xendit-webhook
- `/supabase/migrations/` — DB schema
- `/remotion/` — video generation (separate package.json)

## Core domain (target)
- **Feed** — predictions, analysis, stats, opinions, videos from followed users/teams
- **Match Hub** — live scores, community + AI + creator predictions, discussions
- **Reputation Engine** — Accuracy / Influence / Trust / Community scores (extend `src/lib/gamification.ts`)
- **Creator Economy** — subscribers, premium content, private channels, prediction leagues
- **Communities** — team / league / creator communities
- **Leaderboards** — Global / Country / League / Club / Friends
- **Profiles** — followers, predictions, accuracy, reputation, badges, subscriptions

## Auth & Roles
- Supabase Auth. Roles: fan (player), creator (host), admin, super-admin.
- Admin panel at `/admin`, super-admin at `/super-admin`.

## Primary KPIs
Daily Active Users · Predictions Submitted · Creator Revenue · Subscriber Revenue ·
Community Retention · Match Engagement.

## Build & Test (MUST pass before PR)
```bash
npm run dev          # local dev
npm run build        # MUST pass before PR
npm run lint
npx tsc --noEmit
npx vitest run       # run tests
```

## Edge Functions (Deno)
- No Playwright/headless browser in Deno runtime.
- Xendit webhook handles payment callbacks; notification email via edge function.

## Testing
- Vitest setup in `/src/test/`; mock fixtures in `/src/test/mocks/`.
- Integration + page-level tests for major flows. Add tests for new prediction/feed logic.
