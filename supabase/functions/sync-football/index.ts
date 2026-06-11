// Superfans — Football data sync (auto-updating content engine)
// Pulls fixtures + results from TheSportsDB (free) and upserts into sf_* tables.
// Sources: per-league next/past events + a day-by-day sweep across a date window
// (captures the live FIFA World Cup 2026 and all curated leagues, with rich media).
// Finished matches trigger prediction resolution + reputation updates via DB trigger.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SPORTSDB_KEY = Deno.env.get("SPORTSDB_KEY") ?? "3";
const SYNC_TOKEN = Deno.env.get("SYNC_TOKEN") ?? "superfans-sync";

// Curated leagues (by TheSportsDB idLeague). World Cup is the headline (priority 0).
const LEAGUES: Record<string, { name: string; slug: string; country: string; priority: number }> = {
  "4429": { name: "FIFA World Cup", slug: "world-cup", country: "World", priority: 0 },
  "4328": { name: "English Premier League", slug: "premier-league", country: "England", priority: 1 },
  "4480": { name: "UEFA Champions League", slug: "champions-league", country: "Europe", priority: 2 },
  "4335": { name: "Spanish La Liga", slug: "la-liga", country: "Spain", priority: 3 },
  "4331": { name: "German Bundesliga", slug: "bundesliga", country: "Germany", priority: 4 },
  "4332": { name: "Italian Serie A", slug: "serie-a", country: "Italy", priority: 5 },
  "4334": { name: "French Ligue 1", slug: "ligue-1", country: "France", priority: 6 },
};
const DAY_SWEEP = 14; // days forward to sweep via eventsday

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-sync-token",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const api = (path: string) => `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_KEY}/${path}`;

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function kickoff(ev: Record<string, unknown>): string | null {
  const ts = (ev.strTimestamp as string) || "";
  if (ts) return ts.endsWith("Z") || ts.includes("+") ? ts : ts.replace(" ", "T") + "Z";
  const d = (ev.dateEvent as string) || "";
  const t = (ev.strTime as string) || "00:00:00";
  if (d) return `${d}T${t}Z`;
  return null;
}
const FIN = new Set(["FT", "AET", "PEN", "MATCH FINISHED", "FINAL", "FINISHED"]);
const LIVE = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INPLAY", "IN PLAY"]);
const PP = new Set(["PST", "POSTP.", "POSTPONED", "SUSP"]);
const CANC = new Set(["CANC", "CANCELED", "CANCELLED", "ABD", "AWD", "WO"]);

function classify(ev: Record<string, unknown>, hs: number | null, as: number | null, ko: string | null) {
  const st = String(ev.strStatus ?? "").trim().toUpperCase();
  const postponed = String(ev.strPostponed ?? "").toLowerCase() === "yes";
  if (postponed || PP.has(st)) return { status: "postponed", winner: null as string | null };
  if (CANC.has(st)) return { status: "cancelled", winner: null };
  const looksLive = LIVE.has(st) || /^\d{1,3}('|\+)?$/.test(st);
  if (looksLive) return { status: "live", winner: null };
  const old = ko ? Date.now() - new Date(ko).getTime() > 3 * 3600 * 1000 : false;
  if (FIN.has(st) || (hs !== null && as !== null && old)) {
    const winner = hs !== null && as !== null ? (hs > as ? "home" : as > hs ? "away" : "draw") : null;
    return { status: winner ? "finished" : "scheduled", winner };
  }
  return { status: "scheduled", winner: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = new URL(req.url);
  const token = req.headers.get("x-sync-token") ?? url.searchParams.get("token") ?? "";
  if (token !== SYNC_TOKEN) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const result = { leagues: 0, teams: 0, matches: 0, errors: [] as string[] };
  const leagueId: Record<string, string> = {};
  const teamId: Record<string, string> = {};

  async function ensureLeague(ref: string, name: string, badge: string | null, country: string | null) {
    if (leagueId[ref]) return leagueId[ref];
    const meta = LEAGUES[ref];
    const payload: Record<string, unknown> = {
      external_ref: ref,
      name: meta?.name ?? name ?? "League",
      slug: slugify((meta?.slug ?? name ?? "league") + "-" + ref),
      country: meta?.country ?? country ?? null,
      sport: "Soccer",
      priority: meta?.priority ?? 100,
    };
    if (badge) { payload.badge_url = badge; payload.logo_url = badge; }
    const { data, error } = await db.from("sf_leagues")
      .upsert(payload, { onConflict: "external_ref" }).select("id").single();
    if (error) { result.errors.push(`league ${ref}: ${error.message}`); return null; }
    leagueId[ref] = data.id; result.leagues++;
    return data.id;
  }
  async function ensureTeam(extId: string | null, name: string, badge: string | null, lgRef: string) {
    if (!name) return null;
    const ref = extId || `name:${slugify(name)}`;
    if (teamId[ref]) return teamId[ref];
    const payload: Record<string, unknown> = {
      external_ref: ref, name, slug: slugify(name + "-" + ref), league_id: leagueId[lgRef] ?? null,
    };
    if (badge) payload.badge_url = badge;
    const { data, error } = await db.from("sf_teams")
      .upsert(payload, { onConflict: "external_ref" }).select("id").single();
    if (error) { result.errors.push(`team ${name}: ${error.message}`); return null; }
    teamId[ref] = data.id; result.teams++;
    return data.id;
  }
  async function upsertEvent(ev: Record<string, unknown>) {
    const lgRef = String(ev.idLeague ?? "");
    if (!LEAGUES[lgRef]) return; // stay focused on curated competitions
    await ensureLeague(lgRef, ev.strLeague as string, (ev.strLeagueBadge as string) || null, ev.strCountry as string);
    const hs = num(ev.intHomeScore);
    const as = num(ev.intAwayScore);
    const ko = kickoff(ev);
    const { status, winner } = classify(ev, hs, as, ko);
    const homeBadge = (ev.strHomeTeamBadge as string) || null;
    const awayBadge = (ev.strAwayTeamBadge as string) || null;
    const hId = await ensureTeam(ev.idHomeTeam as string, ev.strHomeTeam as string, homeBadge, lgRef);
    const aId = await ensureTeam(ev.idAwayTeam as string, ev.strAwayTeam as string, awayBadge, lgRef);
    const grp = ev.strGroup ? `Group ${ev.strGroup}` : (ev.intRound ? `Round ${ev.intRound}` : null);
    const { error } = await db.from("sf_matches").upsert({
      external_ref: String(ev.idEvent),
      league_id: leagueId[lgRef] ?? null,
      league_name: (ev.strLeague as string) || LEAGUES[lgRef].name,
      season: (ev.strSeason as string) || null,
      round: grp,
      home_team_id: hId, away_team_id: aId,
      home_team_name: (ev.strHomeTeam as string) || "Home",
      away_team_name: (ev.strAwayTeam as string) || "Away",
      home_badge: homeBadge, away_badge: awayBadge,
      status, kickoff_at: ko, home_score: hs, away_score: as, winner,
      venue: (ev.strVenue as string) || null,
      thumb_url: (ev.strThumb as string) || (ev.strPoster as string) || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "external_ref" });
    if (error) result.errors.push(`match ${ev.idEvent}: ${error.message}`);
    else result.matches++;
  }

  // Pre-seed curated leagues so FKs resolve even if no events come back.
  for (const ref of Object.keys(LEAGUES)) await ensureLeague(ref, LEAGUES[ref].name, null, LEAGUES[ref].country);

  // Source A — per-league next/past events
  for (const ref of Object.keys(LEAGUES)) {
    for (const ep of [`eventsnextleague.php?id=${ref}`, `eventspastleague.php?id=${ref}`]) {
      try {
        const res = await fetch(api(ep));
        if (!res.ok) { result.errors.push(`${ep}: HTTP ${res.status}`); continue; }
        const json = await res.json();
        for (const ev of (json?.events ?? [])) await upsertEvent(ev);
      } catch (e) { result.errors.push(`${ep}: ${e instanceof Error ? e.message : String(e)}`); }
    }
  }

  // Source B — day sweep (today .. +DAY_SWEEP), captures live World Cup + all curated fixtures
  const today = new Date();
  for (let i = 0; i <= DAY_SWEEP; i++) {
    const d = new Date(today.getTime() + i * 86400000).toISOString().slice(0, 10);
    try {
      const res = await fetch(api(`eventsday.php?d=${d}&s=Soccer`));
      if (!res.ok) { result.errors.push(`day ${d}: HTTP ${res.status}`); continue; }
      const json = await res.json();
      for (const ev of (json?.events ?? [])) await upsertEvent(ev);
    } catch (e) { result.errors.push(`day ${d}: ${e instanceof Error ? e.message : String(e)}`); }
  }

  return new Response(JSON.stringify({ ok: true, synced_at: new Date().toISOString(), ...result }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
