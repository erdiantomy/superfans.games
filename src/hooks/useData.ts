import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MatchRow = Database["public"]["Tables"]["matches"]["Row"];

export interface Player {
  id: string;
  name: string;
  av: string;
  sport: string;
  tier: string;
  win: number;
}

export interface Match {
  id: string;
  title: string;
  pA: Player;
  pB: Player;
  status: "live" | "upcoming" | "finished";
  sA: number;
  sB: number;
  pool: number;
  supA: number;
  supB: number;
  fans: number;
  winner?: Player;
}

function rowToMatch(r: MatchRow): Match {
  const pA: Player = {
    id: `${r.id}-a`,
    name: r.player_a_name,
    av: r.player_a_avatar,
    sport: r.player_a_sport,
    tier: r.player_a_tier,
    win: r.player_a_win_rate,
  };
  const pB: Player = {
    id: `${r.id}-b`,
    name: r.player_b_name,
    av: r.player_b_avatar,
    sport: r.player_b_sport,
    tier: r.player_b_tier,
    win: r.player_b_win_rate,
  };
  return {
    id: r.id,
    title: r.title,
    pA,
    pB,
    status: r.status,
    sA: r.score_a,
    sB: r.score_b,
    pool: r.pool,
    supA: r.support_a,
    supB: r.support_b,
    fans: r.fans,
    winner: r.winner === "a" ? pA : r.winner === "b" ? pB : undefined,
  };
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToMatch);
    },
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useWalletTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: ["wallet_transactions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, points")
        .order("points", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data || []).map((p, i) => ({
        rank: i + 1,
        user: p.username || "Anonymous",
        pts: p.points,
        avatar: p.avatar_url,
        badge: i === 0 ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐",
      }));
    },
  });
}
