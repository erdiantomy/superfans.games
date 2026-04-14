

## Revise Hero Headline & Copy — Community/Social Proof Direction

The current hero reads "Turn Every Match Into a Story" with a subtitle about "gamification layer for padel venues." With the updated UX/UI and GTM strategy, we'll shift to a community-driven, social proof angle that speaks to players wanting to be part of something bigger.

### Changes

**1. Homepage Hero (src/pages/HomePage.tsx)**
- **Headline**: Replace "Turn Every Match / Into a Story" with something like:
  - "Where Padel Players Become Legends" or
  - "Your Club. Your Rankings. Your Fans."
- **Subtitle**: Update from the generic gamification pitch to community-focused copy, e.g.: "Join thousands of players competing, climbing leaderboards, and building their fan base — no app download needed."
- Keep the animated "Discover your role" scroll indicator

**2. Meta Tags (index.html)**
- Update `<title>`, `og:title`, `twitter:title` to match the new headline
- Update `description`, `og:description`, `twitter:description` to align with community positioning

**3. Footer tagline (src/components/MarketingLayout.tsx)**
- Update "Built for padel athletes and their fans" to match the refreshed tone

### Files Modified
- `src/pages/HomePage.tsx` — hero headline + subtitle text
- `index.html` — meta title + descriptions
- `src/components/MarketingLayout.tsx` — footer tagline

