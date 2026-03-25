import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface WalletTx {
  id: string;
  type: string;
  description: string;
  idr_amount: number;
  sp_amount: number;
  created_at: string;
}

function fmtRp(n: number) {
  return "Rp " + Math.abs(n).toLocaleString("id-ID");
}

function fmtCr(n: number) {
  const abs = Math.abs(n).toLocaleString("id-ID");
  return n >= 0 ? `+${abs} Cr` : `-${abs} Cr`;
}

export default function TransactionHistory() {
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

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["wallet_transactions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as WalletTx[];
    },
  });

  return (
    <div>
      {/* Balance header */}
      {player && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 text-center">
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Credits Balance</div>
          <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Cr {Math.abs(player.credits).toLocaleString("id-ID")}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-xs text-muted-foreground">Loading transactions...</div>
      ) : txs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">📭</div>
          <div className="text-sm text-muted-foreground">No transactions yet</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {txs.map(tx => {
            const isPositive = tx.sp_amount >= 0;
            return (
              <div key={tx.id} className="bg-card border border-border rounded-xl px-3 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{tx.description || tx.type}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm")}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {tx.idr_amount > 0 && (
                    <div className="text-[10px] text-muted-foreground">{fmtRp(tx.idr_amount)}</div>
                  )}
                  <div className={`text-xs font-bold ${isPositive ? "text-primary" : "text-destructive"}`}>
                    {fmtCr(tx.sp_amount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
