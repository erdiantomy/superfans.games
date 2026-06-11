# Superfans — Build Roadmap

A phased plan to pivot the current **SuperFans Pro** (padel/fan-prize) app into
**Superfans**, the sports social network. We **stay on Vite + React Router** for
now; a Next.js migration is tracked as a later milestone.

## Reuse map — what the current codebase gives us
The pivot is not a greenfield rebuild. Existing systems map cleanly onto the new domain:

| Existing system | Reused as |
| --- | --- |
| Supabase Auth + roles (player/host/admin) | Accounts + roles (fan / creator / admin) |
| Player profiles + slug routing (`/profile/...`) | User profiles (followers, accuracy, badges) |
| XP / gamification (`src/lib/gamification.ts`) | Reputation Engine (Accuracy/Influence/Trust/Community) |
| Wallet / credits / Xendit payments | Subscriptions + creator payouts (Phase 3) |
| Supabase Realtime | Live scores, live feed, live predictions |
| Match results / fan prizes | Match Hub + prediction resolution |
| Admin / super-admin panels | Moderation + content/community admin |

## Domain rename guardrails
- "Betting / wagering / odds / stake" → **prediction / pick / confidence**.
- Predictions are **reputation-based only**. No real-money wagering anywhere.
- Credits/wallet are repurposed for **subscriptions & creator payouts**, never bets.

## Phase 0 — Foundation (docs + direction) ✅ in progress
- Capture Vision / PRD / Monetization in `docs/superfans/`.
- Rewrite `CLAUDE.md` to the Superfans pivot.
- No app code yet.

## Phase 1 — Core social loop (MVP)
1. **Data model:** `teams`, `leagues`, `matches`, `predictions`, `follows`, `posts`.
2. **Match Hub:** match list + match detail with live score, community prediction split.
3. **Predictions:** submit a reputation-based pick on a match; resolve on final score.
4. **Profiles:** followers, prediction history, accuracy score, badges.
5. **Reputation Engine v1:** Accuracy Score from resolved predictions (extend gamification.ts).
6. **Feed v1:** chronological posts + predictions from followed users/teams.

## Phase 2 — Engagement & AI
- Leaderboards: Global / Country / League / Club / Friends.
- Discussions on matches; reactions; notifications.
- **AI Layer:** match previews, team analysis, confidence scores (OpenAI edge function).
- Mobile-first polish, dark-mode design system.

## Phase 3 — Creator economy & monetization
- Communities (team / league / creator).
- Subscriptions (Pro $9/mo) + creator premium channels (20% platform fee).
- Reframe wallet/Xendit flows for subscriptions & payouts.

## Phase 4 — Network / data
- Prediction, Fan Sentiment, Community Analytics APIs.
- Enterprise surfaces.

## Deferred — Next.js migration
Target stack is Next.js (App Router) on Vercel. Revisit once Phase 1–2 features
are stable; migrate incrementally rather than big-bang.

## Conventions
- Build must pass before any PR: `npm run build`, `npx tsc --noEmit`, `npx vitest run`.
- RLS enforced on every new table; never expose cross-user data.
- Every decision should compound **network effects** (follows, communities, reputation).
