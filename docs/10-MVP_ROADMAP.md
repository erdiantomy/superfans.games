# 10 — MVP Roadmap

Five phases from MVP to data network. We **stay on Vite** for Phases 1–2; the Next.js
migration is evaluated at Phase 3 (see `CLAUDE.md`). The current codebase
(auth, profiles, gamification, wallet, realtime, match results) is **repurposed**, not
rebuilt — see the reuse map below.

### Reuse map (current → Superfans)
| Existing | Reused as |
| --- | --- |
| Supabase Auth + roles | Accounts (fan/creator/admin) |
| Player profiles + slug routing | User profiles (followers, accuracy, badges) |
| XP/gamification (`src/lib/gamification.ts`) | Reputation Engine |
| Wallet/credits/Xendit | Subscriptions + creator payouts |
| Supabase Realtime | Live scores, feed, discussion |
| Match results / fan prizes | Match Hub + prediction resolution |
| Admin/super-admin panels | Moderation + community admin |

---

## Phase 1 — MVP (Core social loop)
**Goal:** the most fun way to predict & discuss matches. Win the daily habit.
**Features:** sports/leagues/teams/matches ingestion; Match Hub (live score, community split); Prediction Engine (submit→lock→resolve→score); Reputation v1 (Accuracy); Profiles (followers, history, badges); Social Feed; Follows; mobile-first dark UI; auth/onboarding.
**Out:** payments, AI layer, communities, enterprise.
**Resources:** 2 FE, 2 BE/full-stack, 1 designer, 1 PM (founder-led).
**Timeline:** ~10–12 weeks.
**Milestones:** M1 data model + ingestion; M2 predictions + resolution; M3 feed + profiles + reputation; M4 onboarding + polish + beta launch.
**Success:** activation (first prediction in session 1) > 40%; D7 retention > 20%; WPU growing WoW.

## Phase 2 — Growth (Engagement & AI)
**Goal:** retention + virality. Make it addictive.
**Features:** Leaderboards (global/country/league/club/friends); AI Layer (previews, confidence, sentiment) behind Pro teaser; Notifications (realtime + digest + AI send-time); match discussions at scale; shareable prediction cards; SEO match pages; Communities v1.
**Resources:** +1 FE, +1 AI/ML, +1 growth.
**Timeline:** ~Q2–Q3 (12–16 weeks).
**Milestones:** AI gateway live; leaderboards + materialized views; notification engine; viral share loop; SEO pages indexed.
**Success:** WPU 50k+; K-factor > 0.4; D30 retention > 15%.

## Phase 3 — Creator Economy
**Goal:** monetization. Turn fans into paid creators.
**Features:** Pro/Elite subscriptions; creator channels + premium content; payments & payouts (reframe wallet/Xendit, 80/20); private groups; creator analytics; verification; communities v2.
**Decision point:** evaluate **Next.js migration** (SEO/SSR needs) — migrate incrementally if justified.
**Resources:** +1 payments/BE, +1 creator-success, +1 designer.
**Timeline:** ~Q4 (12–16 weeks).
**Milestones:** billing + payout ledger; 100 active creators; first $ creator GMV; Pro conversion live.
**Success:** 1,000 paying subscribers; 100 active creators; Pro conv 3%+.

## Phase 4 — Enterprise
**Goal:** high-margin B2B.
**Features:** Prediction API, Fan Sentiment API, Community Analytics API; partner dashboards; SLAs, API keys, rate limits, billing; sentiment indices.
**Resources:** +1 platform/API, +1 data eng, +1 enterprise sales/partnerships.
**Timeline:** ~2 quarters.
**Milestones:** public `/v1` API; first 3 enterprise pilots; sentiment dashboard product.
**Success:** $1M+ enterprise ARR pipeline; 3 paying enterprise customers.

## Phase 5 — Data Network
**Goal:** the moat compounds — Bloomberg for Sports Attention.
**Features:** large-scale data licensing; white-label fan engagement; advanced sports intelligence products; international expansion.
**Resources:** dedicated data, ML, BD, and platform teams.
**Timeline:** ongoing.
**Milestones:** licensing deals; white-label launches; multi-region scale.
**Success:** data/enterprise as a primary, high-margin revenue line; durable category leadership.

---

## Team structure (scaling)
- **Phase 1:** founders + ~6 (2 FE, 2 BE, 1 design, 1 PM).
- **Phase 2:** ~10 (add AI/ML, growth, FE).
- **Phase 3:** ~15 (add payments, creator-success, design).
- **Phase 4–5:** ~25+ (platform/API, data eng, enterprise sales, BD).
Pods by domain (Prediction/Reputation, Feed/Social, Creator/Payments, AI, Growth, Platform/Data).

## Risk assessment
| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Sports data feed cost/reliability | Med | High | Multi-provider, cache, graceful degradation |
| "Looks like gambling" perception/regulation | Med | High | Zero wagering by design; clear positioning; legal review |
| Cold-start (empty feed/communities) | High | High | Pre-seed follows, AI content, creator import |
| Creator flight | Med | Med | Reputation lock-in, tiered take, incentives |
| AI cost runaway | Med | Med | Gateway budgets, caching, premium gating |
| Scaling Postgres | Med | Med | Partitioning, replicas, Redis, service extraction |
| Trust/anti-gaming of reputation | Med | High | Trust score, anti-Sybil, audit logs |

## Budget estimate (directional, to ~18 months / Phases 1–3)
| Category | Est. |
| --- | --- |
| Team (blended, ~10 avg) | $2.5–4.0M |
| Infra (Supabase/Vercel/Cloudflare/Redis) | $150–400k |
| AI/OpenAI | $100–300k |
| Sports data feeds | $100–250k |
| Growth/marketing | $300–800k |
| Legal/compliance/ops | $150–300k |
| **Total (seed → Series A runway)** | **~$3.3–6.0M** |

Aligns with a seed raise to reach Phase 3 monetization proof and Series A metrics (100k+ MAU, paying subs, active creators).
