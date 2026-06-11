# 05 — Database Schema

PostgreSQL (Supabase). Every table has **Row Level Security enabled** with default-deny
and explicit policies. Conventions:

- PK `id uuid default gen_random_uuid()` unless noted.
- `created_at timestamptz not null default now()`, `updated_at timestamptz` (trigger-maintained).
- Soft delete via `deleted_at timestamptz null` on user-content tables.
- FKs `on delete cascade` for ownership, `on delete set null` for references.
- Money in **minor units** (`bigint`, e.g. cents) + `currency char(3)`. Never floats for money.
- Enums implemented as Postgres `enum` types or `text` + `check`.

---

## ERD (textual)
```
auth.users 1─1 profiles
profiles 1─1 reputation_scores
profiles 1─* predictions *─1 matches *─1 leagues *─1 (none)
matches *─1 teams (home) , *─1 teams (away) , *─1 leagues
predictions 1─1 prediction_results
profiles *─* follows *─* (profiles | teams | leagues | communities)  [polymorphic target]
profiles 1─* posts *─* comments , *─* likes
communities 1─* posts ; communities *─* memberships *─1 profiles
profiles(creator) 1─* creator_channels 1─* subscriptions *─1 profiles(subscriber)
subscriptions 1─* payments
profiles 1─* notifications
profiles *─* badges (user_badges) ; profiles *─* achievements (user_achievements)
* ─ audit_logs (polymorphic) ; feature_flags (global/targeted)
```

---

## Tables

### users (`auth.users`)
Managed by Supabase Auth (email, provider, encrypted credentials, timestamps). We never write here directly; `profiles` extends it.

### profiles
Public identity for every user.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | = `auth.users.id` |
| username | citext unique not null | handle, 3–20 chars, `check (~ '^[a-z0-9_]+$')` |
| display_name | text not null | |
| slug | citext unique not null | URL slug |
| avatar_url | text | |
| banner_url | text | |
| bio | text | ≤ 280 chars |
| country_code | char(2) | ISO-3166 |
| role | user_role not null default 'fan' | enum: fan, creator, admin, super_admin |
| is_verified | boolean not null default false | |
| favorite_team_id | uuid FK→teams | nullable |
| follower_count | integer not null default 0 | denormalized |
| following_count | integer not null default 0 | denormalized |
| is_private | boolean not null default false | |
| onboarding_completed | boolean not null default false | |
| created_at / updated_at / deleted_at | timestamptz | |
**Indexes:** unique(username), unique(slug), btree(role), btree(country_code).
**RLS:** select public (non-deleted); update only `id = auth.uid()`; insert via signup trigger.

### reputation_scores
One row per profile; the status engine output.
| Column | Type | Notes |
| --- | --- | --- |
| profile_id | uuid PK FK→profiles | |
| accuracy_score | numeric(6,2) not null default 0 | weighted % correct, confidence-adjusted |
| influence_score | numeric(8,2) not null default 0 | reach × engagement |
| trust_score | numeric(6,2) not null default 0 | consistency, anti-gaming |
| community_score | numeric(8,2) not null default 0 | participation/helpfulness |
| total_predictions | integer not null default 0 | |
| correct_predictions | integer not null default 0 | |
| current_streak | integer not null default 0 | |
| best_streak | integer not null default 0 | |
| tier | text not null default 'rookie' | rookie→legend |
| recomputed_at | timestamptz | |
**Indexes:** btree(accuracy_score desc), btree(influence_score desc), btree(tier).
**RLS:** select public; write only via SECURITY DEFINER reputation RPC.

### leagues
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| sport | sport_type not null | enum: football, basketball, cricket, … |
| name | text not null | |
| slug | citext unique not null | |
| country_code | char(2) | |
| logo_url | text | |
| external_ref | text | provider id for ingestion |
| season | text | current season label |
**Indexes:** unique(slug), btree(sport), unique(external_ref).
**RLS:** select public; write admin only.

### teams
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| league_id | uuid FK→leagues | nullable (club may span comps) |
| sport | sport_type not null | |
| name | text not null | |
| slug | citext unique not null | |
| short_name | text | |
| logo_url | text | |
| country_code | char(2) | |
| external_ref | text unique | provider id |
**Indexes:** unique(slug), btree(league_id), unique(external_ref).
**RLS:** select public; write admin only.

### matches
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| league_id | uuid FK→leagues not null | |
| home_team_id | uuid FK→teams not null | |
| away_team_id | uuid FK→teams not null | |
| status | match_status not null default 'scheduled' | enum: scheduled, live, finished, postponed, cancelled |
| kickoff_at | timestamptz not null | predictions lock at this time |
| home_score | integer | null until played |
| away_score | integer | |
| minute | integer | live clock |
| winner | match_winner | enum: home, away, draw, null |
| external_ref | text unique | provider id |
| finalized_at | timestamptz | triggers resolution |
**Indexes:** btree(kickoff_at), btree(status), btree(league_id, kickoff_at), unique(external_ref).
**RLS:** select public; write ingestion service only.

### predictions
The core action. Immutable after lock.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| profile_id | uuid FK→profiles not null | |
| match_id | uuid FK→matches not null | |
| predicted_outcome | match_winner not null | home/away/draw |
| predicted_home_score | integer | optional exact-score |
| predicted_away_score | integer | |
| confidence | smallint not null default 50 | 1–100, `check between 1 and 100` |
| status | prediction_status not null default 'pending' | pending, locked, correct, incorrect, void |
| locked_at | timestamptz | set at kickoff |
| points_awarded | numeric(6,2) | filled on resolution |
| created_at | timestamptz | |
**Constraints:** unique(profile_id, match_id) — one prediction per user per match.
**Indexes:** btree(match_id), btree(profile_id, created_at desc), btree(status).
**RLS:** select public; insert only `profile_id = auth.uid()` AND match still open; **no update/delete by users** (resolution via RPC only).

### prediction_results
Resolution detail (1:1 with prediction), separated for audit clarity.
| Column | Type | Notes |
| --- | --- | --- |
| prediction_id | uuid PK FK→predictions | |
| is_correct | boolean not null | |
| outcome_correct | boolean not null | |
| exact_score_correct | boolean not null default false | |
| base_points | numeric(6,2) not null | |
| confidence_multiplier | numeric(4,2) not null | |
| final_points | numeric(6,2) not null | |
| resolved_at | timestamptz not null default now() | |
**RLS:** select public; write resolution RPC only.

### follows
Polymorphic follow graph.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| follower_id | uuid FK→profiles not null | |
| target_type | follow_target not null | enum: profile, team, league, community |
| target_id | uuid not null | |
| created_at | timestamptz | |
**Constraints:** unique(follower_id, target_type, target_id); `check (not(target_type='profile' and target_id=follower_id))`.
**Indexes:** btree(target_type, target_id), btree(follower_id).
**RLS:** select public; insert/delete only `follower_id = auth.uid()`.

### communities
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| owner_id | uuid FK→profiles not null | |
| type | community_type not null | enum: team, league, creator, topic |
| name | text not null | |
| slug | citext unique not null | |
| description | text | |
| banner_url | text | |
| linked_team_id | uuid FK→teams | nullable |
| linked_league_id | uuid FK→leagues | nullable |
| is_private | boolean not null default false | |
| member_count | integer not null default 0 | |
| rules | jsonb | |
**Indexes:** unique(slug), btree(type), btree(owner_id).
**RLS:** select public (or member-only if private); insert by eligible users; update by owner/mods.

### community_memberships
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| community_id | uuid FK→communities not null | |
| profile_id | uuid FK→profiles not null | |
| role | community_role not null default 'member' | enum: owner, mod, member |
| joined_at | timestamptz | |
**Constraints:** unique(community_id, profile_id).
**RLS:** select public/member; insert self; role changes by owner/mod RPC.

### posts
Feed content (analysis, opinion, video, prediction-attached).
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| author_id | uuid FK→profiles not null | |
| community_id | uuid FK→communities | nullable (global feed if null) |
| match_id | uuid FK→matches | nullable (match-attached) |
| prediction_id | uuid FK→predictions | nullable |
| type | post_type not null default 'text' | text, analysis, video, image, prediction |
| body | text | |
| media_urls | text[] | |
| is_premium | boolean not null default false | gated to subscribers |
| like_count | integer not null default 0 | |
| comment_count | integer not null default 0 | |
| created_at / updated_at / deleted_at | timestamptz | |
**Indexes:** btree(author_id, created_at desc), btree(community_id, created_at desc), btree(match_id), GIN(to_tsvector(body)).
**RLS:** select public unless `is_premium` (then subscriber/owner) or private community member; insert/update/delete by author.

### comments
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| post_id | uuid FK→posts not null | |
| author_id | uuid FK→profiles not null | |
| parent_id | uuid FK→comments | threaded replies |
| body | text not null | |
| like_count | integer not null default 0 | |
| created_at / deleted_at | timestamptz | |
**Indexes:** btree(post_id, created_at), btree(parent_id).
**RLS:** select with parent post visibility; write by author.

### likes
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| profile_id | uuid FK→profiles not null | |
| target_type | like_target not null | enum: post, comment |
| target_id | uuid not null | |
| created_at | timestamptz | |
**Constraints:** unique(profile_id, target_type, target_id).
**Indexes:** btree(target_type, target_id).
**RLS:** select public; insert/delete self.

### creator_channels
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| creator_id | uuid FK→profiles not null | |
| name | text not null | |
| slug | citext unique not null | |
| description | text | |
| tier_name | text not null default 'Pro' | |
| price_minor | bigint not null | per-period price |
| currency | char(3) not null default 'USD' | |
| billing_period | billing_period not null default 'monthly' | monthly, yearly |
| is_active | boolean not null default true | |
| subscriber_count | integer not null default 0 | |
**Indexes:** unique(slug), btree(creator_id).
**RLS:** select public; write by creator owner.

### subscriptions
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| subscriber_id | uuid FK→profiles not null | |
| channel_id | uuid FK→creator_channels | null = platform Pro/Elite |
| plan | sub_plan not null | free, pro, elite, creator |
| status | sub_status not null default 'active' | active, past_due, canceled, expired |
| current_period_end | timestamptz not null | access cutoff |
| cancel_at_period_end | boolean not null default false | |
| provider | text | xendit/stripe |
| provider_ref | text | |
| created_at / updated_at | timestamptz | |
**Constraints:** unique(subscriber_id, channel_id) where active.
**Indexes:** btree(subscriber_id), btree(channel_id), btree(status, current_period_end).
**RLS:** select self + creator-of-channel; write via billing RPC/webhook only.

### payments
Immutable financial ledger.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| payer_id | uuid FK→profiles not null | |
| subscription_id | uuid FK→subscriptions | nullable |
| channel_id | uuid FK→creator_channels | nullable |
| gross_minor | bigint not null | |
| platform_fee_minor | bigint not null | 20% for creator |
| net_to_creator_minor | bigint not null default 0 | |
| currency | char(3) not null | |
| status | payment_status not null | pending, succeeded, failed, refunded |
| provider | text not null | |
| provider_ref | text unique | idempotency |
| created_at | timestamptz | |
**Indexes:** unique(provider_ref), btree(payer_id), btree(channel_id, created_at).
**RLS:** select self/creator/admin; **insert/update via webhook RPC only** (never client).

### notifications
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| recipient_id | uuid FK→profiles not null | |
| type | notif_type not null | prediction_resolved, new_follower, creator_post, match_starting, … |
| actor_id | uuid FK→profiles | nullable |
| entity_type | text | polymorphic context |
| entity_id | uuid | |
| payload | jsonb | render data |
| channels | text[] not null default '{in_app}' | in_app, push, email |
| is_read | boolean not null default false | |
| created_at | timestamptz | |
**Indexes:** btree(recipient_id, is_read, created_at desc).
**RLS:** select/update (read flag) only `recipient_id = auth.uid()`; insert service only.

### badges
Catalog of earnable badges.
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| key | text unique not null | stable id |
| name | text not null | |
| description | text | |
| icon_url | text | |
| rarity | text not null default 'common' | common→legendary |
| criteria | jsonb | machine-checkable rule |
**RLS:** select public; write admin.

### user_badges
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | profile_id+badge_id unique |
| profile_id | uuid FK→profiles | |
| badge_id | uuid FK→badges | |
| awarded_at | timestamptz | |
**RLS:** select public; write via award RPC.

### achievements
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| key | text unique not null | |
| name | text not null | |
| description | text | |
| tier | text | bronze/silver/gold |
| target | integer | progress target |
| reward | jsonb | xp/badge/perk |
**RLS:** select public; write admin.

### user_achievements
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | unique(profile_id, achievement_id) |
| profile_id | uuid FK→profiles | |
| achievement_id | uuid FK→achievements | |
| progress | integer not null default 0 | |
| completed_at | timestamptz | null until done |
**RLS:** select public; write via progression RPC.

### audit_logs
Append-only security/compliance trail (polymorphic).
| Column | Type | Notes |
| --- | --- | --- |
| id | bigint identity PK | |
| actor_id | uuid FK→profiles | nullable (system) |
| action | text not null | e.g. payout.create, role.grant |
| entity_type | text not null | |
| entity_id | uuid | |
| before | jsonb | |
| after | jsonb | |
| ip | inet | |
| created_at | timestamptz | |
**Indexes:** btree(entity_type, entity_id), btree(actor_id, created_at), brin(created_at).
**RLS:** select admin/super_admin only; insert service only; no update/delete.

### feature_flags
| Column | Type | Notes |
| --- | --- | --- |
| key | text PK | flag name |
| description | text | |
| is_enabled | boolean not null default false | global default |
| rollout_percent | smallint not null default 0 | 0–100 |
| targeting | jsonb | rules (role, country, cohort) |
| updated_at | timestamptz | |
**RLS:** select public (read flags); write admin only.

---

## Key indexes & performance notes
- Hot leaderboard reads served from **materialized views** on `reputation_scores` (global/country/league), refreshed on resolution; cached in Redis.
- `predictions` and `posts` partitioned by month at scale; BRIN on `created_at`.
- Denormalized counters (`follower_count`, `like_count`, `member_count`) maintained by triggers, reconciled by nightly job.
- `pgvector` extension for creator/post embeddings (semantic discovery) — Phase 2.

## RLS policy principles (apply to all tables)
1. **Default deny.** Enable RLS; add explicit policies.
2. **Ownership writes.** Users mutate only rows where `auth.uid()` owns them.
3. **Money & reputation never client-writable.** Only SECURITY DEFINER RPCs / webhooks.
4. **Premium gating** enforced in policy, not just UI.
5. **Admin scope** via `role` claim checks, audited in `audit_logs`.
