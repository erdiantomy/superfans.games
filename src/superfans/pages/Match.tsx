// Superfans — Match detail: scoreboard + prediction + match talk
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Shell from "../components/Shell";
import PredictPanel from "../components/PredictPanel";
import { StatusPill, TeamBadge, Spinner, EmptyState } from "../components/ui";
import { useMatch, useMatchRealtime } from "../lib/queries";
import { kickoffLabel } from "../lib/format";

export default function Match() {
  useMatchRealtime();
  const { id } = useParams();
  const { data: m, isLoading } = useMatch(id);

  if (isLoading) return <Shell><Spinner label="Loading match…" /></Shell>;
  if (!m) return <Shell><EmptyState title="Match not found" subtitle="It may have been removed." /></Shell>;

  const showScore = m.status === "live" || m.status === "finished";

  return (
    <Shell>
      <Link to="/matches" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-400 hover:text-zinc-200">
        <ArrowLeft size={16} /> Matches
      </Link>

      {/* Scoreboard */}
      <div className="mb-5 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="truncate text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            {m.league_name}{m.round ? ` · ${m.round}` : ""}
          </span>
          <StatusPill status={m.status} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge name={m.home_team_name} src={m.home_badge} size={56} />
            <span className="text-sm font-bold leading-tight">{m.home_team_name}</span>
          </div>
          <div className="shrink-0 text-center">
            {showScore ? (
              <div className={`text-3xl font-extrabold tabular-nums ${m.status === "live" ? "text-red-400" : ""}`}>
                {m.home_score ?? 0}<span className="px-2 text-zinc-600">-</span>{m.away_score ?? 0}
              </div>
            ) : (
              <div className="text-sm font-bold text-zinc-300">{kickoffLabel(m.kickoff_at)}</div>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge name={m.away_team_name} src={m.away_badge} size={56} />
            <span className="text-sm font-bold leading-tight">{m.away_team_name}</span>
          </div>
        </div>
        {m.venue && <div className="mt-4 text-center text-xs text-zinc-500">📍 {m.venue}</div>}
      </div>

      <PredictPanel m={m} />
    </Shell>
  );
}
