import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function fmtCr(n: number) {
  return n.toLocaleString("id-ID");
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { user } = useAuth();

  const { data: player } = useQuery({
    queryKey: ["padel_player", user?.id, "post-payment"],
    enabled: !!user?.id,
    refetchInterval: 3000, // Poll briefly to catch webhook updates
    queryFn: async () => {
      const { data } = await (supabase.from as any)("padel_players")
        .select("credits")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as { credits: number } | null;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle size={40} className="text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your credits have been added to your wallet.
        </p>

        {player && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Cr {fmtCr(player.credits)}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm"
        >
          Back to Game
        </button>
      </motion.div>
    </div>
  );
}
