# Superfans — Documentation

**Superfans is a reputation-based sports social network — not a betting platform.**
Fans compete through knowledge, build reputation, and become creators.
*Where Sports Fans Become Legends.*

This `/docs` system is the single source of truth for product, business, and
engineering. Read it before building. Operating rules for AI agents live in the
root [`CLAUDE.md`](../CLAUDE.md).

## Index
| File | What it covers |
| --- | --- |
| [00-VISION.md](00-VISION.md) | Mission, vision, narrative, moat, market, investor story |
| [01-PRD.md](01-PRD.md) | Personas, JTBD, features, requirements, NSM, MVP scope |
| [02-BUSINESS-MODEL.md](02-BUSINESS-MODEL.md) | Revenue streams, flywheel, TAM/SAM/SOM, unit economics |
| [03-USER-FLOWS.md](03-USER-FLOWS.md) | Signup → onboarding → predict → subscribe → retain flows |
| [04-SYSTEM-ARCHITECTURE.md](04-SYSTEM-ARCHITECTURE.md) | Frontend/backend/API/realtime/scaling, infra diagram |
| [05-DATABASE-SCHEMA.md](05-DATABASE-SCHEMA.md) | All tables, columns, relationships, indexes, RLS |
| [06-AI-SYSTEM.md](06-AI-SYSTEM.md) | AI surfaces, gateway, models, eval, feedback loops |
| [07-CREATOR_ECONOMY.md](07-CREATOR_ECONOMY.md) | Creator lifecycle, tiers, payouts, incentives |
| [08-GROWTH_LOOP.md](08-GROWTH_LOOP.md) | Acquisition/content/referral/retention loops, metrics |
| [09-MONETIZATION.md](09-MONETIZATION.md) | Free/Pro/Elite, creator subs, enterprise, 5yr forecast |
| [10-MVP_ROADMAP.md](10-MVP_ROADMAP.md) | Phases 1–5, team, milestones, risks, budget, reuse map |

## North Star
**Weekly Predicting Users (WPU).** Targets (12 mo): 100k MAU · 10k daily predictions · 1k paying subscribers · 100 active creators.

## Hard rules
- No gambling. No real-money wagering. Predictions are reputation-based.
- RLS on every table; money & reputation never client-writable.
- Mobile-first, dark mode, fast, accessible.
- Every decision compounds network effects.

> `SuperFans-Platform-Manual.pdf` is legacy (the pre-pivot padel product) and kept for reference only.
