# PROMPT 2: PROFILE CLAIM ONBOARDING + PLAYER DASHBOARD + ADMIN TAB

## CONTEXT

Same codebase as previous prompt. The player profile page (`PlayerProfilePage`) and donation modal (`DonationModal`) now exist. The following Supabase tables/RPCs are live:
- `player_profiles` (id, player_id, slug, display_name, bio, avatar_url, social_links, is_public)
- `donations` (id, player_id, donor_id, donor_name, amount, message, is_anonymous, status)
- `player_profile_full` view (joins profile + padel_player stats + donation aggregates)
- `check_slug_available(slug)` RPC → returns boolean
- `resolve_slug(slug)` RPC → returns { entity_type, entity_id }

Auth: `useAuth()` → `{ user, session }`. Player records: `padel_players` table with `user_id` FK to `auth.users`. Use `as any` cast on supabase for tables not in generated types.

## WHAT TO BUILD

### 1. CLAIM YOUR PAGE BANNER — `src/components/profile/ClaimProfileBanner.tsx`

This component checks if the logged-in user has a `player_profiles` record. If not, show a banner prompting them to claim their page.

```ts
const { user } = useAuth();

// Get their padel_player record
const { data: player } = useQuery({
  queryKey: ['my-player', user?.id],
  queryFn: async () => {
    const { data } = await (supabase as any)
      .from('padel_players')
      .select('id, name, avatar')
      .eq('user_id', user!.id)
      .single();
    return data;
  },
  enabled: !!user,
});

// Check if they already have a profile
const { data: existingProfile } = useQuery({
  queryKey: ['my-profile', player?.id],
  queryFn: async () => {
    const { data } = await (supabase as any)
      .from('player_profiles')
      .select('slug')
      .eq('player_id', player!.id)
      .single();
    return data;
  },
  enabled: !!player,
});
```

**If no profile exists**, render a banner:
- Background: gradient from `C.green` at 15% opacity to transparent
- Green border left accent
- Text: "Claim your Superfans page" → bold
- Subtext: "Get superfans.games/yourname and start receiving support from fans"
- CTA button: "Claim Now →" in green
- Dismiss X button (stores dismissed state in localStorage for 7 days)
- Clicking "Claim Now" opens the ClaimProfileModal

**If profile exists**, don't render anything.

**Where to place this banner**: Add it to `VenuePage.tsx` at the top (after venue header, before sessions list), only shown to logged-in users without a profile. Import and render conditionally:
```tsx
{user && <ClaimProfileBanner />}
```

### 2. CLAIM PROFILE MODAL — `src/components/profile/ClaimProfileModal.tsx`

Props: `{ open: boolean, onClose: () => void, player: { id: string, name: string, avatar: string } }`

**Step 1: Choose your slug**
- Input field with `superfans.games/` prefix (non-editable, muted)
- The slug input: lowercase, auto-strips invalid chars, real-time availability check
- On each keystroke (debounced 500ms), call:
```ts
const { data } = await (supabase as any).rpc('check_slug_available', { p_slug: slugValue });
```
- Show green checkmark + "Available!" or red X + "Already taken" below input
- Rules displayed: "3-30 characters, lowercase letters, numbers, and hyphens only"
- Pre-fill with a slugified version of their `player.name` (lowercase, replace spaces with hyphens, strip special chars)

**Step 2: Set up your profile**
- Display name input (pre-filled with `player.name`)
- Bio textarea (optional, max 160 chars, char counter)
- "You can add a photo and social links later in your dashboard"

**Step 3: Preview card**
- Mini version of how their profile will look:
  - Avatar circle with initials
  - Display name
  - Bio (or placeholder "No bio yet")
  - URL: `superfans.games/${slug}`
- Small muted text: "You can edit this anytime"

**Confirm button: "Create My Page 🚀"**

On submit:
```ts
const { error } = await (supabase as any)
  .from('player_profiles')
  .insert({
    player_id: player.id,
    slug: slugValue,
    display_name: displayName,
    bio: bio,
    is_public: true,
  });
```

On success:
- Close modal
- Show toast: "Your page is live! 🎉"
- Navigate to `/${slugValue}` (their new profile page)
- Invalidate relevant queries

### 3. PLAYER DASHBOARD — `src/pages/PlayerDashboard.tsx`

Accessible at `/:slug/dashboard`. Only accessible by the profile owner (check `profile.user_id === auth.uid()`). If not owner → redirect to `/:slug` (public profile).

**Header:**
- "Your Dashboard" title
- "View Public Profile →" link to `/${slug}`
- Back button

**Stats overview row** (same 4-card layout as public profile but with additional data):
- Total Raised: formatted IDR
- Superfans: unique supporter count
- Games Played
- Win Rate %

**Edit Profile section** (collapsible card):
- Display name input
- Bio textarea (160 char limit)
- Avatar upload: file input that uploads to Supabase Storage bucket `avatars`
  - On upload: `await supabase.storage.from('avatars').upload(path, file)`
  - Then update `player_profiles.avatar_url` with the public URL
  - Show current avatar preview
- Social links: Instagram, TikTok, Twitter/X URL inputs (stored in social_links jsonb as `{ instagram: '', tiktok: '', twitter: '' }`)
- Profile visibility toggle (public/private)
- Save button → updates `player_profiles` row

**Donation History section:**
- Table/list of all received donations:
  - Date (formatted: "Mar 25, 2026")
  - Donor name (or "Anonymous")
  - Amount (Rp XX.XXX)
  - Message (truncated, expandable)
  - Status badge (paid=green, pending=yellow, expired=gray)
- Sort by most recent
- If no donations: "Share your page to start receiving support! [Copy Link button]"

**Share section:**
- Your URL in a copyable input field: `superfans.games/${slug}`
- Copy button with clipboard icon
- Share text: "Share your page on social media to get support from your fans"

### 4. SUPER ADMIN — PLAYERS TAB

In `src/pages/SuperAdminPage.tsx`, add a new tab "Players" alongside existing tabs.

This tab shows all claimed player profiles:

Fetch:
```ts
const { data: profiles = [] } = useQuery({
  queryKey: ['admin-player-profiles'],
  queryFn: async () => {
    const { data } = await (supabase as any)
      .from('player_profile_full')
      .select('*')
      .order('profile_created_at', { ascending: false });
    return data ?? [];
  },
});
```

**Table columns:**
- Avatar + Name (display_name)
- Slug (as clickable link → opens `/${slug}` in new tab)
- Games Played
- Win Rate
- Total Raised (IDR)
- Supporters count
- Visibility (Public/Private badge)
- Created date
- Actions: Toggle visibility, view profile

Sort by: Created date (default), Total Raised, Games Played, Supporters (clickable column headers).

### 5. EDIT PROFILE LINK IN VENUE PAGE

In `VenuePage.tsx`, for logged-in users who HAVE a profile, add a small button/link in the user's info area (near their name/avatar at the top):
- Small "Edit Profile" text link or pencil icon
- Links to `/${profile.slug}/dashboard`

## ROUTING ADDITIONS IN App.tsx

Add this route (in the venue-scoped section, BEFORE the `/:slug` catch-all):
```tsx
<Route path="/:slug/dashboard" element={<PlayerDashboard />} />
```

## IMPORTANT

- Do NOT modify SlugResolver, PlayerProfilePage, or DonationModal from the previous prompt
- Keep all existing routes and pages intact
- Use the same dark theme, design tokens (C object), and component patterns
- Mobile-first: max-w-md, touch targets min 44px
- Use `as any` cast for supabase calls to new tables
- The ClaimProfileBanner should be subtle — not intrusive. If dismissed, stay hidden for 7 days.
- The dashboard must verify ownership before rendering — redirect unauthorized users to the public profile
- For the SuperAdmin tab, check the existing tab pattern in SuperAdminPage.tsx and follow the same structure
