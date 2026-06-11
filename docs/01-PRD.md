# 01 — Product Requirements Document

**Product:** Superfans · **Tagline:** Where Sports Fans Become Legends
**Status:** Living document · **Owner:** VP Product

---

## 1. Problem statement
Sports fandom produces enormous intelligence — predictions, analysis, sentiment — that is never captured, scored, or rewarded. Fans have no portable reputation, no recognition for being right, and no path from "smart in the group chat" to "creator with an audience." Betting platforms monetize this instinct through risk and are regulated into a corner; social platforms host the conversation but give it no structure, scoring, or memory.

**Superfans solves this with a reputation-based sports social network:** fans predict and analyze matches, every prediction is scored against reality, reputation compounds, and the best fans become monetizing creators — with no gambling and no real-money wagering.

---

## 2. User personas

### P1 — Casual Carlos (Casual Fan)
- Follows 1–2 teams, watches weekends. Wants to predict, talk trash, and earn status with zero friction.
- **JTBD:** "When my team plays, I want to call the result and see if I beat my friends."

### P2 — Hardcore Hana (Hardcore Fan / Analyst)
- Consumes stats daily, writes long takes. Wants respect, followers, and a provable track record.
- **JTBD:** "When I analyze a match, I want a record that proves I'm consistently right."

### P3 — Creator Chris (Content Creator)
- Has an audience on Twitter/YouTube. Wants to monetize sports expertise without stitching 5 tools.
- **JTBD:** "When I publish picks and analysis, I want subscribers and recurring revenue in one place."

### P4 — Media Maya (Sports Media)
- Editor/producer. Wants trends, fan sentiment, and prediction signal for stories and programming.
- **JTBD:** "When I plan coverage, I want to know what fans believe and predict in real time."

### P5 — Org Omar (Sports Organization)
- Club/league digital lead. Wants fan engagement and community analytics.
- **JTBD:** "When I run our digital presence, I want to engage fans and understand their behavior."

---

## 3. Jobs To Be Done (summary)
1. Predict matches and be scored fairly. *(P1, P2)*
2. Build and display a reputation/identity. *(P1, P2, P3)*
3. Discover and follow trustworthy analysts. *(all)*
4. Discuss matches in real time with community. *(P1, P2)*
5. Monetize expertise and audience. *(P3)*
6. Access aggregate sentiment & prediction data. *(P4, P5)*

---

## 4. Feature requirements

| # | Feature | Persona | Priority | Phase |
| --- | --- | --- | --- | --- |
| F1 | Prediction Engine (submit, lock, resolve, score) | P1,P2 | P0 | MVP |
| F2 | Match Hub (live score, community/AI/creator picks, discussion) | all | P0 | MVP |
| F3 | Reputation Engine (Accuracy/Influence/Trust/Community) | all | P0 | MVP |
| F4 | Profiles (followers, history, badges) | all | P0 | MVP |
| F5 | Social Feed (follow graph, posts, predictions) | all | P0 | MVP |
| F6 | Follow system (users, teams, leagues, creators) | all | P0 | MVP |
| F7 | Leaderboards (global/country/league/club/friends) | P1,P2 | P1 | Growth |
| F8 | AI Layer (previews, analysis, confidence, sentiment) | all | P1 | Growth |
| F9 | Notifications (realtime + digest) | all | P1 | Growth |
| F10 | Communities / Hubs (team/league/creator) | all | P1 | Growth |
| F11 | Creator channels + subscriptions | P3 | P2 | Creator |
| F12 | Payments & payouts | P3 | P2 | Creator |
| F13 | Private groups | P2,P3 | P2 | Creator |
| F14 | Data/Sentiment APIs | P4,P5 | P3 | Enterprise |

---

## 5. Functional requirements (selected)

**Prediction Engine (F1)**
- Users submit a prediction on an open match (outcome, optional score, optional confidence 1–100).
- Predictions **lock at kickoff**; no edits after lock.
- On match finalization, predictions are auto-resolved and scored; reputation updates.
- A user's full prediction history is immutable and publicly viewable.

**Match Hub (F2)**
- Live score + status via realtime sports feed.
- Community prediction distribution (e.g. "63% Home"), AI prediction + confidence, featured creator picks.
- Threaded discussion scoped to the match, live-updating.

**Reputation Engine (F3)**
- Compute Accuracy, Influence, Trust, Community scores (see `06-AI-SYSTEM.md` / `07-CREATOR_ECONOMY.md`).
- Scores recompute on every resolution; surfaced on profiles and leaderboards.

**Feed (F5)** — ranked blend of followed entities + recommendations; infinite scroll; realtime inserts.

---

## 6. Non-functional requirements
- **Mobile-first:** every surface designed for one-handed phone use; PWA installable.
- **Performance:** p75 feed TTI < 2.5s on mid-tier mobile; prediction submit round-trip < 400ms.
- **Realtime:** score/discussion updates propagate < 2s.
- **Scale:** design for 1M MAU, 100k predictions/day at Phase 2 without re-architecture.
- **Availability:** 99.9% for read paths; graceful degradation if sports feed is down.
- **Security/Privacy:** RLS on all tables; no cross-user data leakage; GDPR-ready export/delete.
- **Accessibility:** WCAG 2.1 AA; full keyboard nav; dark mode default.
- **No gambling:** zero real-money wagering surfaces, copy, or mechanics, ever.

---

## 7. Success metrics & North Star

**North Star Metric:** **Weekly Predicting Users (WPU)** — unique users who submit ≥1 prediction in a 7-day window. It captures the core value loop (engaged, recurring, network-feeding) better than raw DAU.

**Supporting metrics:** DAU/WAU/MAU, Predictions Submitted/day, D1/D7/D30 retention, Follows per user, Creator Revenue, Subscriber Revenue, Community Retention, Match Engagement.

**Targets (12 months):** 100,000 MAU · 10,000 daily predictions · 1,000 paying subscribers · 100 active creators.

---

## 8. User stories & acceptance criteria (samples)

**US-1 — Submit a prediction**
> As a fan, I want to predict a match outcome so I can build my accuracy record.
- **AC1:** Given an open match, when I tap an outcome and confirm, my prediction is saved and shown as "locked-in-pending."
- **AC2:** After kickoff I can no longer create or edit a prediction for that match.
- **AC3:** When the match finalizes, my prediction shows correct/incorrect and my Accuracy Score updates within 60s.

**US-2 — Follow an analyst**
> As a fan, I want to follow analysts so their predictions appear in my feed.
- **AC1:** Following adds their posts/predictions to my feed within one refresh.
- **AC2:** Their follower count increments; I appear in their followers list (respecting privacy settings).

**US-3 — Subscribe to a creator**
> As a fan, I want to subscribe to a creator's premium channel.
- **AC1:** On payment success I gain access to gated content immediately.
- **AC2:** Creator earns 80% of net; platform retains 20%; ledger entry recorded.
- **AC3:** On cancellation, access persists to end of paid period.

---

## 9. MVP scope (Phase 1)
**In:** F1 Prediction Engine, F2 Match Hub, F3 Reputation v1 (Accuracy), F4 Profiles, F5 Feed, F6 Follows, auth, mobile-first dark UI.
**Out (deferred):** payments/subscriptions, AI layer, leaderboards beyond global, communities, private groups, enterprise APIs, Next.js migration.

## 10. Future scope
Leaderboards → AI layer → Communities → Creator economy & payments → Enterprise data APIs → Data network. Sequenced in `10-MVP_ROADMAP.md`.

---

## 11. Product principles
1. **Reputation over money.** Status is the prize; never introduce wagering.
2. **Mobile-first, always.** If it doesn't feel great one-handed, it ships later.
3. **Every action feeds the network.** Predictions, follows, posts must compound network value.
4. **Fast and addictive.** Sub-second core loops; realtime everywhere it matters.
5. **Truthful scoring.** Reputation must be auditable and impossible to fake.
6. **Creators are first-class.** Design for the people who make the platform worth visiting.
7. **AI augments, never replaces, the fan.** Insight assists judgment; humans own the take.
