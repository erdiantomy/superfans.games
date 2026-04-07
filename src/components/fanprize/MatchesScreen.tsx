import { useState } from "react";
import { motion } from "framer-motion";
import { useMatches, type Match } from "@/hooks/useData";
import { idr } from "@/data/constants";
import { Avatar, LiveDot, SportTag, SupportBar, SectionHead } from "./UIElements";
import { container, item } from "./MotionVariants";

type Filter = "all" | "live" | "upcoming" | "finished";

interface MatchesProps {
  onPick: (m: Match) => void;
}

export default function MatchesScreen({ onPick }: MatchesProps) {
  const { data: matches = [], isLoading } = useMatches();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? matches : matches.filter(m => m.status === filter);

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: matches.length },
    { id: "live", label: "🔴 Live", count: matches.filter(m => m.status === "live").length },
    { id: "upcoming", label: "Upcoming", count: matches.filter(m => m.status === "upcoming").length },
    { id: "finished", label: "Finished", count: matches.filter(m => m.status === "finished").length },
  ];

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
