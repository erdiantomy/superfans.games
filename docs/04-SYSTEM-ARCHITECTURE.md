# 04 — System Architecture

Superfans runs a **Vite + React SPA/PWA** frontend against a **Supabase** backend
(PostgreSQL + Auth + Realtime + Storage + Edge Functions), fronted by **Cloudflare**
and deployed on **Vercel**, with **Redis** for caching/queues and **OpenAI** for the
AI layer. The architecture is modular-monolith-first with clearly bounded domains
that can be peeled into services as scale demands.

---

## Tech stack
**Frontend:** Vite · React 18 · TypeScript · Tailwind · shadcn/ui · Framer Motion · React Router · TanStack Query
**Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) · Redis · Deno edge runtime
**AI:** OpenAI (LLM) · embeddings · match analysis & sentiment services
**Infra:** Vercel (frontend host) · Cloudflare (CDN/WAF/edge cache) · Supabase (managed Postgres) · object storage

> Target stack remains Next.js long-term; we ship on Vite now (see `CLAUDE.md` / `10-MVP_ROADMAP.md`).

---

## 1. Frontend architecture
- **App shell + routing:** React Router; route-level code-splitting; PWA installable, offline shell for cached feed.
- **State/data:** TanStack Query for server state (caching, optimistic updates for predictions/follows); local UI state with React hooks/context. No heavy global store.
- **Design system:** Tailwind + shadcn/ui primitives (never hand-edit generated `ui/`), Framer Motion for transitions; dark mode default; mobile-first breakpoints.
- **Realtime:** Supabase Realtime subscriptions for scores, feed inserts, discussion, notifications.
- **Domain modules** (mirrors `/src/components`): `feed/`, `match/`, `prediction/`, `reputation/`, `community/`, `creator/`, `wallet/` (→ subscriptions), `profile/`, `notifications/`.
- **Resilience:** error boundaries per domain; skeleton/optimistic UI; graceful degradation if sports feed/AI is unavailable.

---

## 2. Backend architecture
- **Modular monolith on Postgres** with bounded domains enforced by schema + RLS. Each domain owns its tables and a thin service surface (RPC/edge function).
- **Edge Functions (Deno)** for: payment creation, webhooks (payments + sports feed), AI inference proxy, notification dispatch, prediction resolution, scheduled jobs.
- **Stateless compute** + Postgres as source of truth + Redis for hot reads/queues.

```
            ┌────────────────── Cloudflare (CDN / WAF / edge cache) ──────────────────┐
            │                                                                          │
   [ Mobile/Web PWA ]                                                                  │
        │  HTTPS                                                                       │
        ▼                                                                              │
   [ Vercel — Vite SPA static + edge ]                                                 │
        │  Supabase JS (REST/Realtime/Auth)                                            │
        ▼                                                                              │
   ┌──────────────────────────── Supabase ────────────────────────────┐               │
   │  Auth │ PostgREST API │ Realtime │ Storage │ Edge Functions (Deno) │◄──── Webhooks │
   │            │                                      │                │   (sports,    │
   │            ▼                                      ▼                │    payments)  │
   │      [ PostgreSQL + RLS ]  ◄───►  [ Redis cache/queue ]            │               │
   └───────────────────────────────────┬──────────────────────────────┘               │
                                        │                                              │
                         ┌──────────────┴───────────────┐                              │
                         ▼                              ▼                               │
              [ OpenAI / AI services ]        [ External sports data feed ]            │
              (previews, sentiment,            (live scores, fixtures)                  │
               ranking, embeddings)                                                     │
            └──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. API architecture
- **Primary:** Supabase auto-generated **PostgREST** for CRUD with RLS; **RPC (Postgres functions)** for transactional logic (resolve predictions, recompute reputation, process payout).
- **Edge HTTP endpoints** for webhooks, payments, AI proxy, and the future public **Enterprise API** (versioned `/v1`, API-key + rate-limited).
- **Conventions:** REST-ish resources, cursor pagination, idempotency keys on writes that touch money/reputation, consistent error envelope.

---

## 4. Microservices design (evolution path)
Start modular-monolith; extract along these seams when load/ownership justifies:
1. **Prediction & Reputation service** (write-heavy, transactional).
2. **AI service** (latency-isolated, GPU/inference scaling, independent deploy).
3. **Notification & Feed-fanout service** (fan-out, queue-backed).
4. **Ingestion service** (sports feed normalization).
5. **Enterprise API/Data service** (separate auth, rate limits, billing).

---

## 5. Data layer
- **PostgreSQL** is the system of record (schema in `05-DATABASE-SCHEMA.md`).
- **Partitioning** for high-volume tables (`predictions`, `posts`, `notifications`, `audit_logs`) by time/range as they grow.
- **Materialized views** for leaderboards & reputation aggregates, refreshed on resolution events.
- **Redis** for: hot match/feed caches, leaderboard reads, rate limiting, notification/fan-out queues, AI response cache.

---

## 6. Authentication
- **Supabase Auth**: OAuth (Google/Apple) + email/password + magic link. JWT sessions.
- Auth user → `profiles` row (1:1) created on signup via trigger.
- Short-lived access tokens + refresh; secure, httpOnly where applicable.

## 7. Authorization
- **Postgres RLS on every table** — the security backbone. Default deny; explicit policies per role.
- **Roles:** fan, creator, admin, super-admin (+ per-community roles: owner/mod/member).
- Sensitive mutations (payouts, role grants, resolution) only via SECURITY DEFINER RPCs with internal checks; never client-trusted.

---

## 8. Realtime systems
- Supabase Realtime (Postgres logical replication) for: live scores, match discussion, feed inserts, notification badges, leaderboard nudges.
- Channel strategy: per-match channels, per-user notification channel, community channels. Backpressure via server-side throttling on hot matches.

## 9. Caching
- **Cloudflare edge** for static assets + cacheable public pages (match pages SEO).
- **Redis** for hot/derived data (leaderboards, community split, AI results).
- **TanStack Query** client cache w/ stale-while-revalidate; optimistic updates for predictions/follows/likes.

## 10. Search engine
- Phase 1: Postgres full-text + trigram for users/teams/communities.
- Phase 2+: dedicated search (e.g. Meilisearch/Typesense or pg + embeddings) for semantic discovery of creators, posts, and matches; vector search via `pgvector` for "find analysts like…".

## 11. Notification engine
- Event-driven: DB triggers / resolution jobs enqueue notifications → dispatch service evaluates prefs + **AI send-time optimization** → fan-out to in-app / web push / email digest. Idempotent, deduped, batched.

## 12. Analytics pipeline
- Product events streamed to an analytics sink (warehouse) for funnels, retention, NSM (WPU), growth dashboards.
- Outcome-labeled prediction data feeds the **AI training/eval loop** and the **enterprise data layer** (aggregated/anonymized only).

---

## 13. Scalability design
- Stateless edge compute scales horizontally; Postgres scales via read replicas, partitioning, and connection pooling (pgbouncer).
- Hot paths (feed, leaderboards, match split) served from Redis/edge, not raw Postgres.
- Heavy/async work (resolution, fan-out, AI) is queue-backed and idempotent.
- Designed to hit 1M MAU / 100k predictions-per-day before service extraction is required.

## 14. Infrastructure diagram (deploy view)
```
 Users ─► Cloudflare (DNS/WAF/CDN) ─► Vercel (Vite SPA + edge fns)
                                        │
                                        ├─► Supabase (Postgres/Auth/Realtime/Storage/Edge)
                                        │        ├─► Redis (cache/queue)
                                        │        ├─► Object storage (media)
                                        │        ├─► OpenAI / AI services
                                        │        └─► Sports data feed (webhooks/poll)
                                        └─► Analytics warehouse ─► Growth dashboards
```

## 15. Observability & security baseline
- Logging/metrics/tracing on edge functions + DB; alerting on error rate, latency, queue depth.
- Secrets in platform vaults (never in repo). WAF + rate limits at Cloudflare. RLS + least-privilege everywhere. See `CLAUDE.md` security standards.
