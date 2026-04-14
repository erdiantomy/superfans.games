import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlayerNotification {
  id: string;
  player_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export function usePlayerNotifications(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player_notifications", playerId],
    enabled: !!playerId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("player_notifications")
        .select("*")
        .eq("player_id", playerId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as PlayerNotification[];
    },
  });
}

export function usePlayerUnreadCount(playerId: string | undefined) {
  return useQuery({
    queryKey: ["player_notifications_unread", playerId],
    enabled: !!playerId,
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from("player_notifications")
        .select("id", { count: "exact", head: true })
        .eq("player_id", playerId!)
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMarkPlayerNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("player_notifications")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["player_notifications"] });
      qc.invalidateQueries({ queryKey: ["player_notifications_unread"] });
    },
  });
}

export function useMarkAllPlayerNotificationsRead(playerId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!playerId) return;
      const { error } = await (supabase as any)
        .from("player_notifications")
        .update({ read: true })
        .eq("player_id", playerId)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["player_notifications"] });
      qc.invalidateQueries({ queryKey: ["player_notifications_unread"] });
    },
  });
}

export function usePlayerNotificationRealtime(playerId: string | undefined) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!playerId) return;

    const ch = supabase
      .channel(`player-notifications-${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "player_notifications",
          filter: `player_id=eq.${playerId}`,
        },
        (payload: any) => {
          qc.invalidateQueries({ queryKey: ["player_notifications", playerId] });
          qc.invalidateQueries({ queryKey: ["player_notifications_unread", playerId] });

          const n = payload.new as PlayerNotification | undefined;
          if (n?.title) {
            toast(n.title, { description: n.body });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [playerId, qc]);
}
