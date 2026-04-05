import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, ChevronLeft, Zap, Star, Crown, Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_idr: number;
  bonus_pct: number;
  is_active: boolean;
  sort_order: number;
}

function fmtRp(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function fmtCr(n: number) {
  return n.toLocaleString("id-ID");
}

const ICONS: Record<string, typeof Zap> = {
  Starter: Zap,
  Regular: Star,
  Pro: Crown,
  Elite: Gem,
};

const PAYMENT_METHODS = ["GoPay", "OVO", "DANA", "ShopeePay", "QRIS"];

export default function TopUpPage() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [processing, setProcessing] = useState<string | null>(null);

  // Fetch player credits
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

  // Fetch packages
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["credit_packages"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CreditPackage[];
    },
  });

  const handleBuy = async (pkg: CreditPackage) => {
    if (!session?.access_token) {
      toast.error("Please sign in to purchase credits");
      navigate("/auth");
      return;
    }

    setProcessing(pkg.id);
    try {
      const res = await supabase.functions.invoke("create-payment", {
        body: { package_id: pkg.id },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data as { success: boolean; invoice_url: string; error?: string };
      if (!data.success) {
        const errMsg = data.error || "Payment failed";
        const friendlyMessages: Record<string, string> = {
          "Not authenticated": "You need to sign in before purchasing credits.",
          "Invalid token": "Your session has expired. Please sign in again.",
          "Missing package_id": "No package selected. Please try again.",
          "Package not found": "This credit package is no longer available.",
          "Player not found": "Your player profile wasn't found. Please sign out and sign in again.",
          "Failed to create order": "We couldn't create your order. Please try again later.",
          "Payment gateway error": "The payment gateway is temporarily unavailable. Please try again in a few minutes.",
        };
        throw new Error(friendlyMessages[errMsg] || errMsg);
      }

      // Redirect to Xendit checkout
      window.location.href = data.invoice_url;
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setProcessing(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-4xl">🔒</div>
        <h1 className="text-lg font-bold">Sign in to Top Up</h1>
        <p className="text-sm text-muted-foreground text-center">You need to be signed in to purchase credits.</p>
        <button onClick={() => navigate("/auth")} className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto">
      {/* Header */}
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>TOP UP CREDITS</h1>
        </div>
        {player && (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="text-sm font-bold text-foreground">Cr {fmtCr(player.credits)}</div>
          </div>
        )}
      </div>

      <div className="p-4 pb-24">
        <p className="text-xs text-muted-foreground mb-4">Select a credit package to support players in live sessions.</p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-3 w-28 rounded bg-muted" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-16 rounded bg-muted ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {packages.map((pkg, i) => {
              const Icon = ICONS[pkg.name] || Zap;
              const isMostPopular = pkg.name === "Pro";
              const isProcessing = processing === pkg.id;
              const worthValue = pkg.credits;

              return (
                <motion.button
                  key={pkg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !processing && handleBuy(pkg)}
                  disabled={!!processing}
                  className="relative text-left w-full"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 16,
                    padding: "14px 16px",
                    cursor: processing ? "wait" : "pointer",
                    opacity: processing && !isProcessing ? 0.5 : 1,
                  }}
                >
                  {isMostPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wider border border-border">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-muted"
                    >
                      <Icon size={20} className="text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{pkg.name}</span>
                        {pkg.bonus_pct > 0 && (
                          <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                            +{pkg.bonus_pct}% BONUS
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {fmtCr(pkg.credits)} Credits
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <div className="text-sm font-bold">{fmtRp(pkg.price_idr)}</div>
                          {pkg.bonus_pct > 0 && (
                            <div className="text-[10px] text-muted-foreground line-through">
                              {fmtRp(pkg.credits)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Payment methods */}
        <div className="mt-6 text-center">
          <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-3">Accepted Payment Methods</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {PAYMENT_METHODS.map(m => (
              <div key={m} className="bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-[11px] text-muted-foreground">
            💡 Credits are added instantly after payment. All payments are processed securely via Xendit.
          </p>
        </div>
      </div>
    </div>
  );
}
