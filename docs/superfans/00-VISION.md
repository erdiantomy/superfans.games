# Superfans — Vision

> **Superfans is not a betting platform.**
> Superfans is a sports social network where fans compete, create, predict, and build reputation.

## Mission
Turn every sports fan into a creator.

## Vision
Become the world's largest sports intelligence network.

## What users can do
- Follow teams
- Follow leagues
- Follow creators
- Predict matches
- Publish analysis
- Build audiences
- Subscribe to experts
- Join communities
- Earn reputation

## Mental model
**Twitter + Reddit + Polymarket + Sofascore + Patreon.**

## Platform priorities
1. Mobile-first UX
2. Realtime sports data
3. AI-generated insights
4. Community participation
5. Creator monetization

## Hard constraints
- **No gambling.**
- **No real-money wagering.**
- Predictions are **reputation based**.

## Primary KPIs
- Daily Active Users
- Predictions Submitted
- Creator Revenue
- Subscriber Revenue
- Community Retention
- Match Engagement

## Design language
Premium · Modern · Sports-first · Dark mode · Fast · Addictive · Social

## Target tech stack (north star)
> The repo currently ships on **Vite + React Router** (see `CLAUDE.md`). The stack
> below is the long-term target; a Next.js migration is deferred, not abandoned.

- **Frontend:** Next.js · React · Tailwind · TypeScript · shadcn/ui
- **Backend:** Supabase · PostgreSQL · Edge Functions
- **AI:** OpenAI · Match Analysis Engine · Fan Sentiment Engine
- **Infrastructure:** Vercel · Supabase · Cloudflare

## Guiding principle
Every implementation decision must support long-term **network effects**.
