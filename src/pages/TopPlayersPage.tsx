import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDivision } from "@/lib/gamification";
import { motion } from "framer-motion";
import MarketingLayout from "@/components/MarketingLayout";

interface FeaturedPlayer {
  player_id: string;
  display_name: string;
  slug: string;
  avatar_url: string | null;
  division: string | null;
  win_rate: number | null;
  games_played: number | null;
  supporter_count: number | null;
  lifetime_xp: number | null;
}

export default function TopPlayersPage() {
  const navigate = useNavigate();
  const { data: players = [], isLoading } = useQuery({
    queryKey: ["featured-players"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("player_profile_full")
        .select("player_id, display_name, slug, avatar_url, division, win_rate, games_played, supporter_count, lifetime_xp")
        .eq("is_public", true)
        .order("lifetime_xp", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as FeaturedPlayer[];
    },
  });

  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">Top Players</h1>
        <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
          The highest-ranked players on SuperFans. Claim your profile and join them.
        </p>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Loading players…</div>
        ) : players.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No players yet. Be the first to claim your profile!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {players.map((p, i) => {
              const div = getDivision(p.lifetime_xp || 0);
              return (
                <motion.div
                  key={p.player_id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/${p.slug}`)}
                  className="bg-card border border-border rounded-2xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div
                    className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-extrabold font-display"
                    style={{
                      background: `${div.color}15`,
                      border: `2px solid ${div.color}40`,
                      color: div.color,
                    }}
                  >
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      p.display_name?.slice(0, 2).toUpperCase() || "??"
                    )}
                  </div>
                  <div className="font-bold text-sm mb-1">{p.display_name}</div>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${div.color}12`, color: div.color, border: `1px solid ${div.color}30` }}
                  >
                    {div.label}
                  </span>
                  <div className="flex justify-center gap-3 text-[11px] text-muted-foreground mt-2">
                    <span>{p.win_rate != null ? `${Math.round(p.win_rate)}% WR` : "–"}</span>
                    <span>{p.games_played ?? 0} games</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}
