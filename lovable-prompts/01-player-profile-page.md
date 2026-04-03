# PROMPT 1: SLUG RESOLVER + PLAYER PROFILE PAGE + DONATION FLOW

## CONTEXT

This is a Supabase + React + Tailwind app (SuperFans.games — padel gamification platform). The codebase uses:
- `@tanstack/react-query` for data fetching
- `react-router-dom` for routing
- `framer-motion` for animations
- Supabase client at `@/integrations/supabase/client` (imported as `supabase`, cast with `as any` for tables not in generated types)
- Design tokens in `@/components/arena/index.tsx` — dark theme, `C.bg`, `C.card`, `C.green`, `C.border`, etc.
- Fonts: Barlow Condensed (headings), Inter (body)
- CSS variables in `src/index.css` — dark bg (`220 25% 5%`), green primary (`145 100% 45%`)
- Auth via `@/hooks/useAuth` → `{ user, session, loading }`
- Venue context via `@/hooks/useVenue` → `{ venue, loading, slug }`

## WHAT TO BUILD

### 1. SLUG RESOLVER — Modify `/:slug` route in `src/App.tsx`

Currently `/:slug` goes directly to `<VenueLayout><VenuePage /></VenueLayout>`. Change it to use a **SlugResolver** component that:

1. Extracts `slug` from `useParams()`
2. Calls the Supabase RPC `resolve_slug(slug)` which returns `{ entity_type: 'venue' | 'player', entity_id: uuid }`
3. If `entity_type === 'venue'` → render `<VenueLayout><VenuePage /></VenueLayout>` (existing behavior, zero changes)
4. If `entity_type === 'player'` → render `<PlayerProfilePage playerId={entity_id} slug={slug} />`
5. If no result → render `<NotFound />`
6. While loading → show a centered spinner on dark background

Create `src/pages/SlugResolver.tsx` for this logic.

**In App.tsx**, replace:
```tsx
<Route path="/:slug" element={<VenueLayout><VenuePage /></VenueLayout>} />
```
with:
```tsx
<Route path="/:slug" element={<SlugResolver />} />
```

Also add a new route for player dashboard:
```tsx
<Route path="/:slug/dashboard" element={<PlayerDashboard />} />
```

Keep ALL existing `/:slug/rank`, `/:slug/host`, `/:slug/admin`, `/:slug/session/:code`, `/:slug/match/:code` routes unchanged — they use VenueProvider which validates venue slugs, so they won't conflict with player slugs.

### 2. PLAYER PROFILE PAGE — `src/pages/PlayerProfilePage.tsx`

Props: `{ playerId: string, slug: string }`

Fetch data from the `player_profile_full` view:
```ts
const { data: profile } = useQuery({
  queryKey: ['player-profile', slug],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .from('player_profile_full')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },
});
```

Fetch match history from `player_match_history` view:
```ts
const { data: matches = [] } = useQuery({
  queryKey: ['player-matches', playerId],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .from('player_match_history')
      .select('*')
      .or(`team_a_p1.eq.${playerId},team_a_p2.eq.${playerId},team_b_p1.eq.${playerId},team_b_p2.eq.${playerId}`)
      .order('played_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return data ?? [];
  },
  enabled: !!playerId,
});
```

Fetch recent donations:
```ts
const { data: recentDonations = [] } = useQuery({
  queryKey: ['player-donations', playerId],
  queryFn: async () => {
    const { data, error } = await (supabase as any)
      .from('donations')
      .select('id, donor_name, amount, message, is_anonymous, created_at')
      .eq('player_id', playerId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw error;
    return data ?? [];
  },
  enabled: !!playerId,
});
```

#### LAYOUT (mobile-first, max-w-md mx-auto, dark theme):

**Hero section:**
- Large avatar circle (80px) — if `avatar_url` exists, show image; else use initials from `profile.avatar` with division color gradient background (reuse `Av` component from `@/components/arena` with size=80)
- `display_name` in Barlow Condensed 24px bold white
- Division badge (reuse `DivTag` from arena components)
- Bio text in muted color, max 2 lines
- Venue badge if they have recent matches at a venue (small pill)

**Stats row (4 cards in a 2x2 grid or horizontal scroll):**
- Games Played (with gamepad icon)
- Wins (with trophy icon)
- Win Rate % (with target icon)
- Current Streak (with flame icon)
Each card: `C.card` background, `C.border` border, big number in white, label in muted, rounded-xl

**"Support [Name]" CTA button:**
- Full width, green gradient background (`hsl(145 100% 45%)` → slightly darker), white text, bold
- Sticky at bottom on mobile (fixed bottom-0 with safe area padding)
- Opens DonationModal (see below)
- Show small heart icon + "Support" text
- Below the button, show supporter count: "💚 X Superfans"

**Recent Matches section:**
- Section header: "Recent Matches" in Barlow Condensed
- List of match cards, each showing:
  - Date (relative: "2h ago", "Yesterday", etc.)
  - Session name
  - Score: "Team A 24 - 18 Team B" 
  - W/L badge: green "W" or red "L" pill (determine by checking if player was on the winning team)
  - Venue name in small muted text
- If no matches: empty state "No matches yet"

**Superfans Wall section:**
- Section header: "Superfans" with count badge
- Grid of recent donation cards, each showing:
  - Donor avatar (initials) + name (or "Anonymous")
  - Amount in IDR formatted: "Rp 50.000"
  - Message if present (italic, muted, truncated 1 line)
  - Relative timestamp
- If no donations: "Be the first to support [Name]!"

**Share button (top right of hero):**
- Icon button (share/link icon)
- On click: copy `superfans.games/${slug}` to clipboard, show toast "Link copied!"

**OG Meta tags** — use `react-helmet-async` or just set document.title:
- Title: `${display_name} | SuperFans`
- Set a meta description with stats summary

### 3. DONATION MODAL — `src/components/donations/DonationModal.tsx`

Props: `{ open: boolean, onClose: () => void, playerId: string, playerName: string, playerSlug: string }`

**Content:**
- Title: "Support [playerName]" with heart emoji
- Preset amount buttons in a 2x2 grid: 25.000, 50.000, 100.000, 250.000 (IDR)
  - Each button shows "Rp 25.000" — selected state has green border + green bg with opacity
- Custom amount input below: "Rp" prefix, number input, min 10000, max 10000000
- Message textarea: placeholder "Say something nice... (optional)", max 200 chars, char counter
- Anonymous toggle: switch + "Donate anonymously" label
- "Support Rp XX.XXX" submit button — green, full width, disabled if no amount selected
- Powered by Xendit text at bottom (small, muted)

**On submit:**
1. Show loading spinner on button
2. Call the Supabase edge function `create-donation`:
```ts
const { data, error } = await supabase.functions.invoke('create-donation', {
  body: {
    player_id: playerId,
    amount: selectedAmount,
    message: message,
    is_anonymous: isAnonymous,
    donor_name: user ? playerProfile?.name : 'Supporter',
    donor_id: currentPlayerRecord?.id || null, // padel_player id if logged in
  },
});
```
3. If success → redirect to `data.invoice_url` (Xendit checkout page)
4. If error → show toast error

**After payment (returning from Xendit):**
- Check URL params: `?donation=success&order_id=XXX` on the player profile page
- If `donation=success` → show a celebration overlay:
  - Confetti animation (use a simple CSS confetti or framer-motion)
  - "You're a Superfan of [Name]! 🎉"  
  - "Thank you for your support" 
  - Share button: "Tell your friends" → copies profile URL
  - Close button returns to normal profile view

Use the Dialog component from `@/components/ui/dialog` for the modal if it exists, otherwise create a simple modal with a dark overlay + centered card with slide-up animation.

### 4. DONATION SUCCESS OVERLAY — handle in PlayerProfilePage

On mount, check `useSearchParams()` for `donation=success`:
```ts
const [searchParams, setSearchParams] = useSearchParams();
const [showDonationSuccess, setShowDonationSuccess] = useState(false);

useEffect(() => {
  if (searchParams.get('donation') === 'success') {
    setShowDonationSuccess(true);
    // Clean URL
    searchParams.delete('donation');
    searchParams.delete('order_id');
    setSearchParams(searchParams, { replace: true });
  }
}, []);
```

## IMPORTANT

- Do NOT modify any existing pages (VenuePage, AdminPage, HostDashboard, etc.)
- Do NOT change VenueProvider or useVenue hook
- Use `as any` cast on supabase for new tables not in generated types
- Keep the dark theme consistent — use CSS variables and C tokens from arena components
- All new components go in `src/pages/` or `src/components/donations/`
- Mobile-first: max-w-md mx-auto, touch-friendly tap targets (min 44px)
- Format IDR amounts with dot separator: `n.toLocaleString('id-ID')` → "50.000"
