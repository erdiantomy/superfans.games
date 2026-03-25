import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CreditsDisplay({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: player } = useQuery({
    queryKey: ["padel_player", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("padel_players")
        .select("credits")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as { credits: number } | null;
    },
  });

  if (!user || !player) return null;

  const credits = player.credits ?? 0;

  return (
    <button
      onClick={() => navigate("/topup")}
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-colors"
      style={{
        background: "hsl(var(--primary) / 0.1)",
        border: "1px solid hsl(var(--primary) / 0.3)",
        color: "hsl(var(--primary))",
      }}
    >
      <span>Cr {credits.toLocaleString("id-ID")}</span>
      <Plus size={12} />
    </button>
  );
}
