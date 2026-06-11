# 06 — AI System

AI is the engagement multiplier and the long-term data moat. Every AI surface is
designed to (a) increase engagement, (b) assist — never replace — human judgment,
and (c) generate outcome-labeled data that makes the next model better.

**Provider:** OpenAI (LLM + embeddings) via a single internal **AI Gateway** edge
function. All AI calls are proxied, cached, rate-limited, logged, and cost-attributed.

---

## 1. AI Match Prediction System
- **Goal:** generate a model prediction + **confidence score** + short rationale for each upcoming match.
- **Inputs:** team form, head-to-head, home/away, injuries/availability, schedule density, (later) odds-implied baselines, community split.
- **Method:** hybrid — a statistical baseline (Elo/Poisson-style features) feeds an LLM that produces the narrative preview and a calibrated confidence; structured fields stored on `matches`/cache.
- **Output:** outcome probability, confidence (0–100), 2–3 sentence rationale, key factors.
- **Gating:** AI predictions are a **Pro/Elite** feature (free users see a teaser).

## 2. AI Community Moderation
- Classify posts/comments for toxicity, spam, harassment, and off-topic before/at publish.
- Tiered action: auto-allow → soft-flag for human mod → auto-hold. Feeds `audit_logs`.
- Protects community quality at scale; reduces mod load.

## 3. AI Fan Sentiment Engine
- Aggregate posts, comments, and prediction skew into a **per-team / per-match sentiment index** (bullish/bearish, momentum, volume).
- Powers UI ("fan mood"), creator insight, and the **enterprise Sentiment API** (aggregated/anonymized only).

## 4. AI Content Ranking
- Score feed/discussion items by predicted value to *this* user (relevance × quality × freshness × author reputation × diversity).
- Penalize clickbait/low-trust; boost high-accuracy authors. Drives Feed personalization (#7).

## 5. AI Creator Recommendations
- "Analysts you should follow" using embedding similarity (followed teams, prediction style, accuracy) + collaborative signals.
- Accelerates the creator↔audience network effect.

## 6. AI Notification Optimization
- Predict best **send-time** and **channel** per user to maximize open without fatigue.
- Suppress low-value notifications; bundle digests. Feeds the notification engine (`04`).

## 7. AI Feed Personalization
- Real-time ranking of the home feed blending follow-graph + recommendations + match relevance + reputation.
- Cold-start via onboarding follows; warms with behavior. Exploration quota to avoid filter bubbles.

## 8. AI Churn Prediction
- Score each user's churn risk daily from engagement decay, streak breaks, notification response.
- Triggers retention flows (`03`) with the highest-leverage hook per user.

## 9. AI Subscriber Recommendation
- For free users, identify likely Pro converters and likely creator-subscribers; surface the right paywall/creator at the right moment. For creators, suggest content that grows their subscriber base.

---

## 10. Prompt engineering strategy
- **Structured I/O:** system prompt defines role + guardrails; user payload is structured JSON (match/team/context); model returns strict JSON (schema-validated) for storage.
- **Grounding:** always pass factual context (stats/form); forbid fabricated injuries/results. "If data is missing, say so" instructions.
- **No-gambling guardrail in every prompt:** never produce betting advice, odds-as-stakes, or wagering language; frame as analysis/prediction only.
- **Determinism where needed:** low temperature for scoring/sentiment; higher for narrative previews.
- **Versioned prompts** in repo; changes A/B-tested and eval-gated.

## 11. LLM architecture (AI Gateway)
```
[client/edge trigger]
      ▼
[AI Gateway edge fn] ── cache hit? ──► [Redis cache] ──► return
      │ miss
      ▼
 (build grounded prompt + schema)
      ▼
 [OpenAI API]  ── (fallback model on error/timeout)
      ▼
 (validate JSON schema → repair if needed)
      ▼
 (store result + cost log + eval sample)  ──► return
```
- Single choke point for **cost control, caching, rate-limiting, logging, eval sampling, and model routing.**

## 12. Model selection
- **Reasoning/preview/analysis:** a strong general LLM (quality-tier) for previews, moderation rationale, creator recs.
- **High-volume/cheap tasks:** a smaller/faster model for classification, ranking features, send-time scoring.
- **Embeddings:** dedicated embedding model for semantic search/recommendations (`pgvector`).
- Routing by task in the Gateway; models are config, not hard-coded, so we can upgrade without code changes.

## 13. Inference design
- **Batch + precompute** match previews/sentiment on a schedule (pre-kickoff) → cached, instant for users.
- **On-demand** for personalization/moderation with tight latency budgets and caching.
- **Cost guardrails:** per-user and global token budgets; premium gating on expensive features; aggressive cache TTLs keyed on data freshness.

## 14. Evaluation metrics
- **Prediction:** calibration (Brier score), accuracy vs. outcomes, vs. community baseline.
- **Moderation:** precision/recall on labeled abuse set; false-positive rate.
- **Ranking/feed:** engagement lift, dwell, return rate vs. control (online A/B).
- **Sentiment:** correlation with downstream engagement & (where available) outcomes.
- **Cost:** tokens/active-user, $/feature; tracked in the Gateway.

## 15. Feedback loops
- Every prediction is **outcome-labeled** when its match resolves → continuously growing training/eval set unique to Superfans.
- Moderation human-overrides label the abuse classifier.
- Engagement signals label ranking/recommendation quality.
- This data flywheel (also see `02`/`08`) is the moat: more usage → better AI → more usage.

## 16. Safety, privacy, and ethics
- **No gambling/betting advice** anywhere — hard guardrail.
- Only **aggregated/anonymized** data leaves the platform; personal data is RLS-protected and user-controllable.
- Human-in-the-loop for consequential moderation; transparent appeals.
- Bias monitoring on recommendations to avoid entrenching a few creators unfairly.
