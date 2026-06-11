// Superfans — Matches: filter by status + league
import { useState } from "react";
import Shell from "../components/Shell";
import MatchCard from "../components/MatchCard";
import { EmptyState, Spinner } from "../components/ui";
import { type MatchFilter, useLeagues, useMatches, useMatchRealtime } from "../lib/queries";

const FILTERS: { key: MatchFilter; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "finished", label: "Results" },
];

export default function Matches() {
  useMatchRealtime();
  const [filter, setFilter] = useState<MatchFilter>("today");
  const [leagueId, setLeagueId] = useState<string | undefined>(undefined);
  const { data: leagues } = useLeagues();
  const { data, isLoading } = useMatches(filter, leagueId);

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-extrabold">Matches</h1>

      {/* Status filter */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${
              filter === f.key ? "bg-emerald-500 text-zinc-950" : "border border-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* League filter */}
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setLeagueId(undefined)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
            !leagueId ? "bg-zinc-100 text-zinc-900" : "border border-zinc-800 text-zinc-400 hover:border-zinc-600"
          }`}>
          All competitions
        </button>
        {(leagues ?? []).map((l) => (
          <button key={l.id} onClick={() => setLeagueId(l.id)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
              leagueId === l.id ? "bg-zinc-100 text-zinc-900" : "border border-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}>
            {l.name}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner label="Loading matches…" /> :
        data?.length ? (
          <div className="space-y-3">{data.map((m) => <MatchCard key={m.id} m={m} />)}</div>
        ) : (
          <EmptyState title="Nothing here right now"
            subtitle={filter === "live" ? "No matches are live at the moment." : "Try another filter — fixtures refresh automatically."} />
        )}
    </Shell>
  );
}
