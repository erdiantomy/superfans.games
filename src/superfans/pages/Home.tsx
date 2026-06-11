// Superfans — Home: hero + today's football + ranks/feed previews
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Shell from "../components/Shell";
import MatchCard from "../components/MatchCard";
import { Composer, PostCard } from "../components/Feed";
import { Avatar, EmptyState, SectionTitle, Spinner, TierBadge } from "../components/ui";
import {
  useFeed, useLeaderboard, useMatches, useMatchRealtime,
} from "../lib/queries";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  useMatchRealtime();
  const { user } = useAuth();
  const live = useMatches("live");
  const today = useMatches("today");
  const board = useLeaderboard(5);
  const feed = useFeed(user?.id);

  const liveMatches = live.data ?? [];
  const todayMatches = (today.data ?? []).filter((m) => m.status !== "live").slice(0, 6);

  return (
    <Shell>
      {/* Hero */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-950 p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">FIFA World Cup 2026 · Live</div>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight">
          Where sports fans<br />become <span className="text-emerald-400">legends</span>.
        </h1>
        <p className="mt-2 max-w-md text-sm text-zinc-400">
          Predict matches, build your reputation, climb the ranks. No betting — pure football knowledge.
        </p>
        <div className="mt-4 flex gap-2">
          <Link to="/matches" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400">
            Predict now
          </Link>
          {!user && (
            <Link to="/login" className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-zinc-500">
              Join free
            </Link>
          )}
        </div>
      </section>

      {/* Live */}
      {liveMatches.length > 0 && (
        <section className="mb-6">
          <SectionTitle>🔴 Live now</SectionTitle>
          <div className="space-y-3">{liveMatches.map((m) => <MatchCard key={m.id} m={m} />)}</div>
        </section>
      )}

      {/* Today / upcoming */}
      <section className="mb-6">
        <SectionTitle action={<Link to="/matches" className="flex items-center text-xs font-semibold text-emerald-400">All <ChevronRight size={14} /></Link>}>
          ⚽ Matches to predict
        </SectionTitle>
        {today.isLoading ? <Spinner /> :
          todayMatches.length ? (
            <div className="space-y-3">{todayMatches.map((m) => <MatchCard key={m.id} m={m} />)}</div>
          ) : (
            <EmptyState title="No upcoming matches loaded yet" subtitle="Fixtures refresh automatically every few minutes." />
          )}
      </section>

      {/* Leaderboard preview */}
      <section className="mb-6">
        <SectionTitle action={<Link to="/leaderboard" className="flex items-center text-xs font-semibold text-emerald-400">Full ranks <ChevronRight size={14} /></Link>}>
          🏆 Top predictors
        </SectionTitle>
        {board.isLoading ? <Spinner /> :
          board.data?.length ? (
            <div className="divide-y divide-zinc-900 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              {board.data.map((r) => (
                <div key={r.user_id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-5 text-center text-sm font-bold text-zinc-500">{r.position}</span>
                  <Avatar name={r.display_name} src={r.avatar_url} size={30} />
                  <span className="flex-1 truncate text-sm font-semibold">{r.display_name}</span>
                  <TierBadge tier={r.tier} />
                  <span className="w-16 text-right text-sm font-bold text-emerald-400">{Math.round(r.points)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No predictors ranked yet" subtitle="Make the first prediction and top the board." icon="🥇" />
          )}
      </section>

      {/* Feed preview */}
      <section>
        <SectionTitle action={<Link to="/feed" className="flex items-center text-xs font-semibold text-emerald-400">Open feed <ChevronRight size={14} /></Link>}>
          🗣️ Fan feed
        </SectionTitle>
        <div className="space-y-3">
          <Composer />
          {(feed.data ?? []).slice(0, 3).map((p) => <PostCard key={p.id} p={p} />)}
        </div>
      </section>
    </Shell>
  );
}
