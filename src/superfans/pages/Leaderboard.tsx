// Superfans — global reputation leaderboard
import Shell from "../components/Shell";
import { Avatar, EmptyState, Spinner, TierBadge } from "../components/ui";
import { useLeaderboard } from "../lib/queries";

export default function Leaderboard() {
  const { data, isLoading } = useLeaderboard(100);

  return (
    <Shell>
      <h1 className="mb-1 text-xl font-extrabold">Leaderboard</h1>
      <p className="mb-5 text-sm text-zinc-500">Ranked by reputation points — earned by accurate predictions.</p>

      {isLoading ? <Spinner label="Loading ranks…" /> :
        data?.length ? (
          <div className="divide-y divide-zinc-900 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            {data.map((r) => (
              <div key={r.user_id} className="flex items-center gap-3 px-4 py-3">
                <span className={`w-6 text-center text-sm font-extrabold ${
                  r.position === 1 ? "text-amber-400" : r.position === 2 ? "text-zinc-300" : r.position === 3 ? "text-orange-400" : "text-zinc-500"
                }`}>{r.position}</span>
                <Avatar name={r.display_name} src={r.avatar_url} size={34} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{r.display_name}</div>
                  <div className="text-[11px] text-zinc-500">
                    {r.accuracy}% acc · {r.total_predictions} preds{r.current_streak > 1 ? ` · 🔥${r.current_streak}` : ""}
                  </div>
                </div>
                <TierBadge tier={r.tier} />
                <span className="w-14 text-right text-sm font-bold text-emerald-400">{Math.round(r.points)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No one ranked yet" subtitle="Make predictions to put yourself on the board." icon="🏆" />
        )}
    </Shell>
  );
}
