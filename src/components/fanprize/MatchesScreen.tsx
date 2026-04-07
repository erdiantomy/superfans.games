import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useMatches, type Match } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { idr } from "@/data/constants";
import { Avatar, LiveDot, SportTag, SupportBar, SectionHead } from "./UIElements";
import { container, item } from "./MotionVariants";

type Filter = "all" | "live" | "upcoming" | "finished";

interface MatchesProps {
  onPick: (m: Match) => void;
}

interface MySession {
  id: string;
  session_id: string;
  status: string;
  session: {
    id: string;
    name: string;
    code: string;
    format: string;
    status: string;
    scheduled_at: string | null;
    host: { name: string } | null;
  };
}

export default function MatchesScreen({ onPick }: MatchesProps) {
  const { data: matches = [], isLoading } = useMatches();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");

  // Fetch sessions the current user has joined/requested
  const { data: mySessions = [] } = useQuery({
    queryKey: ["my-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get player id first
      const { data: player } = await (supabase as any)
        .from("padel_players")
        .select("id")
        .eq("user_id", user!.id)
        .single();
      if (!player) return [];

      const { data, error } = await (supabase as any)
        .from("session_players")
        .select("id, session_id, status, session:sessions!session_players_session_id_fkey(id, name, code, format, status, scheduled_at, host:padel_players!sessions_host_id_fkey(name))")
        .eq("player_id", player.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MySession[];
    },
  });

  const filtered = filter === "all" ? matches : matches.filter(m => m.status === filter);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: matches.length },
    { id: "live", label: "🔴 Live", count: matches.filter(m => m.status === "live").length },
    { id: "upcoming", label: "Upcoming", count: matches.filter(m => m.status === "upcoming").length },
    { id: "finished", label: "Finished", count: matches.filter(m => m.status === "finished").length },
  ];

  const statusColor = (s: string) => {
    switch (s) {
      case "approved": return "bg-green/15 text-green border-green/30";
      case "pending": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "rejected": return "bg-red-500/15 text-red-400 border-red-500/30";
      default: return "bg-muted/15 text-muted-foreground border-muted/30";
    }
  };

  const sessionStatusColor = (s: string) => {
    switch (s) {
      case "live": return "bg-green/15 text-green";
      case "active": return "bg-blue/15 text-blue";
      case "finished": return "bg-muted/15 text-muted-foreground";
      default: return "bg-muted/15 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-label text-[14px]">Loading matches...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-5 pt-5 pb-24 overflow-y-auto h-full no-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-4">
        <h1 className="font-display text-[24px] font-black">Matches</h1>
        <p className="text-label text-[12px]">{matches.length} total matches</p>
      </motion.div>

      {/* My Sessions */}
      {user && mySessions.length > 0 && (
        <motion.div variants={item} className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[14px]">🎾</span>
            <h2 className="font-display text-[16px] font-bold">My Sessions</h2>
            <span className="text-label text-[10px] bg-card border border-subtle rounded-full px-2 py-0.5">{mySessions.length}</span>
          </div>
          {mySessions.map(ms => (
            <div
              key={ms.id}
              className="bg-card border border-subtle rounded-[12px] p-3 mb-2"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-display text-[13px] font-bold flex-1 truncate">{ms.session?.name || "Session"}</div>
                <div className="flex gap-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusColor(ms.status)}`}>
                    {ms.status === "approved" ? "✓ JOINED" : ms.status === "pending" ? "⏳ PENDING" : ms.status.toUpperCase()}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sessionStatusColor(ms.session?.status)}`}>
                    {ms.session?.status === "active" ? "UPCOMING" : (ms.session?.status || "").toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-label text-[10px]">
                <span>{ms.session?.format?.toUpperCase()}</span>
                {ms.session?.host && <span>· Host: {ms.session.host.name.split(" ")[0]}</span>}
                {ms.session?.scheduled_at && (
                  <span>· {new Date(ms.session.scheduled_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-colors ${
              filter === f.id
                ? "bg-green/15 border-green/40 text-green"
                : "bg-card border-subtle text-label hover:bg-accent"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </motion.div>

      {/* Match List */}
      {filtered.length === 0 && (
        <motion.div variants={item} className="text-center py-12">
          <div className="text-[40px] mb-3">⚔️</div>
          <div className="font-display text-[16px] font-bold text-muted-foreground">No matches found</div>
          <div className="text-label text-[12px] mt-1">Check back later for new matches</div>
        </motion.div>
      )}

      {filtered.map(m => (
        <motion.div
          key={m.id}
          variants={item}
          whileTap={{ scale: 0.97 }}
          onClick={() => onPick(m)}
          className="bg-card border border-subtle rounded-[14px] p-4 mb-3 cursor-pointer hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2 mb-2.5">
            {m.status === "live" && <LiveDot />}
            <SportTag sport={m.pA.sport} />
            <span className="text-label text-[10px] flex-1">{m.title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              m.status === "live" ? "bg-green/15 text-green" :
              m.status === "upcoming" ? "bg-blue/15 text-blue" :
              "bg-muted/15 text-muted-foreground"
            }`}>
              {m.status.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar s={m.pA.av} size={36} />
              <div>
                <div className="font-display text-[14px] font-bold">{m.pA.name.split(" ")[0]}</div>
                <div className="text-label text-[9px]">{m.pA.tier}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="font-display text-[22px] font-black">
                <span className="text-green">{m.sA}</span>
                <span className="text-muted-foreground mx-1">:</span>
                <span className="text-blue">{m.sB}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-row-reverse">
              <Avatar s={m.pB.av} size={36} color="hsl(var(--blue))" />
              <div className="text-right">
                <div className="font-display text-[14px] font-bold">{m.pB.name.split(" ")[0]}</div>
                <div className="text-label text-[9px]">{m.pB.tier}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-label text-[10px]">{m.fans} supporters</div>
            <div className="font-display text-[14px] font-bold text-green">{idr(m.pool)}</div>
          </div>

          {m.status !== "finished" && (
            <div className="mt-2">
              <SupportBar a={m.supA} b={m.supB} />
            </div>
          )}

          {m.status === "finished" && m.winner && (
            <div className="mt-2 text-[11px] text-green font-semibold">
              🏆 {m.winner.name} wins
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
