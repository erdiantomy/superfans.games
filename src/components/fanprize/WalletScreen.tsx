import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWalletTransactions, useProfile } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { TRANSACTIONS, txIcon } from "@/data/constants";
import { SectionHead } from "./UIElements";
import { container, item } from "./MotionVariants";
import { format } from "date-fns";

function fmtCr(n: number) {
  return Math.abs(n).toLocaleString("id-ID");
}

const TX_TYPE_LABELS: Record<string, string> = {
  topup: "Top Up",
  support: "Support",
  reward: "Reward",
  redeem: "Redeem",
  bonus: "Bonus",
};

const TX_TYPE_ICONS: Record<string, string> = {
  topup: "💳",
  support: "❤️",
  reward: "🏆",
  redeem: "🎁",
  bonus: "⚡",
  ...txIcon,
};

export default function WalletScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: dbTxs = [] } = useWalletTransactions(user?.id);
  const [tab, setTab] = useState<"txs" | "orders">("txs");

  // Fetch real credit balance
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

  // Fetch payment orders
  const { data: orders = [] } = useQuery({
    queryKey: ["payment_orders", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // payment_orders RLS uses player_id, need to get player first
      const { data: p } = await (supabase.from as any)("padel_players")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!p) return [];
      const { data, error } = await (supabase.from as any)("payment_orders")
        .select("id, credits_amount, price_idr, status, payment_channel, created_at, paid_at")
        .eq("player_id", p.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return [];
      return data || [];
    },
  });

  const credits = player?.credits ?? 0;
  const spBalance = profile?.points?.toLocaleString() || "0";

  // Build transaction list from DB or fallback
  const txList = dbTxs.length > 0
    ? dbTxs.map(tx => ({
        id: tx.id,
        type: tx.type,
        desc: tx.description,
        amount: tx.sp_amount,
        idr: tx.idr_amount,
        time: tx.created_at,
      }))
    : TRANSACTIONS.map(tx => ({
        id: tx.id,
        type: tx.type,
        desc: tx.desc,
        amount: 0,
        idr: 0,
        time: new Date().toISOString(),
      }));

  const statusColor: Record<string, string> = {
    paid: "text-primary",
    pending: "text-yellow-400",
    expired: "text-muted-foreground",
    failed: "text-destructive",
  };

  return (
    <motion.div
      className="px-5 pt-5 pb-24 overflow-y-auto h-full no-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <SectionHead title="WALLET" size={26} mb={20} />
      </motion.div>

      {/* Balance cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-2.5 mb-[18px]">
        <div className="gradient-card border border-subtle rounded-2xl p-4">
          <div className="text-label text-[10px] mb-1">CREDITS</div>
          <div className="font-display text-[22px] font-black text-primary">
            Cr {fmtCr(credits)}
          </div>
          <button
            onClick={() => navigate("/topup")}
            className="mt-2 w-full bg-green/10 border border-green/40 rounded-lg py-1.5 text-[11px] text-green font-semibold cursor-pointer"
          >
            Top Up
          </button>
        </div>
        <div className="gradient-card border border-subtle rounded-2xl p-4">
          <div className="text-label text-[10px] mb-1">SUPPORT POINTS</div>
          <div className="font-display text-[22px] font-black text-green">{spBalance} SP</div>
          <button className="mt-2 w-full bg-secondary/10 border border-secondary/40 rounded-lg py-1.5 text-[11px] text-secondary font-semibold cursor-pointer">
            Redeem
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-2 mb-4">
        {(["txs", "orders"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 rounded-full py-2.5 text-[12px] font-bold uppercase tracking-wide cursor-pointer transition-all"
            style={{
              backgroundColor: tab === t ? "hsl(var(--green) / 0.1)" : "hsl(var(--muted))",
              border: `1px solid ${tab === t ? "hsl(var(--green) / 0.4)" : "transparent"}`,
              color: tab === t ? "hsl(var(--green))" : "hsl(var(--label-text))",
            }}
          >
            {t === "txs" ? "Transactions" : "Top-Up History"}
          </button>
        ))}
      </motion.div>

      {/* Transactions tab */}
      {tab === "txs" && (
        <>
          {txList.length === 0 ? (
            <motion.div variants={item} className="text-center py-12">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-sm text-muted-foreground">No transactions yet</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Support players or top up to see your activity
              </div>
            </motion.div>
          ) : (
            txList.map(tx => (
              <motion.div
                key={tx.id}
                variants={item}
                className="bg-card border border-subtle rounded-lg px-3.5 py-3 mb-1.5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[16px]">
                  {TX_TYPE_ICONS[tx.type] || "↔"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    {tx.desc || TX_TYPE_LABELS[tx.type] || tx.type}
                  </div>
                  <div className="text-label text-[10px]">
                    {dbTxs.length > 0
                      ? format(new Date(tx.time), "dd MMM yyyy, HH:mm")
                      : tx.time}
                  </div>
                </div>
                <div className="text-right">
                  {tx.amount !== 0 && (
                    <div className={`font-display text-[14px] font-bold ${tx.amount >= 0 ? "text-primary" : "text-destructive"}`}>
                      {tx.amount >= 0 ? "+" : ""}{fmtCr(tx.amount)} Cr
                    </div>
                  )}
                  {tx.idr > 0 && (
                    <div className="text-label text-[10px]">
                      Rp {Math.abs(tx.idr).toLocaleString("id-ID")}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </>
      )}

      {/* Top-Up History tab */}
      {tab === "orders" && (
        <>
          {orders.length === 0 ? (
            <motion.div variants={item} className="text-center py-12">
              <div className="text-3xl mb-2">💳</div>
              <div className="text-sm text-muted-foreground">No top-ups yet</div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Purchase credits to support your favorite players
              </div>
              <button
                onClick={() => navigate("/topup")}
                className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm"
              >
                Top Up Now
              </button>
            </motion.div>
          ) : (
            orders.map((order: any) => (
              <motion.div
                key={order.id}
                variants={item}
                className="bg-card border border-subtle rounded-lg px-3.5 py-3 mb-1.5 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[16px]">
                  {order.status === "paid" ? "✅" : order.status === "pending" ? "⏳" : "❌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">
                    Cr {fmtCr(order.credits_amount)} Credit Top-Up
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-label text-[10px]">
                      {format(new Date(order.created_at), "dd MMM yyyy, HH:mm")}
                    </div>
                    {order.payment_channel && (
                      <div className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {order.payment_channel}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-bold">
                    Rp {order.price_idr.toLocaleString("id-ID")}
                  </div>
                  <div className={`text-[10px] font-semibold uppercase ${statusColor[order.status] || "text-muted-foreground"}`}>
                    {order.status}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </>
      )}
    </motion.div>
  );
}