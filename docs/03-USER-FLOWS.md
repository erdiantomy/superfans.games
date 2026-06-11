# 03 — User Flows

All flows are mobile-first and designed to minimize steps to value. Diagrams use simple ASCII flowcharts; `[ ]` = screen/state, `< >` = decision, `( )` = system action.

---

## 1. Signup flow
```
[Landing / Match Hub (logged-out)]
        │ tap "Join"
        ▼
[Auth sheet] ──< OAuth or email? >
        │ OAuth (Google/Apple)        │ Email
        ▼                              ▼
(Supabase OAuth)                 [Enter email + password]
        │                              │
        ▼                              ▼
        └──────────► (Create auth user) ◄──────
                          │
                          ▼
                  (Create profile row, default reputation)
                          │
                          ▼
                  [Onboarding flow ▼]
```
**Principle:** never block the first prediction behind a long signup — allow browsing logged-out, prompt auth at the moment of first action.

---

## 2. Onboarding flow
```
[Welcome] → [Pick favorite sports] → [Follow ≥3 teams/leagues]
   → [Follow ≥3 suggested creators] → [Make your first prediction]
   → [Enable notifications?] ──< yes/no >── [Home feed (activated)]
```
**Activation event:** *first prediction submitted within session 1.* Optimize the funnel toward it. Pre-seed follows so the feed is non-empty immediately.

---

## 3. Prediction flow
```
[Match Hub / Match card]
        │ tap match
        ▼
[Match detail]
   ├─ live score / status
   ├─ community split (e.g. 63% Home)
   ├─ AI prediction + confidence
   └─ [Predict] button
        │
        ▼
   < match open (pre-kickoff)? >
        │ no → [Locked — view-only]
        │ yes
        ▼
[Prediction sheet: outcome • optional score • confidence 1–100]
        │ confirm
        ▼
(Insert prediction, status=pending, lock_at=kickoff)
        │
        ▼
[Confirmation + share card]  ── share ──► (referral/virality loop)
        │
        ▼ ... match plays, finalizes ...
(Webhook: final score) → (Resolve predictions) → (Update reputation)
        │
        ▼
[Notification: "You called it! +Accuracy"]  /  ["Missed this one"]
```

---

## 4. Community creation flow
```
[Communities tab] → [Create community]
   → [Type: team / league / creator] → [Name, handle, banner, rules]
   → < eligible? (reputation/role gate) >
        │ no → [Explain requirement]
        │ yes
        ▼
(Create community + add creator as owner)
   → [Invite members / share link] → [Community hub live]
```

---

## 5. Creator flow
```
[Profile] → [Become a creator] → < verification check >
   → [Set up channel: name, description, price tiers]
   → [Connect payout account]
   → [Publish first premium post / pick]
   → [Channel page live] → (subscribers convert ▼)
```

---

## 6. Subscription flow
```
[Creator channel / Pro paywall]
   → [Choose plan] → [Checkout (Xendit/Stripe)]
   → < payment success? >
        │ no → [Retry / change method]
        │ yes
        ▼
(Record subscription + ledger entry, 80/20 split if creator)
   → (Grant access immediately) → [Unlocked content]
   ... renewal cycle ...
   → < renew or cancel? >
        cancel → (access until period end) → [Win-back flow]
```

---

## 7. Follower flow
```
[Any profile / post] → [Follow]
   → (Insert follow edge) → (Update follower/following counts)
   → (Add followee's activity to feed) → (Notify followee)
   → [Suggested similar accounts to follow]
```

---

## 8. Notification flow
```
(Trigger event: prediction resolved / new follower / creator post / match starting)
        ▼
(Notification service evaluates user prefs + AI send-time)
        ▼
   < channel? >
   ├─ in-app (realtime) → [Bell badge + list]
   ├─ push (PWA/web push) → [Device]
   └─ email digest → [Inbox]
        ▼
[User taps] → (Deep link to context) → (Mark read)
```

---

## 9. Referral flow
```
[Share prediction / invite] → (Generate referral link w/ user code)
   → friend opens link → [Branded match/prediction landing]
   → [Signup] → (Attribute referral) → (Reward both: badge / Pro trial)
   → new user enters Onboarding → (loop)
```

---

## 10. Retention flow
```
(Daily) → (Compute churn risk + relevant hooks per user)
   → [Personalized re-engagement]:
        ├─ "Your teams play today — predict now"
        ├─ "An analyst you follow just posted"
        ├─ streak reminders / reputation milestones
        └─ leaderboard movement alerts
   → user returns → [Feed] → makes prediction → (streak++, reputation updates)
   → (reinforce habit; surface next best action)
```
**Core habit loop:** *match scheduled → predict → resolve → reputation/status change → return for next match.*
