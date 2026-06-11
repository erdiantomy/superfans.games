// Superfans — football data layer (typed Supabase queries + React Query hooks)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase as _supabase } from "@/integrations/supabase/client";
// Superfans sf_* tables are not yet present in the generated Supabase types.
// Cast to any here so this data layer compiles; runtime calls remain unchanged.
const supabase = _supabase as any;

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type Pick = "home" | "away" | "draw";
export type PredictionStatus = "pending" | "correct" | "incorrect" | "void";

export interface SFMatch {
  id: string;
  league_id: string | null;
  league_name: string | null;
  season: string | null;
  round: string | null;
  home_team_name: string;
  away_team_name: string;
  home_badge: string | null;
  away_badge: string | null;
  status: MatchStatus;
  kickoff_at: string | null;
  home_score: number | null;
  away_score: number | null;
  winner: Pick | null;
  venue: string | null;
  thumb_url: string | null;
}

export interface SFLeague {
  id: string; name: string; slug: string; country: string | null;
  badge_url: string | null; priority: number;
}

export interface SFPrediction {
  id: string; user_id: string; match_id: string; pick: Pick;
  confidence: number; status: PredictionStatus; points_awarded: number | null;
  created_at: string; resolved_at: string | null;
}

export interface SFReputation {
  user_id: string; accuracy: number; total_predictions: number;
  correct_predictions: number; points: number; current_streak: number;
  best_streak: number; tier: string;
}

export interface SFLeaderRow {
  user_id: string; display_name: string; username: string | null;
  avatar_url: string | null; points: number; accuracy: number;
  total_predictions: number; correct_predictions: number;
  current_streak: number; tier: string; position: number;
}

export interface SFPost {
  id: string; author_id: string; match_id: string | null; body: string;
  like_count: number; created_at: string;
  author?: { display_name: string; username: string | null; avatar_url: string | null } | null;
  match?: { home_team_name: string; away_team_name: string; league_name: string | null } | null;
  liked?: boolean;
}

export type MatchFilter = "live" | "today" | "upcoming" | "finished" | "all";

// ---------------------------------------------------------------- Leagues
export function useLeagues() {
  return useQuery({
    queryKey: ["sf", "leagues"],
    queryFn: async (): Promise<SFLeague[]> => {
      const { data, error } = await supabase
        .from("sf_leagues").select("id,name,slug,country,badge_url,priority")
        .order("priority", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SFLeague[];
    },
    staleTime: 5 * 60_000,
  });
}

// ---------------------------------------------------------------- Matches
const MATCH_COLS =
  "id,league_id,league_name,season,round,home_team_name,away_team_name,home_badge,away_badge,status,kickoff_at,home_score,away_score,winner,venue,thumb_url";

export function useMatches(filter: MatchFilter = "today", leagueId?: string) {
  return useQuery({
    queryKey: ["sf", "matches", filter, leagueId ?? "all"],
    queryFn: async (): Promise<SFMatch[]> => {
      let q = supabase.from("sf_matches").select(MATCH_COLS);
      if (leagueId) q = q.eq("league_id", leagueId);
      const now = new Date();
      if (filter === "live") {
        q = q.eq("status", "live");
      } else if (filter === "upcoming") {
        q = q.eq("status", "scheduled").gte("kickoff_at", now.toISOString())
             .order("kickoff_at", { ascending: true });
      } else if (filter === "finished") {
        q = q.eq("status", "finished").order("kickoff_at", { ascending: false });
      } else if (filter === "today") {
        const start = new Date(now); start.setUTCHours(0, 0, 0, 0);
        const end = new Date(start.getTime() + 48 * 3600_000);
        q = q.gte("kickoff_at", start.toISOString()).lt("kickoff_at", end.toISOString())
             .order("kickoff_at", { ascending: true });
      } else {
        q = q.order("kickoff_at", { ascending: true });
      }
      const { data, error } = await q.limit(100);
      if (error) throw error;
      const rows = (data ?? []) as SFMatch[];
      // live first, then soonest
      return rows.sort((a, b) => {
        if ((a.status === "live") !== (b.status === "live")) return a.status === "live" ? -1 : 1;
        return (a.kickoff_at ?? "").localeCompare(b.kickoff_at ?? "");
      });
    },
    staleTime: 20_000,
    refetchInterval: filter === "live" ? 30_000 : 60_000,
  });
}

export function useMatch(id?: string) {
  return useQuery({
    enabled: !!id,
    queryKey: ["sf", "match", id],
    queryFn: async (): Promise<SFMatch | null> => {
      const { data, error } = await supabase.from("sf_matches").select(MATCH_COLS).eq("id", id!).maybeSingle();
      if (error) throw error;
      return (data as SFMatch) ?? null;
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// Community prediction split for a match
export function useMatchSplit(matchId?: string) {
  return useQuery({
    enabled: !!matchId,
    queryKey: ["sf", "split", matchId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sf_predictions").select("pick").eq("match_id", matchId!);
      if (error) throw error;
      const counts = { home: 0, away: 0, draw: 0, total: 0 };
      (data ?? []).forEach((r: { pick: Pick }) => { counts[r.pick]++; counts.total++; });
      return counts;
    },
    staleTime: 20_000,
    refetchInterval: 45_000,
  });
}

// ---------------------------------------------------------------- Predictions
export function useMyPrediction(matchId?: string, userId?: string) {
  return useQuery({
    enabled: !!matchId && !!userId,
    queryKey: ["sf", "myPrediction", matchId, userId],
    queryFn: async (): Promise<SFPrediction | null> => {
      const { data, error } = await supabase.from("sf_predictions").select("*")
        .eq("match_id", matchId!).eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return (data as SFPrediction) ?? null;
    },
  });
}

export function useSubmitPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { matchId: string; userId: string; pick: Pick; confidence: number }) => {
      const { data, error } = await supabase.from("sf_predictions")
        .insert({ match_id: v.matchId, user_id: v.userId, pick: v.pick, confidence: v.confidence })
        .select("*").single();
      if (error) throw error;
      return data as SFPrediction;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["sf", "myPrediction", v.matchId] });
      qc.invalidateQueries({ queryKey: ["sf", "split", v.matchId] });
      qc.invalidateQueries({ queryKey: ["sf", "userPredictions", v.userId] });
    },
  });
}

export function useUserPredictions(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["sf", "userPredictions", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("sf_predictions")
        .select("*, match:sf_matches(id,home_team_name,away_team_name,league_name,status,home_score,away_score,kickoff_at,winner)")
        .eq("user_id", userId!).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

// ---------------------------------------------------------------- Reputation
export function useReputation(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["sf", "reputation", userId],
    queryFn: async (): Promise<SFReputation | null> => {
      const { data, error } = await supabase.from("sf_reputation").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return (data as SFReputation) ?? null;
    },
  });
}

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: ["sf", "leaderboard", limit],
    queryFn: async (): Promise<SFLeaderRow[]> => {
      const { data, error } = await supabase.from("sf_leaderboard").select("*")
        .order("position", { ascending: true }).limit(limit);
      if (error) throw error;
      return (data ?? []) as SFLeaderRow[];
    },
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------- Feed
export function useFeed(userId?: string) {
  return useQuery({
    queryKey: ["sf", "feed", userId ?? "anon"],
    queryFn: async (): Promise<SFPost[]> => {
      const { data, error } = await supabase.from("sf_posts")
        .select("id,author_id,match_id,body,like_count,created_at, match:sf_matches(home_team_name,away_team_name,league_name)")
        .is("deleted_at", null).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      const posts = (data ?? []) as unknown as SFPost[];
      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      if (authorIds.length) {
        const { data: profs } = await supabase.from("profiles")
          .select("user_id,display_name,username,avatar_url").in("user_id", authorIds);
        const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
        posts.forEach((p) => {
          const pr: any = map.get(p.author_id);
          p.author = pr ? { display_name: pr.display_name, username: pr.username, avatar_url: pr.avatar_url } : null;
        });
      }
      if (userId && posts.length) {
        const { data: likes } = await supabase.from("sf_post_likes")
          .select("post_id").eq("user_id", userId).in("post_id", posts.map((p) => p.id));
        const liked = new Set((likes ?? []).map((l) => l.post_id));
        posts.forEach((p) => { p.liked = liked.has(p.id); });
      }
      return posts;
    },
    staleTime: 20_000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { authorId: string; body: string; matchId?: string; predictionId?: string }) => {
      const { data, error } = await supabase.from("sf_posts")
        .insert({ author_id: v.authorId, body: v.body, match_id: v.matchId ?? null, prediction_id: v.predictionId ?? null })
        .select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sf", "feed"] }),
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { postId: string; userId: string; liked: boolean }) => {
      if (v.liked) {
        const { error } = await supabase.from("sf_post_likes").delete()
          .eq("post_id", v.postId).eq("user_id", v.userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("sf_post_likes")
          .insert({ post_id: v.postId, user_id: v.userId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sf", "feed"] }),
  });
}

// ---------------------------------------------------------------- Realtime
/** Subscribe to live match score/status changes and refresh queries. */
export function useMatchRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("sf_matches_live")
      .on("postgres_changes", { event: "*", schema: "public", table: "sf_matches" }, () => {
        qc.invalidateQueries({ queryKey: ["sf", "matches"] });
        qc.invalidateQueries({ queryKey: ["sf", "match"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);
}
