# 07 — Creator Economy

Creators are why fans come back. The creator economy turns the best fans into
monetizing analysts and is the engine of Phase 3 revenue (`02`, `09`). Standard
split is **80% creator / 20% platform**, with incentives for top creators.

---

## 1. Creator lifecycle
```
Fan → Active Predictor → Emerging Analyst → Verified Creator → Pro Creator → Star Creator
```
1. **Fan:** predicts, builds an accuracy record.
2. **Active Predictor:** consistent activity, growing followers.
3. **Emerging Analyst:** crosses reputation/follower threshold → unlock posting tools.
4. **Verified Creator:** identity + track-record verified → can open a paid channel.
5. **Pro Creator:** sustained subscribers/revenue → better terms, more tools.
6. **Star Creator:** top-tier reach/revenue → lowest take, co-marketing, events.

## 2. Monetization mechanics
- **Channel subscriptions** (recurring): gated premium picks, analysis, community.
- **Premium posts** (`posts.is_premium`): individual gated content.
- **Prediction leagues:** paid/entry-gated competitions creators host.
- **Private groups:** subscriber-only discussion.
- **Tips/boosts** (later): one-off support.
- All monetization is **subscription/content based — never wagering.**

## 3. Creator tiers
| Tier | Unlock criteria (illustrative) | Platform take | Perks |
| --- | --- | --- | --- |
| Verified | Identity + ≥ reputation threshold | 20% | Paid channel, badge |
| Pro Creator | ≥ 100 active subs or revenue floor | 18% | Analytics+, scheduling, lower take |
| Star Creator | ≥ 1,000 active subs / top revenue | 15% | Lowest take, co-marketing, beta tools, events |

Take-rate reductions reward scale and reduce flight risk; thresholds are config (`feature_flags`).

## 4. Subscriber plans
- Creators set **price** and **billing period** (monthly/yearly) per `creator_channels`.
- Yearly plans encouraged (2 months free) to cut churn.
- Free preview tier per channel to drive conversion.

## 5. Revenue sharing
- **Net revenue** = gross − payment processing fees.
- Split applied on **net**; recorded immutably in `payments` (`gross_minor`, `platform_fee_minor`, `net_to_creator_minor`).
- Refunds/chargebacks reverse both sides proportionally and are audited.

## 6. Payout system
```
Subscriber pays → payment succeeded (webhook) → ledger entry (80/20)
   → creator balance accrues → payout schedule (e.g. net-15, min threshold)
   → payout initiated → audit_log → creator notified
```
- KYC/payout account required before first payout.
- Holdback/rolling reserve for fraud/chargeback protection.
- Transparent earnings dashboard (pending, available, paid).

## 7. Leaderboards (creators)
- Ranked by **Influence Score**, subscriber growth, and revenue (creator-private) — plus public **Accuracy** leaderboards.
- Surfaces top creators for discovery → feeds recommendation engine (`06`).

## 8. Verification system
- **Identity verification** (creator is who they claim) + **track-record verification** (accuracy history is real, anti-Sybil via `trust_score`).
- Verified badge on `profiles.is_verified`; required to monetize.

## 9. Creator reputation
- Built on the same Reputation Engine: **Accuracy** (are their picks right), **Influence** (reach × engagement), **Trust** (consistency, no gaming), **Community** (how they treat members).
- Reputation gates tiers and discovery; **un-fakeable and non-portable** — the core lock-in.

## 10. Creator growth framework
- **Tools:** scheduling, drafts, premium gating, analytics (audience, conversion, churn), AI content suggestions (`06`).
- **Distribution:** recommendation surfaces, leaderboards, community cross-posting, shareable prediction cards (virality, `08`).
- **Playbooks:** onboarding checklist, content cadence guidance, conversion best-practices.

## 11. Top creator incentive system
- **Lower take** at higher tiers (see #3).
- **Creator fund / bonuses** for milestones (first 100 creators, subscriber milestones).
- **Co-marketing & events** for Star Creators.
- **Early access** to new monetization tools.
- **Anti-flight design:** reputation + audience + history are most valuable *on* Superfans; portability of money, not of status.

## 12. Guardrails
- No gambling, tipping-for-bets, or guaranteed-win claims (moderation, `06`).
- Clear disclosure on premium/sponsored content.
- Creator conduct policy; repeated low-trust behavior caps monetization.
