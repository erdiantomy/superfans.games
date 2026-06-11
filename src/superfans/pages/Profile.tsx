// Superfans — my profile: reputation + prediction history
import { Link, useNavigate } from "react-router-dom";
import Shell from "../components/Shell";
import { Avatar, EmptyState, Spinner, TierBadge } from "../components/ui";
import { useReputation, useUserPredictions } from "../lib/queries";
import { useAuth } from "@/hooks/useAuth";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3 text-center">
      <div className="text-xl font-extrabold text-emerald-400">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: rep, isLoading } = useReputation(user?.id);
  const { data: preds } = useUserPredictions(user?.id);

  if (!user) {
    return (
      <Shell>
        <EmptyState title="Sign in to see your profile"
          subtitle="Track your accuracy, reputation and prediction history." icon="👤" />
        <div className="mt-4 text-center">
          <Link to="/login" className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-zinc-950">Sign in</Link>
        </div>
      </Shell>
    );
  }

  const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Fan";

  return (
    <Shell>
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={name} src={user.user_metadata?.avatar_url} size={64} />
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold">{name}</div>
          <div className="mt-1"><TierBadge tier={rep?.tier ?? "Rookie"} /></div>
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="mb-6 grid grid-cols-4 gap-2">
          <Stat label="Points" value={Math.round(rep?.points ?? 0)} />
          <Stat label="Accuracy" value={`${rep?.accuracy ?? 0}%`} />
          <Stat label="Preds" value={rep?.total_predictions ?? 0} />
          <Stat label="Streak" value={rep?.current_streak ?? 0} />
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Your predictions</h2>
      {!preds?.length ? (
        <EmptyState title="No predictions yet" subtitle="Pick a match and lock in your first call." icon="🎯" />
      ) : (
        <div className="space-y-2">
          {preds.map((p: any) => {
            const m = p.match;
            const tone = p.status === "correct" ? "text-emerald-400" : p.status === "incorrect" ? "text-red-400" : "text-zinc-400";
            const pickName = !m ? p.pick : p.pick === "home" ? m.home_team_name : p.pick === "away" ? m.away_team_name : "Draw";
            return (
              <Link key={p.id} to={m ? `/m/${m.id}` : "#"}
                className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m ? `${m.home_team_name} v ${m.away_team_name}` : "Match"}</div>
                  <div className="text-[11px] text-zinc-500">Pick: {pickName} · {p.confidence}%</div>
                </div>
                {m && (m.status === "finished" || m.status === "live") && (
                  <span className="text-sm font-bold tabular-nums text-zinc-300">{m.home_score ?? 0}-{m.away_score ?? 0}</span>
                )}
                <span className={`text-xs font-bold ${tone}`}>
                  {p.status === "correct" ? `✓ +${p.points_awarded ?? 0}` : p.status === "incorrect" ? "✗" : "•"}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <button onClick={async () => { await signOut(); navigate("/"); }}
        className="mt-8 w-full rounded-xl border border-zinc-800 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200">
        Sign out
      </button>
    </Shell>
  );
}
