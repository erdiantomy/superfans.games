// Superfans — match card for lists
import { Link } from "react-router-dom";
import type { SFMatch } from "../lib/queries";
import { kickoffLabel } from "../lib/format";
import { StatusPill, TeamBadge } from "./ui";

export default function MatchCard({ m }: { m: SFMatch }) {
  const live = m.status === "live";
  const done = m.status === "finished";
  const showScore = live || done;
  return (
    <Link
      to={`/m/${m.id}`}
      className="block rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {m.league_name}{m.round ? ` · ${m.round}` : ""}
        </span>
        <StatusPill status={m.status} />
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex flex-1 items-center gap-2.5 overflow-hidden">
          <TeamBadge name={m.home_team_name} src={m.home_badge} size={34} />
          <span className="truncate text-sm font-semibold">{m.home_team_name}</span>
        </div>

        {/* Center: score or time */}
        <div className="shrink-0 px-1 text-center">
          {showScore ? (
            <div className={`text-lg font-extrabold tabular-nums ${live ? "text-red-400" : "text-zinc-100"}`}>
              {m.home_score ?? 0}<span className="px-1 text-zinc-600">-</span>{m.away_score ?? 0}
            </div>
          ) : (
            <div className="text-xs font-semibold text-zinc-400">{kickoffLabel(m.kickoff_at)}</div>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-1 items-center justify-end gap-2.5 overflow-hidden">
          <span className="truncate text-right text-sm font-semibold">{m.away_team_name}</span>
          <TeamBadge name={m.away_team_name} src={m.away_badge} size={34} />
        </div>
      </div>

      {!showScore && (
        <div className="mt-3 flex items-center justify-center">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
            Tap to predict →
          </span>
        </div>
      )}
    </Link>
  );
}
