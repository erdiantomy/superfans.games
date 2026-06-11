# Deployment — Superfans (live)

## Live URLs
- **App (live, public):** https://superfanspro.vercel.app
- **Brand domain:** https://superfans.games — *currently still points (via Cloudflare, DNS `185.158.133.1`) to the old build, not Vercel.* To serve the new app here, repoint the `superfans.games` DNS to this Vercel project (CNAME → `cname.vercel-dns.com`, or disable the Cloudflare proxy / purge cache). The domain is already verified on the Vercel project.

## Backend — Supabase project `qsgwtjcrgedjbjsbibxr`
- **Schema:** additive `sf_*` tables (`sf_leagues, sf_teams, sf_matches, sf_predictions, sf_reputation, sf_follows, sf_posts, sf_post_likes`) + `sf_leaderboard` view. RLS on every table. Coexists with the legacy padel schema. Migration: `supabase/migrations/20260611120000_superfans_football.sql`.
- **Auto-resolution:** finished matches resolve predictions and recompute reputation via DB triggers/functions (`sf_resolve_match`, `sf_recompute_reputation`, `sf_on_match_finished`).
- **Edge functions:**
  - `sync-football` — ingests fixtures/results from **TheSportsDB** (free key `3`) for the FIFA World Cup 2026 + top-5 leagues + UCL. Token-gated (`?token=` / `x-sync-token`, default `superfans-sync`).
  - `app` — serves the SPA `index.html` as `text/html` (used only for the Supabase-Storage fallback host).
  - `deploy-asset` — token-gated service-role uploader for the Storage fallback host.
- **Auto-refresh (self-updating content):** pg_cron job `sync-football-10min` calls `sync-football` every 10 minutes via `pg_net`. Verify: `select * from cron.job;`

## Frontend — Vercel project `superfanspro` (team `erdiantomys-projects`)
- Stack: Vite + React + TypeScript + Tailwind + shadcn (see `src/superfans/`).
- Env (public, committed in `.env.production` and set in the Vercel project): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`.
- SPA routing via `vercel.json` rewrites (BrowserRouter). `VITE_HASH_ROUTER=1` switches to HashRouter for static hosts.

### Redeploying the frontend
The repo's **git `main` is still the old padel app**, and the Vercel project is git-connected, so a plain git push to main would publish padel. Until `main` is updated, deploy this branch's build explicitly:

```bash
# from repo root, with a Vercel token
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

> Vercel's Hobby plan requires the git commit **author** to be a team member, so deploy commits must be authored by the project owner's email.

To make normal git deploys publish Superfans, merge `claude/superfans-platform-build-u2mmop` → `main` (or set it as the project's Production Branch).

## Security follow-ups (recommended)
- **Rotate the sync token:** set a strong `SYNC_TOKEN` secret on the `sync-football` / `deploy-asset` functions and update the pg_cron job header (currently the default `superfans-sync`).
- Consider scoping/removing the `deploy-asset` + `app` functions and the `site` Storage bucket once the Vercel host is the sole frontend (they exist only as a fallback).
- Review Supabase advisors after schema changes: security + performance.
