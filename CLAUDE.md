# Superfans — Operating Instructions for AI Agents

> **Superfans is a reputation-based sports social network — NOT a betting platform.**
> Fans compete through knowledge, build reputation, and become creators.
> Tagline: *Where Sports Fans Become Legends.* Mission: *turn every fan into a creator.*
>
> **Read the `/docs` system before building:** [00-VISION](docs/00-VISION.md) ·
> [01-PRD](docs/01-PRD.md) · [02-BUSINESS-MODEL](docs/02-BUSINESS-MODEL.md) ·
> [03-USER-FLOWS](docs/03-USER-FLOWS.md) · [04-SYSTEM-ARCHITECTURE](docs/04-SYSTEM-ARCHITECTURE.md) ·
> [05-DATABASE-SCHEMA](docs/05-DATABASE-SCHEMA.md) · [06-AI-SYSTEM](docs/06-AI-SYSTEM.md) ·
> [07-CREATOR_ECONOMY](docs/07-CREATOR_ECONOMY.md) · [08-GROWTH_LOOP](docs/08-GROWTH_LOOP.md) ·
> [09-MONETIZATION](docs/09-MONETIZATION.md) · [10-MVP_ROADMAP](docs/10-MVP_ROADMAP.md)

This file governs **all future Claude Code / AI-agent generations**. Follow it exactly.

## Status: mid-pivot
This repo began as **SuperFans Pro** (a padel/fan-prize app) and is being pivoted into
Superfans. Existing systems (auth, profiles, gamification, wallet, realtime, match
results) are **repurposed, not deleted** — see the reuse map in `10-MVP_ROADMAP.md`.
Old "padel/arena/venue" naming will coexist with new "feed/match-hub/prediction" code
during the transition; migrate incrementally and leave each area better than you found it.

---

## 1. Product philosophy (non-negotiable)
1. **Reputation over money.** Predictions are reputation-based. **No gambling, no real-money wagering, no odds-as-stakes — ever.** Wallet/credits/Xendit code is only for subscriptions & creator payouts.
2. **Mobile-first, always.** Design and test one-handed phone UX first.
3. **Every action feeds the network.** Predictions, follows, posts, communities must compound network effects.
4. **Fast & addictive.** Sub-second core loops; realtime where it matters.
5. **Truthful, un-fakeable reputation.** Scoring must be auditable and anti-gameable.
6. **Creators are first-class.** Build for the people who make the platform worth visiting.
7. **AI augments the fan**, never replaces their judgment.

## 2. Coding standards
- **TypeScript everywhere**, `strict` on. No `any` without a written reason; prefer precise types and discriminated unions.
- Match surrounding style; functional React components + hooks. Small, single-responsibility modules.
- Name by domain (`prediction`, `match`, `reputation`, `creator`) — not legacy padel terms in new code.
- Pure logic (scoring, reputation) lives in `/src/lib` and is unit-tested; keep it framework-free.
- Data fetching through TanStack Query hooks in `/src/hooks`; no ad-hoc fetches in components.
- No secrets in code. Use env vars; never commit `.env`.
- Lint/format clean: `npm run lint` and `npx tsc --noEmit` must pass.

## 3. Architecture standards
- **Modular monolith** with bounded domains (`04-SYSTEM-ARCHITECTURE.md`). Respect domain boundaries; don't cross-import internals.
- Transactional/money/reputation logic lives in Postgres **RPCs (SECURITY DEFINER)** or edge functions — never trusted from the client.
- Realtime via Supabase channels; heavy/async work is queue-backed and **idempotent**.
- Cache hot/derived reads (Redis/edge); don't hammer Postgres on hot paths.
- Stay on **Vite** until the roadmap's Phase 3 migration decision; don't introduce Next.js without sign-off.

## 4. UI standards
- shadcn/ui + Tailwind; **never hand-edit generated `src/components/ui/`**.
- **Dark mode is the default**; premium, modern, sports-first aesthetic. Framer Motion for tasteful motion.
- Mobile-first breakpoints; large tap targets; optimistic UI for predictions/follows/likes.
- Accessibility: WCAG 2.1 AA, full keyboard nav, semantic HTML, alt text.
- Loading = skeletons; handle empty/error states explicitly. Reuse design-system tokens, no magic colors.

## 5. Database standards
- Schema follows `05-DATABASE-SCHEMA.md`. **RLS enabled on every table, default deny.**
- Users write only rows they own; **money & reputation are never client-writable**.
- Every change is a **Supabase migration** in `/supabase/migrations` (never edit the DB by hand only).
- Money in minor units (`bigint`) + currency; never floats. UUID PKs; `created_at/updated_at`; soft-delete user content.
- Index hot queries; use materialized views for leaderboards; add FKs + checks for integrity.

## 6. Testing standards
- **Vitest.** Unit-test all `/src/lib` logic (reputation, scoring, resolution) — these are correctness-critical.
- Integration tests for core flows (prediction lifecycle, subscription/payout, reputation update).
- Page-level tests for major pages. New features ship **with tests**.
- `npx vitest run` must pass before any PR. Don't delete/weaken tests to go green — fix the cause.

## 7. Deployment standards
- Frontend on **Vercel**, edge/CDN via **Cloudflare**, backend on **Supabase**.
- **`npm run build` MUST pass before every PR.** Also run `npx tsc --noEmit`, `npm run lint`, `npx vitest run`.
- Migrations reviewed and applied deliberately; never destructive without backup/plan.
- Feature-flag risky changes (`feature_flags`); roll out by percentage.
- Develop on the assigned feature branch; open PRs ready-for-review; keep PRs scoped.

## 8. Security standards
- **RLS is the backbone** — never bypass it client-side. Validate authorization in policies/RPCs, not just UI.
- Webhooks (payments, sports feed) verify signatures; writes are idempotent via provider refs.
- Sensitive actions (payouts, role grants, resolution) via SECURITY DEFINER RPCs + **`audit_logs`**.
- Sanitize/escape all user content (XSS); parameterized queries only.
- Secrets in platform vaults. Least privilege everywhere. Rate-limit public/AI endpoints. GDPR-ready export/delete.

## 9. Performance standards
- p75 feed TTI < 2.5s on mid-tier mobile; prediction submit round-trip < 400ms; realtime propagation < 2s.
- Code-split routes; lazy-load heavy components; optimize images via storage/CDN.
- Avoid N+1 queries; paginate (cursor); precompute/cache AI and leaderboard results.
- Budget AI tokens (gate behind Pro/Elite); cache AI responses by data freshness.

## 10. Documentation standards
- `/docs` is the source of truth. **If behavior changes, update the relevant doc in the same PR.**
- Document non-obvious decisions and domain logic where the code lives (concise comments, matching existing density).
- Keep the reuse map and roadmap current as the pivot progresses.

## 11. Decision-making framework
For any non-trivial decision, ask in order:
1. **Does it serve the mission** (fans → creators) and **avoid gambling**? If not, stop.
2. **Does it compound network effects** (follows, communities, reputation, data)?
3. **Is it mobile-first, fast, and accessible?**
4. **Is reputation/money handled safely** (RLS, RPC, audit)?
5. **Is it the simplest thing that ships value this phase?** Prefer reuse over rebuild.
6. **Is it tested and documented?**
When blocked on a product/business judgment call, surface it — don't guess on irreversible choices.

## 12. Startup priorities (in order)
1. **Engagement / WPU** (Weekly Predicting Users — the North Star).
2. **Retention & habit** (D1/D7/D30).
3. **Virality / growth loops** (`08`).
4. **Creator supply & monetization** (`07`, `09`).
5. **Reliability & trust** (no data leaks, accurate reputation).
6. Enterprise/data (later phases).
Ship fast, but never at the cost of the no-gambling rule, RLS/security, or reputation integrity.

## 13. Rules for all future Claude Code generations
- **Always read `/docs` first**; align new work with the PRD, architecture, and schema.
- **Never** introduce wagering/gambling mechanics or real-money betting.
- **Never** hand-edit `src/components/ui/`; **never** weaken RLS; **never** make money/reputation client-writable.
- Prefer **repurposing existing systems** over greenfield rewrites.
- Every PR: build green, types clean, lint clean, tests pass and added, docs updated, scoped and on the correct branch.
- Use the current stack (Vite/React/TS/Tailwind/shadcn/Supabase). Get sign-off before framework changes (e.g. Next.js).
- Keep the model identifier and internal tooling notes out of commits, code, and PRs.

---

## Stack & commands
**Stack:** React 18 · TypeScript · Vite · React Router · TanStack Query · Tailwind · shadcn/ui · Framer Motion · Supabase (Auth/Postgres/Realtime/Storage/Edge) · Redis · Xendit (→ subscriptions/payouts) · OpenAI (AI layer) · Vercel · Cloudflare. *Next.js is the deferred north-star target.*

```bash
npm run dev          # local dev
npm run build        # MUST pass before PR
npm run lint
npx tsc --noEmit
npx vitest run       # run tests
```

**Edge functions (Deno):** no headless browser; webhooks verify signatures; AI calls via the single AI Gateway function.
