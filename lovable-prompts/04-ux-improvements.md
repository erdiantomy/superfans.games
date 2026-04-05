# UX IMPROVEMENT PROMPTS — SUPERFANS.GAMES
# Execute in order: Prompt 1 → 2 → 3 → 4 → 5 → 6
# Each prompt is self-contained. Copy-paste one at a time into Lovable.

---

## PROMPT 1 of 6 — HOMEPAGE ROLE SELECTOR + HERO SIMPLIFICATION

### CONTEXT
- File: `src/pages/HomePage.tsx` (622 lines)
- Stack: React + Vite + Tailwind, light-theme landing page
- Design tokens: `GREEN = "#00E676"`, fonts: Barlow Condensed (headings), DM Sans (body)
- Auth: `useAuth()` → `{ user }`, navigation via `useNavigate()`
- Existing hero says "Play. Compete. Get Supported." with two CTAs: "Claim Your Page" and "I'm a Venue Owner"
- Problem: Homepage dumps all information (player flow, venue flow, host flow, XP system, economy, pricing) on every visitor simultaneously. First-time visitors bounce because they don't know what this is FOR THEM.

### WHAT TO CHANGE

**Replace the current hero section** (lines ~416-469, the section between `{/* HERO */}` and `{/* FEATURED PLAYERS */}`) with a simplified role-selector hero that immediately segments the visitor:

1. Keep the existing SUPERFANS.GAMES nav bar exactly as-is (lines 390-413). Do not touch it.

2. Replace the hero section with this structure:
   - Headline: `"Turn Every Match Into a Story"` (Barlow Condensed, same sizing as current)
   - Subline: `"The gamification layer for padel venues. XP, leaderboards, fan support — zero app downloads."` (same style as current subline)
   - Below the subline, render **3 role cards** in a horizontal row (stack vertically on mobile <480px):

   **Card 1 — "I'm a Player"**
   - Icon: 🎾
   - Accent border-left: GREEN (#00E676)
   - One-liner: "Join sessions, earn XP, climb divisions, get fan support"
   - CTA button: "Find Your Venue →" — onClick scrolls to `#venue-section` (existing anchor)
   - If user is logged in AND has `userProfileSlug`, change CTA to "My Profile →" and navigate to `/${userProfileSlug}`

   **Card 2 — "I Own a Venue"**
   - Icon: 🏟️
   - Accent border-left: #60D5FF
   - One-liner: "Free setup. Branded URL. Live leaderboards. Monthly prizes."
   - CTA button: "Register Free →" — navigates to `/register`

   **Card 3 — "I Host Sessions"**
   - Icon: 📋
   - Accent border-left: #FFD166
   - One-liner: "Create sessions, manage players, auto-generate matches"
   - CTA button: "Learn How →" — scrolls to `#how-it-works` (existing anchor)

   Each card: white background, `border: 1px solid #eee`, `border-left: 4px solid {accent}`, borderRadius 14px, padding 20px. On hover: subtle shadow `boxShadow: "0 4px 16px rgba(0,0,0,0.08)"`.

3. Below the role cards, keep the existing phone mockup video section exactly as-is.

4. Remove the "See a live example →" link that's currently between the CTA buttons and the phone mockup. Move it instead to appear as small text directly below the phone mockup: `"See it live at superfans.games/tomspadel →"`.

### DO NOT CHANGE
- The nav bar
- The phone mockup/video
- Featured Players section
- How It Works section (HowItWorksSection component)
- Features section
- Active Venues section
- Pricing section
- Footer
- Any queries, hooks, or data fetching logic

---

## PROMPT 2 of 6 — PERSISTENT BOTTOM NAVIGATION BAR

### CONTEXT
- Stack: React + Vite + Tailwind + react-router-dom
- Current problem: Once a player navigates into a venue page, session page, or rankings page, there's no consistent navigation to get back to key areas. Players get lost. There's no "My Profile" access point, no quick way to reach leaderboards, and no way to top up credits without manually navigating.
- Design tokens in `@/components/arena/index.tsx`: `C.bg`, `C.card`, `C.green`, `C.border`, `C.muted`, `C.fg`
- Auth: `@/hooks/useAuth` → `{ user }`
- Venue: `@/hooks/useVenue` → `{ venue, slug }`
- Route structure: `/:slug` (venue), `/:slug/rank` (leaderboard), `/:slug/host` (host dashboard), `/:slug/admin` (admin)

### WHAT TO BUILD

Create a new component `src/components/arena/BottomNav.tsx`:

This is a fixed-bottom navigation bar that appears on ALL venue-scoped pages for logged-in users. It has 4 tabs:

1. **Home** — icon: 🏟️ — navigates to `/${slug}` (venue page)
2. **Rankings** — icon: 🏆 — navigates to `/${slug}/rank`
3. **My Page** — icon: 👤 — navigates to `/${profileSlug}` if the user has claimed a profile, otherwise navigates to `/auth` with a toast "Sign in to claim your player page"
4. **Top Up** — icon: 💰 — navigates to `/topup`

**Behavior:**
- Only render if `user` is logged in (from `useAuth()`)
- Only render on venue-scoped pages (check if `slug` exists from URL params)
- Highlight the active tab based on current route using `useLocation()` from react-router
- The "My Page" tab needs to look up the user's profile slug. Use this query pattern:
```tsx
const { data: profileSlug } = useQuery({
  queryKey: ['my-profile-slug', user?.id],
  queryFn: async () => {
    const { data: player } = await (supabase as any).from("padel_players").select("id").eq("user_id", user!.id).single();
    if (!player) return null;
    const { data: profile } = await (supabase as any).from("player_profiles").select("slug").eq("player_id", player.id).single();
    return profile?.slug ?? null;
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000,
});
```

**Styling:**
- Fixed at bottom, full width, max-width 480px, centered
- Background: `C.bg` with `border-top: 1px solid ${C.border}`
- Height: 56px
- Each tab: flex column, icon (18px) + label (9px, uppercase, letter-spacing 1)
- Active tab: icon and label color `C.green`, inactive: `C.muted`
- `z-index: 50` to stay above content
- Add `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch

**Integration — add this component to these existing files:**

In each of these page files, import and render `<BottomNav />` as the last child inside the outermost container div. Also add `paddingBottom: 70px` to the scrollable content area in each page to prevent content from being hidden behind the nav:

1. `src/pages/VenuePage.tsx` — inside the root div, after the scrollable content div
2. `src/pages/RankPage.tsx` — inside the root motion.div, after all content
3. `src/pages/SessionPage.tsx` — inside the main content div (only in the "canSee" authenticated view, not the preview view)
4. `src/pages/TopUpPage.tsx` — inside the root container

### DO NOT CHANGE
- Any existing navigation buttons in headers (keep them, the bottom nav is additive)
- Any page logic, queries, or functionality
- HomePage (the landing page does NOT get this bottom nav)
- Admin and SuperAdmin pages (these are staff-only, no bottom nav)

---

## PROMPT 3 of 6 — SESSION UX: FIX PLACEHOLDERS + DIVISION PROGRESS + POST-SESSION RECAP

### CONTEXT
- File: `src/pages/SessionPage.tsx` (422 lines)
- Design tokens: `C` object from `@/components/arena`
- Gamification: `getDivision()`, `getDivisionProgress()`, `getXpToNextDivision()` all exist in `@/lib/gamification.ts`
- Auth state machine: `loading | preview | unauthenticated | pending | approved | host`
- Session status: `pending_approval | active | live | finished`
- Tab structure: host sees `[players, live, standings, support, rounds, share]`, player sees `[live, standings, support, rounds]`
- The `me` variable holds the current player's `PadelPlayer` object with `lifetime_xp`
- `approved` array holds all approved session players with their `player` objects

### CHANGES — DO ALL THREE

#### 3A. Fix Placeholder Tabs (Live + Rounds)

**Current problem:** The "Live" tab (line ~313-318) and "Rounds" tab (line ~413-418) both show placeholder text saying "Connect to Supabase to see real-time scores/data." This is confusing because Supabase IS connected — there's just no round data yet.

**Replace the Live tab content** (the section under `{tab === "live" && ...}`) with:
```
If session.status === "live" AND there are active matches: show "Live scores updating..." (keep for future)
If session.status === "active": show "⏳ Session hasn't started yet. Matches will appear here once the host begins Round 1."
If session.status === "finished": show "✅ This session has ended. Check the Standings tab for final results."
Otherwise (no rounds yet): show "No matches in progress. The host will start rounds when all players are ready."
```
Use the same styling pattern (fontSize 12, color C.muted, centered, padding 24px) but remove the green "Connect to Supabase" line entirely.

**Replace the Rounds tab content** with the same pattern:
```
If session.status === "finished": "Session complete. All rounds have been played."
If session.status === "active": "Rounds will appear here once the session begins."
Otherwise: "No rounds generated yet."
```

#### 3B. Add Division Progress Bar to Standings Tab

In the **Standings tab** (the section under `{tab === "standings" && ...}`), for the CURRENT USER's row only (where `sp.player_id === me?.id`), add a division progress indicator directly below their existing standings row:

```tsx
// After the player's standings Row, if this is the current user:
{sp.player_id === me?.id && (
  <div style={{ background: `${div.color}08`, border: `1px solid ${div.color}20`, borderRadius: 10, padding: "8px 12px", marginBottom: 8, marginTop: -4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
      <span style={{ color: div.color, fontWeight: 700 }}>{div.label}</span>
      <span style={{ color: C.muted }}>
        {getXpToNextDivision(sp.player.lifetime_xp) !== null
          ? `${getXpToNextDivision(sp.player.lifetime_xp)} XP to next`
          : "Max Division!"}
      </span>
    </div>
    <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", background: div.color, borderRadius: 2, width: `${getDivisionProgress(sp.player.lifetime_xp)}%`, transition: "width 0.5s" }} />
    </div>
  </div>
)}
```

Import `getDivisionProgress` and `getXpToNextDivision` from `@/lib/gamification` (they already exist).

#### 3C. Post-Session Recap State

When `session.status === "finished"`, show a **Session Recap banner** at the top of the session page content area (above the tabs), ONLY for approved players and the host:

```tsx
{session.status === "finished" && canSee && (
  <div style={{ background: "linear-gradient(135deg, #0B1A0C, #0B0E16)", border: `1px solid ${C.green}30`, borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
    <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
    <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.green, marginBottom: 4 }}>SESSION COMPLETE</div>
    <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{session.name}</div>

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
      <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
        <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{approved.length}</div>
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Players</div>
      </div>
      <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
        <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.gold }}>{cr(pool)}</div>
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Pool</div>
      </div>
      <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
        <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.blue }}>{supports.length}</div>
        <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Supporters</div>
      </div>
    </div>

    {/* Current player's XP progress - only if current user is a player */}
    {me && approved.find(sp => sp.player_id === me.id) && (() => {
      const div = getDivision(me.lifetime_xp);
      const xpToNext = getXpToNextDivision(me.lifetime_xp);
      return (
        <div style={{ background: C.raised, borderRadius: 12, padding: "12px 14px", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: div.color }}>{div.label} Division</span>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 900, color: C.green }}>{me.lifetime_xp.toLocaleString()} XP</span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
            <div style={{ height: "100%", background: div.color, borderRadius: 2, width: `${getDivisionProgress(me.lifetime_xp)}%` }} />
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>
            {xpToNext !== null ? `${xpToNext} XP to next division` : "You've reached the highest division!"}
          </div>
        </div>
      );
    })()}
  </div>
)}
```

### DO NOT CHANGE
- The session loading, not-found, and preview states
- The join/approve/decline logic
- The support tab functionality
- The share tab
- The header/logo area
- Any hooks, queries, or mutations

---

## PROMPT 4 of 6 — HOST UX: DUPLICATE SESSION + HOST STATS

### CONTEXT
- File: `src/pages/HostDashboard.tsx` (379 lines)
- The page has two views: "list" (session list) and "create" (CreateSessionForm)
- `myOwnSessions` is an array of sessions the current host has created
- The CreateSessionForm component takes props `onDone` (callback) and `hostId` (string) and `venueId` (string | undefined)
- Session creation fields: format (americano/mexicano), partner_type (random/fixed), name, courts, total_rounds, date, time, max_players
- Design tokens: `C` object, fonts: Barlow Condensed + DM Sans

### CHANGES — DO BOTH

#### 4A. Add "Duplicate" Button to Each Session Card

In the session list view, each session card (the `myOwnSessions.map(...)` block starting at line ~77) currently shows session info and a "View Session" button.

Add a **"↻ Repeat"** button next to the existing buttons for sessions that have status "finished" or "active". When tapped, this button should:

1. Store the session's config in a state variable: `const [prefill, setPrefill] = useState<Partial<Session> | null>(null)`
2. Set `prefill` to `{ format: s.format, partner_type: s.partner_type, name: s.name, courts: s.courts, total_rounds: s.total_rounds, max_players: s.max_players }`
3. Switch to the create view: `setView("create")`

Then modify the `CreateSessionForm` call to accept an optional `prefill` prop:
```tsx
if (view === "create") return <CreateSessionForm onDone={() => { setView("list"); setPrefill(null); }} hostId={me?.id ?? ""} venueId={venue?.id} prefill={prefill} />;
```

Inside `CreateSessionForm`, accept the `prefill` prop and use it to pre-fill the form state:
```tsx
// Add to CreateSessionForm props:
prefill?: Partial<Session> | null;

// In the component, update initial state:
const [fmt, setFmt] = useState<"americano" | "mexicano" | "">(prefill?.format || "");
const [pt, setPt] = useState<"random" | "fixed" | "">(prefill?.partner_type || "");
const [name, setName] = useState(prefill?.name ? `${prefill.name} (copy)` : "");
const [courts, setCourts] = useState(prefill?.courts || 2);
const [rounds, setRounds] = useState(prefill?.total_rounds || 4);
const [maxP, setMaxP] = useState(prefill?.max_players || 16);
// If format and partner_type are pre-filled, start at step 3 (details):
const [step, setStep] = useState(prefill?.format && prefill?.partner_type ? 3 : 1);
```

Style the Repeat button: `background: C.raised, border: 1px solid ${C.border}, color: C.muted, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer"`. On hover, show a title tooltip: "Create a new session with the same settings".

#### 4B. Add Host Stats Summary

At the top of the session list view (between the header and the session cards), add a stats summary row:

```tsx
{/* Host Stats */}
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
    <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{myOwnSessions.length}</div>
    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Sessions</div>
  </div>
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
    <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.blue }}>{myOwnSessions.filter(s => s.status === "finished").length}</div>
    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Completed</div>
  </div>
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
    <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.orange }}>{myOwnSessions.filter(s => ["active", "live"].includes(s.status)).length}</div>
    <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Active</div>
  </div>
</div>
```

Show this stats row ONLY when `myOwnSessions.length > 0` (don't show it in the empty state).

### DO NOT CHANGE
- Session creation form logic or Supabase mutation
- Admin approval workflow
- The sign-in flow
- The empty state UI
- Any other hooks or queries

---

## PROMPT 5 of 6 — VENUE ADMIN ANALYTICS OVERVIEW TAB

### CONTEXT
- File: `src/pages/AdminPage.tsx` (427 lines)
- Current tabs: `sessions | scores | tracker | settings`
- Venue data available via `useVenue()` → `{ venue, slug }`
- Admin is password-protected (venue.admin_password checked on login)
- All data queries use `(supabase.from as any)(...)` pattern with `as any` casts
- Design tokens: `C` object from `@/components/arena`

### WHAT TO CHANGE

Add a new tab **"overview"** as the FIRST tab in the admin tab bar. Make it the default active tab (change `useState<...>("sessions")` to `useState<...>("overview")`).

Update the tabs array:
```tsx
const [adminTab, setAdminTab] = useState<"overview" | "sessions" | "scores" | "tracker" | "settings">("overview");
```

Add this query inside the component (after the existing queries, only runs when `authed` and `venueId` exist):

```tsx
// Venue analytics
const { data: analytics } = useQuery({
  queryKey: ["venue-analytics", venueId],
  enabled: !!venueId && authed,
  queryFn: async () => {
    // Total registered players at this venue (via session_players who joined sessions at this venue)
    const { data: venueSessions } = await (supabase.from as any)("sessions")
      .select("id")
      .eq("venue_id", venueId!);
    const sessionIds = (venueSessions ?? []).map((s: any) => s.id);

    let totalPlayers = 0;
    let totalSessions = sessionIds.length;
    let finishedSessions = 0;

    if (sessionIds.length > 0) {
      // Count unique players
      const { data: sp } = await (supabase.from as any)("session_players")
        .select("player_id")
        .in("session_id", sessionIds)
        .eq("status", "approved");
      const uniquePlayers = new Set((sp ?? []).map((p: any) => p.player_id));
      totalPlayers = uniquePlayers.size;

      // Count finished sessions
      const { data: fin } = await (supabase.from as any)("sessions")
        .select("id")
        .eq("venue_id", venueId!)
        .eq("status", "finished");
      finishedSessions = (fin ?? []).length;
    }

    // Support economy volume
    let supportVolume = 0;
    if (sessionIds.length > 0) {
      const { data: supports } = await (supabase.from as any)("session_supports")
        .select("amount")
        .in("session_id", sessionIds);
      supportVolume = (supports ?? []).reduce((t: number, s: any) => t + (s.amount || 0), 0);
    }

    return { totalPlayers, totalSessions, finishedSessions, supportVolume };
  },
});
```

Render the overview tab content:

```tsx
{adminTab === "overview" && (
  <>
    <Divider label="📊 Venue Overview" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
      {[
        { label: "Total Players", value: analytics?.totalPlayers ?? 0, icon: "👥", color: C.green },
        { label: "Total Sessions", value: analytics?.totalSessions ?? 0, icon: "📋", color: C.blue },
        { label: "Completed", value: analytics?.finishedSessions ?? 0, icon: "✅", color: C.green },
        { label: "Support Volume", value: `Cr ${(analytics?.supportVolume ?? 0).toLocaleString()}`, icon: "💰", color: C.gold },
      ].map(stat => (
        <div key={stat.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 14px" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{stat.label}</div>
        </div>
      ))}
    </div>

    {/* Quick actions */}
    <Divider label="Quick Actions" />
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={() => setAdminTab("sessions")} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left", width: "100%" }}>
        <span style={{ fontSize: 20 }}>📋</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>Manage Sessions</div>
          <div style={{ fontSize: 11, color: C.muted }}>Approve pending sessions, manage active ones</div>
        </div>
        <span style={{ color: C.muted }}>›</span>
      </button>
      <button onClick={() => setAdminTab("scores")} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left", width: "100%" }}>
        <span style={{ fontSize: 20 }}>✅</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>Verify Scores</div>
          <div style={{ fontSize: 11, color: C.muted }}>Approve or reject submitted match scores</div>
        </div>
        <span style={{ color: C.muted }}>›</span>
      </button>
    </div>
  </>
)}
```

Add "overview" to the tab bar rendering. The tab bar is currently rendered inline — add the overview tab as the first option.

### DO NOT CHANGE
- The password authentication flow
- The sessions tab content
- The scores tab content
- The tracker tab content
- The settings tab content
- Any mutations or approval logic

---

## PROMPT 6 of 6 — POST-REGISTRATION ONBOARDING CHECKLIST

### CONTEXT
- File: `src/pages/RegisterPage.tsx` (425 lines)
- The form has 4 steps and a submitted state
- When `submitted === true`, it currently shows a simple "Thank you" screen with venue name and slug
- Design: light theme, GREEN = "#00E676", fonts: Barlow Condensed + system sans-serif

### WHAT TO CHANGE

Replace the current submitted/success state (the block that renders when `submitted === true`, approximately lines 370-425) with an **onboarding checklist** view:

```tsx
{submitted && (
  <div style={{ minHeight: "100dvh", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px" }}>
    {/* Success header */}
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
      <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
        You're In!
      </h1>
      <p style={{ fontSize: 14, color: "#666", maxWidth: 360 }}>
        <strong>{form.venue_name}</strong> has been submitted for review. Here's what happens next.
      </p>
    </div>

    {/* Checklist */}
    <div style={{ width: "100%", maxWidth: 440 }}>
      {[
        { step: 1, title: "Application Submitted", desc: "We received your venue details", status: "done" as const, icon: "✅" },
        { step: 2, title: "Under Review", desc: "Our team will review and activate within 24 hours", status: "active" as const, icon: "⏳" },
        { step: 3, title: "Get Your Branded URL", desc: `Your venue will be live at superfans.games/${form.slug}`, status: "upcoming" as const, icon: "🔗" },
        { step: 4, title: "Create Your First Session", desc: "Go to your Host Dashboard and create a padel session", status: "upcoming" as const, icon: "📋" },
        { step: 5, title: "Invite Players", desc: "Share your session link — players sign in with Google, no app needed", status: "upcoming" as const, icon: "📱" },
      ].map(item => (
        <div key={item.step} style={{ display: "flex", gap: 16, alignItems: "stretch", marginBottom: 0 }}>
          {/* Timeline line + dot */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: item.status === "done" ? "#00E676" : item.status === "active" ? "#FFF3E0" : "#f5f5f5",
              border: item.status === "active" ? "2px solid #FF8C00" : "2px solid #eee",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>
              {item.status === "done" ? "✓" : item.icon}
            </div>
            {item.step < 5 && (
              <div style={{ width: 2, flex: 1, minHeight: 20, background: item.status === "done" ? "#00E676" : "#eee" }} />
            )}
          </div>
          {/* Content */}
          <div style={{ flex: 1, paddingBottom: 20 }}>
            <div style={{
              fontSize: 15, fontWeight: 700,
              color: item.status === "upcoming" ? "#999" : "#222",
              marginBottom: 4
            }}>
              {item.title}
            </div>
            <div style={{
              fontSize: 12, color: item.status === "upcoming" ? "#bbb" : "#666",
              lineHeight: 1.5
            }}>
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Your venue info card */}
    <div style={{ width: "100%", maxWidth: 440, background: "#f9f9f9", border: "1px solid #eee", borderRadius: 14, padding: "16px 20px", marginTop: 8, marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Your Venue Details</div>
      <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#999" }}>Name</span>
          <span style={{ fontWeight: 700 }}>{form.venue_name}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#999" }}>URL</span>
          <span style={{ fontWeight: 700, color: "#00E676" }}>superfans.games/{form.slug}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#999" }}>City</span>
          <span style={{ fontWeight: 700 }}>{form.city}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#999" }}>Monthly Prize</span>
          <span style={{ fontWeight: 700 }}>{fmtRp(form.monthly_prize)}</span>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 440 }}>
      <button onClick={() => navigate("/")} style={{ width: "100%", background: "#00E676", color: "#111", border: "none", padding: "14px 0", borderRadius: 12, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
        EXPLORE SUPERFANS →
      </button>
      <a href="https://wa.me/6281218153309" target="_blank" rel="noopener noreferrer" style={{ width: "100%", textAlign: "center", background: "transparent", color: "#555", border: "1px solid #ddd", padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "block" }}>
        💬 Chat with us on WhatsApp
      </a>
    </div>
  </div>
)}
```

### DO NOT CHANGE
- The 4-step registration form itself
- The form validation logic
- The Supabase insert mutation
- The slug checker
- Any form field definitions or types
