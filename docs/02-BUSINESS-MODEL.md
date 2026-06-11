# 02 — Business Model

**Superfans** monetizes three expanding layers — **Consumer → Creator → Enterprise** — on top of a free, viral engagement core. No gambling revenue, ever.

---

## 1. Revenue streams

| # | Stream | Layer | When | Mechanic |
| --- | --- | --- | --- | --- |
| R1 | Ads & sponsored content | Consumer | Phase 1+ | Sponsored predictions, communities, feed units |
| R2 | Pro subscription ($9/mo) | Consumer | Phase 2 | AI predictions, premium stats, advanced leaderboards |
| R3 | Elite subscription ($29/mo) | Consumer | Phase 2 | Everything in Pro + API-lite, historical exports, priority |
| R4 | Creator subscriptions (20% take) | Creator | Phase 3 | Fans pay creators; platform keeps 20% of net |
| R5 | Enterprise APIs | Enterprise | Phase 4 | Prediction, Fan Sentiment, Community Analytics APIs |
| R6 | Data licensing | Enterprise | Phase 5 | Aggregated, anonymized sentiment/prediction datasets |
| R7 | White-label | Enterprise | Phase 5 | Branded fan engagement for clubs/media |

Revenue diversification de-risks the model: consumer subs fund growth, creator take scales with the network, enterprise/data carries the highest margin.

---

## 2. Business flywheel
```
   Free, AI-enhanced prediction product
                 │
                 ▼
        More fans predict & follow  ◄───────────────┐
                 │                                   │
                 ▼                                   │
   Richer feed, communities, reputation             │
                 │                                   │
                 ▼                                   │
     Creators arrive chasing audience               │
                 │                                   │
                 ▼                                   │
   Creators monetize → platform earns 20%           │
                 │                                   │
                 ▼                                   │
  More prediction & sentiment data captured         │
                 │                                   │
                 ▼                                   │
  Better AI + insight + enterprise/data revenue ────┘
   (funds growth, improves product, attracts fans)
```
Each turn lowers CAC (virality/SEO), raises LTV (subscriptions + creator take), and deepens the data moat.

---

## 3. Market size

**TAM** — global sports fans (~3.5B) × digital sports engagement, creator economy, and sports data spend.
- Sports media/engagement: hundreds of millions of monetizable fans.
- Creator economy: $250B+ globally, no sports-native vertical leader.
- Sports data/intelligence: multi-$B (books, media, clubs).
- **Estimated TAM: $80–120B/yr** across engagement + creator + data.

**SAM** — English-first, mobile, high-engagement football/basketball/cricket fans in monetizable regions with creator + subscription willingness. **~$8–12B/yr.**

**SOM (3 yr)** — realistic capture: a few million MAU, low-single-digit % paid conversion, early enterprise pilots. **~$50–150M/yr revenue potential at maturity of the wedge.**

> These are planning estimates for prioritization, not audited figures.

---

## 4. Unit economics (illustrative, Phase 2 steady-state)

**Consumer subscriber**
- ARPU (Pro $9 blended w/ Elite): **~$11/mo → $132/yr**
- Gross margin: **~85%** (infra + payment fees ~15%)
- Avg. retention: **18 months** → **LTV ≈ $132 × 1.5 × 0.85 ≈ $168**
- Blended CAC (virality-led + paid): **~$15–30**
- **LTV:CAC ≈ 6–11×**; CAC payback **< 3 months**

**Creator-driven**
- Platform earns 20% of creator GMV. A creator doing $1,000/mo nets the platform **$200/mo** at ~95% margin (payment fees only), with **near-zero CAC** (creators bring their own audience).

**Why margins are high:** Supabase/Vercel/Cloudflare infra scales sub-linearly with users; the costly input (analysis/content) is produced by users and creators, not us.

---

## 5. Platform economics
- **Marginal cost per active user** trends toward fractions of a cent (serverless + edge caching + realtime fan-out).
- **Content cost = $0** (user-generated). **AI cost** is the main variable cost; gated behind Pro/Elite so heavy AI users pay for it.
- **Take-rate model** (creator 20%) means revenue grows with the network without us underwriting payouts.

---

## 6. Subscription economics
- Free → Pro conversion target: **3–5%** of MAU at maturity.
- Pro → Elite upsell: **10–15%** of Pro.
- Churn target: **< 5%/mo** via habit (daily predictions), reputation lock-in, and AI value.
- Annual plans (2 months free) to pull forward cash and cut churn.

---

## 7. Creator economy economics
- **80/20 split** (creator/platform) on subscriptions and premium content.
- Tiered incentives: reduced take or bonuses for top creators to prevent platform risk (see `07-CREATOR_ECONOMY.md`).
- Creator GMV is the leading indicator of Phase 3 revenue; target **100 active creators** → seed the flywheel.

---

## 8. Enterprise revenue model
- **Prediction API / Fan Sentiment API / Community Analytics API** sold on usage + seat tiers to media, books, fantasy operators, and clubs.
- Annual contracts ($25k–$250k ACV), high gross margin (data already produced by the network).
- Land with a sentiment dashboard; expand to API + custom analytics.

---

## 9. Data monetization strategy
- The network produces a **proprietary, outcome-labeled prediction + sentiment dataset** daily.
- Monetized via (a) enterprise APIs, (b) anonymized/aggregated licensing, (c) internal AI improvement (compounding product value).
- **Privacy-first:** only aggregated/anonymized data is ever licensed; individual data stays user-controlled and RLS-protected. No resale of personal data.

---

## 10. Path to profitability
1. **Phase 1–2:** invest for growth (NSM: WPU), thin ads + early Pro subs offset infra.
2. **Phase 3:** creator take-rate becomes a compounding, low-CAC revenue line.
3. **Phase 4–5:** high-margin enterprise + data licensing drives operating leverage and profitability.
