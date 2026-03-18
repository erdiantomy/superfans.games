

## Plan: Finished Match Results Screen with Winner Celebration

### What we're building
A dedicated results screen that appears when viewing a finished match, featuring confetti/celebration animations, winner highlight, detailed payout breakdown, and supporter outcome summary.

### Changes

**1. New component: `src/components/fanprize/MatchResultScreen.tsx`**
- Full-screen results view triggered when opening a finished match
- **Winner celebration section**: Large trophy icon with pulsing gold glow animation, winner's avatar scaled up with a radial gradient halo, "WINNER" badge, and the winner's name in large display type
- **Score display**: Final set score between both players
- **Payout breakdown card**: Winner payout (90%), platform fee (10%), total pool, number of supporters
- **Supporter outcome section**: "Your support" card showing if user backed the winner or not, points earned/lost
- **Match summary**: Tournament name, sport tag, final stats
- **Share results buttons** (WhatsApp, Instagram, Copy Link)
- Back button returns to home

**2. Update `src/pages/Index.tsx`**
- Add a `matchResult` screen type
- When a finished match is selected, route to `MatchResultScreen` instead of `MatchDetail`

**3. Update `src/index.css`** — Add celebration animations:
- `@keyframes confetti-fall` — particles drifting down with rotation
- `@keyframes trophy-bounce` — trophy icon entrance with spring bounce
- `@keyframes gold-glow` — pulsing gold radial glow behind winner avatar
- `@keyframes fade-in-up` — staggered entrance for payout detail rows

**4. Update `tailwind.config.ts`** — Register the new animation keyframes and classes (`animate-trophy-bounce`, `animate-gold-glow`, `animate-confetti`).

### Animation details
- On mount: trophy bounces in (scale 0→1.15→1 over 0.6s), then gold glow pulses continuously
- Confetti: 12-15 small colored squares/circles absolutely positioned, falling with CSS animation (randomized delays via inline styles)
- Payout rows fade-in-up with 100ms stagger delays

