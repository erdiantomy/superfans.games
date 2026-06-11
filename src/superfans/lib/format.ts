// Superfans — small formatting helpers
import type { MatchStatus, Pick, SFMatch } from "./queries";

export function kickoffLabel(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  if (tomorrow) return `Tomorrow ${time}`;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) + ` ${time}`;
}

export function statusMeta(status: MatchStatus): { label: string; tone: string; dot?: boolean } {
  switch (status) {
    case "live": return { label: "LIVE", tone: "text-red-400 bg-red-500/15 border-red-500/30", dot: true };
    case "finished": return { label: "FT", tone: "text-zinc-300 bg-zinc-700/40 border-zinc-600/40" };
    case "postponed": return { label: "Postponed", tone: "text-amber-300 bg-amber-500/10 border-amber-500/30" };
    case "cancelled": return { label: "Cancelled", tone: "text-zinc-400 bg-zinc-700/40 border-zinc-600/40" };
    default: return { label: "Upcoming", tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" };
  }
}

export function pickLabel(m: SFMatch, p: Pick): string {
  if (p === "home") return m.home_team_name;
  if (p === "away") return m.away_team_name;
  return "Draw";
}

export function tierMeta(tier: string): { tone: string; emoji: string } {
  switch (tier) {
    case "Legend": return { tone: "text-fuchsia-300 bg-fuchsia-500/15 border-fuchsia-500/30", emoji: "👑" };
    case "Elite": return { tone: "text-amber-300 bg-amber-500/15 border-amber-500/30", emoji: "⭐" };
    case "Pro": return { tone: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30", emoji: "🔥" };
    case "Rising": return { tone: "text-sky-300 bg-sky-500/15 border-sky-500/30", emoji: "📈" };
    case "Amateur": return { tone: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30", emoji: "🎯" };
    default: return { tone: "text-zinc-300 bg-zinc-700/40 border-zinc-600/40", emoji: "🌱" };
  }
}

export function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
