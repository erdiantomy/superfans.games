// Superfans — prediction panel (reputation-based pick, NOT a bet)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  type Pick, type SFMatch, useMatchSplit, useMyPrediction, useSubmitPrediction,
} from "../lib/queries";

const PCT = (n: number, total: number) => (total ? Math.round((100 * n) / total) : 0);

export default function PredictPanel({ m }: { m: SFMatch }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: mine } = useMyPrediction(m.id, user?.id);
  const { data: split } = useMatchSplit(m.id);
  const submit = useSubmitPrediction();
  const [pick, setPick] = useState<Pick | null>(null);
  const [confidence, setConfidence] = useState(60);

  const open = m.status === "scheduled" && (!m.kickoff_at || new Date(m.kickoff_at) > new Date());
  const options: { key: Pick; label: string }[] = [
    { key: "home", label: m.home_team_name },
    { key: "draw", label: "Draw" },
    { key: "away", label: m.away_team_name },
  ];

  async function onSubmit() {
    if (!user) { navigate("/login"); return; }
    if (!pick) { toast.error("Pick a result first"); return; }
    try {
      await submit.mutateAsync({ matchId: m.id, userId: user.id, pick, confidence });
      toast.success("Prediction locked in! 🎯 Reputation on the line.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit");
    }
  }

  // Already predicted — show their pick + community split
  if (mine) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-zinc-200">Your prediction</span>
          <ResultTag status={mine.status} />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-300">
            {mine.pick === "home" ? m.home_team_name : mine.pick === "away" ? m.away_team_name : "Draw"}
          </span>
          <span className="text-xs text-zinc-500">confidence {mine.confidence}%</span>
          {mine.points_awarded != null && mine.status !== "pending" && (
            <span className="ml-auto text-sm font-bold text-emerald-400">+{mine.points_awarded} pts</span>
          )}
        </div>
        <Split m={m} split={split} />
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 text-sm font-bold text-zinc-300">
          {m.status === "live" ? "Predictions are locked — match in play" : "Predictions closed"}
        </div>
        <Split m={m} split={split} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-1 text-sm font-bold text-zinc-100">Make your call</div>
      <div className="mb-4 text-xs text-zinc-500">Predict the result. No money — just reputation. Be right, climb the ranks.</div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {options.map((o) => {
          const active = pick === o.key;
          return (
            <button key={o.key} onClick={() => setPick(o.key)}
              className={`rounded-xl border px-2 py-3 text-center text-sm font-bold transition ${
                active ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                       : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700"
              }`}>
              <div className="truncate">{o.label}</div>
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>Confidence</span><span className="text-emerald-300">{confidence}%</span>
        </div>
        <input type="range" min={1} max={100} value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full accent-emerald-400" />
        <div className="mt-1 text-[11px] text-zinc-500">Higher confidence = more points when you're right.</div>
      </div>

      <button onClick={onSubmit} disabled={submit.isPending}
        className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-extrabold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60">
        {submit.isPending ? "Locking in…" : user ? "Lock in prediction 🎯" : "Sign in to predict"}
      </button>

      <div className="mt-4"><Split m={m} split={split} /></div>
    </div>
  );
}

function Split({ m, split }: { m: SFMatch; split?: { home: number; away: number; draw: number; total: number } }) {
  const s = split ?? { home: 0, away: 0, draw: 0, total: 0 };
  if (!s.total) return <div className="text-center text-xs text-zinc-600">Be the first to predict this match.</div>;
  const rows: { label: string; n: number; tone: string }[] = [
    { label: m.home_team_name, n: s.home, tone: "bg-emerald-500" },
    { label: "Draw", n: s.draw, tone: "bg-zinc-500" },
    { label: m.away_team_name, n: s.away, tone: "bg-sky-500" },
  ];
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Community · {s.total} predictions</div>
      <div className="space-y-1.5">
        {rows.map((r) => {
          const pct = PCT(r.n, s.total);
          return (
            <div key={r.label} className="flex items-center gap-2">
              <span className="w-24 truncate text-xs text-zinc-400">{r.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div className={`h-full rounded-full ${r.tone}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="w-9 text-right text-xs font-bold text-zinc-300">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultTag({ status }: { status: string }) {
  if (status === "correct") return <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">✓ Correct</span>;
  if (status === "incorrect") return <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-300">✗ Missed</span>;
  return <span className="rounded-full bg-zinc-700/40 px-2 py-0.5 text-[11px] font-bold text-zinc-300">Pending</span>;
}
