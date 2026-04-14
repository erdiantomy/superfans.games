import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePadelPlayer } from "@/hooks/useArena";
import { getDivision, getDivisionProgress, getXpToNextDivision, DIVISION_ORDER, DIVISIONS } from "@/lib/gamification";
import { C } from "@/components/arena";
import { Progress } from "@/components/ui/progress";
import MarketingLayout from "@/components/MarketingLayout";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const GREEN = "#00C853";

const DIVISIONS_DISPLAY = [
  { label: "Diamond", color: "#2196F3", min: "3000+", icon: "💎" },
  { label: "Platinum", color: "#9C27B0", min: "2400", icon: "⚪" },
  { label: "Gold", color: "#FF9800", min: "1600", icon: "🥇" },
  { label: "Silver", color: "#9E9E9E", min: "900", icon: "🥈" },
  { label: "Bronze", color: "#795548", min: "0", icon: "🥉" },
];

const XP_TABLE = [
  { result: "Win", base: 100, rank1: "200 XP (×2.0)", rank3: "140 XP (×1.4)", rank6: "120 XP (×1.2)" },
  { result: "Loss", base: 50, rank1: "100 XP (×2.0)", rank3: "70 XP (×1.4)", rank6: "60 XP (×1.2)" },
];

const ECONOMY_FLOW = [
  { label: "Fan backs Player A", amount: "100 Cr", icon: "🤝" },
  { label: "Player A wins!", amount: "", icon: "🏆" },
  { label: "70% → Winning backers", amount: "70 Cr", icon: "💰" },
  { label: "20% → Winning player", amount: "20 Cr", icon: "⭐" },
  { label: "10% → Platform", amount: "10 Cr", icon: "🏟️" },
];

const QUEST_ICONS: Record<string, string> = {
  play_session: "🎾", back_player: "🤝", host_session: "🏆",
  complete_sessions: "🎾", play_venues: "🗺️", top10_rank: "🏅",
};

const CADENCE_COLORS: Record<string, string> = {
  daily: "#FF9800", weekly: "#2196F3", monthly: "#9C27B0",
};

function getISOWeek(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getDivisionIcon(xp: number): string {
  const div = getDivision(xp);
  const icons: Record<string, string> = { Diamond: "💎", Platinum: "⚪", Gold: "🥇", Silver: "🥈", Bronze: "🥉" };
  return icons[div.label] || "🥉";
}

function getNextDivisionName(xp: number): string | null {
  const div = getDivision(xp);
  if (!div.next) return null;
  for (const key of DIVISION_ORDER) {
    if (DIVISIONS[key].min === div.next) return DIVISIONS[key].label;
  }
  return null;
}

// ─── PERSONAL DASHBOARD (Logged In) ──────────────────
function PersonalDashboard({ me }: { me: any }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const xp = me.lifetime_xp || 0;
  const div = getDivision(xp);
  const progress = getDivisionProgress(xp);
  const xpToNext = getXpToNextDivision(xp);
  const nextDiv = getNextDivisionName(xp);
  const winRate = me.matches_played > 0 ? Math.round((me.matches_won / me.matches_played) * 100) : null;
  const nearDrop = xp - div.min < 150 && div.min > 0;

  const today = new Date().toISOString().slice(0, 10);
  const week = getISOWeek();
  const month = today.slice(0, 7);
  const periods: Record<string, string> = { daily: today, weekly: week, monthly: month };

  // Fetch quests
  const { data: questDefs = [] } = useQuery({
    queryKey: ["quest-definitions"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("quest_definitions").select("*").eq("active", true);
      return data ?? [];
    },
  });

  const { data: questProgress = [], refetch: refetchQuests } = useQuery({
    queryKey: ["player-quests", me.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("player_quests")
        .select("*")
        .eq("player_id", me.id);
      return data ?? [];
    },
  });

  // Fetch badges
  const { data: badges = [] } = useQuery({
    queryKey: ["player-badges", me.id],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("player_badges")
        .select("*")
        .eq("player_id", me.id)
        .order("earned_at", { ascending: false });
      return data ?? [];
    },
  });

  // Show 3 quests: first daily, first weekly, first monthly
  const shownQuests = (() => {
    const daily = questDefs.find((q: any) => q.cadence === "daily");
    const weekly = questDefs.find((q: any) => q.cadence === "weekly");
    const monthly = questDefs.find((q: any) => q.cadence === "monthly");
    return [daily, weekly, monthly].filter(Boolean);
  })();

  const getQuestProgress = (quest: any) => {
    const periodKey = periods[quest.cadence];
    return questProgress.find((p: any) => p.quest_id === quest.id && p.period_key === periodKey);
  };

  const claimReward = async (quest: any) => {
    const prog = getQuestProgress(quest);
    if (!prog || !prog.completed || prog.reward_claimed) return;

    await (supabase as any).from("player_quests")
      .update({ reward_claimed: true })
      .eq("id", prog.id);

    if (quest.reward_type === "xp") {
      await (supabase as any).from("padel_players")
        .update({ lifetime_xp: me.lifetime_xp + quest.reward_value })
        .eq("id", me.id);
    } else if (quest.reward_type === "credits") {
      await (supabase.rpc as any)("credit_player_balance", {
        p_player_id: me.id,
        p_credits: quest.reward_value,
      });
    }

    // Award badge if applicable
    if (quest.reward_badge) {
      const badgeLabels: Record<string, { label: string; icon: string }> = {
        active_player: { label: "Active Player", icon: "🎾" },
        explorer: { label: "Explorer", icon: "🗺️" },
        contender: { label: "Contender", icon: "🏆" },
        first_host: { label: "First Host", icon: "🎙️" },
      };
      const b = badgeLabels[quest.reward_badge] || { label: quest.reward_badge, icon: "🏅" };
      await (supabase as any).from("player_badges").upsert({
        player_id: me.id,
        badge_id: quest.reward_badge,
        label: b.label,
        icon: b.icon,
      }, { onConflict: "player_id,badge_id" });
    }

    toast.success(`⚡ +${quest.reward_value} ${quest.reward_type === "xp" ? "XP" : "Credits"} claimed!`);
    refetchQuests();
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 40px", fontFamily: "'DM Sans', sans-serif" }}>
      {/* SECTION 1 — Division Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${div.color}10, ${div.color}05)`,
          border: `2px solid ${div.color}30`,
          borderRadius: 20, padding: "24px 20px", marginBottom: 20, textAlign: "center",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 8 }}>{getDivisionIcon(xp)}</div>
        <div className="font-display" style={{ fontSize: 28, fontWeight: 900, color: div.color }}>{div.label}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{xp.toLocaleString()} lifetime XP</div>
        <div style={{ margin: "16px 0 8px" }}>
          <Progress value={progress} className="h-2" style={{ background: `${div.color}15` }} />
        </div>
        {xpToNext !== null ? (
          <div style={{ fontSize: 12, color: div.color, fontWeight: 600 }}>
            {xpToNext} XP to {nextDiv}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: div.color, fontWeight: 700 }}>MAX DIVISION 👑</div>
        )}
        {nearDrop && (
          <div style={{
            marginTop: 12, background: `${C.orange}12`, border: `1px solid ${C.orange}30`,
            borderRadius: 10, padding: "8px 12px", fontSize: 12, color: C.orange,
          }}>
            ⚠️ {t("gamification.protectRank")}
          </div>
        )}
      </motion.div>

      {/* SECTION 2 — Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[
          { label: "Monthly Pts", value: me.monthly_pts || 0, color: GREEN },
          { label: "Matches", value: me.matches_played || 0, color: C.blue },
          { label: "Win Rate", value: winRate !== null ? `${winRate}%` : "--", color: C.purple },
        ].map((s) => (
          <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 8px", textAlign: "center" }}>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Active Quests */}
      <div style={{ marginBottom: 24 }}>
        <div className="font-display" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1, color: C.muted, marginBottom: 12, textTransform: "uppercase" }}>
          {t("gamification.activeQuests")}
        </div>
        {shownQuests.map((quest: any) => {
          const prog = getQuestProgress(quest);
          const currentProgress = prog?.progress ?? 0;
          const completed = prog?.completed ?? false;
          const claimed = prog?.reward_claimed ?? false;
          const pct = Math.min((currentProgress / quest.target_count) * 100, 100);

          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              style={{
                background: C.card, border: `1px solid ${completed ? `${GREEN}30` : C.border}`,
                borderRadius: 14, padding: "14px 16px", marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>{QUEST_ICONS[quest.action_type] || "🎯"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{quest.title}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 6,
                      background: `${CADENCE_COLORS[quest.cadence]}15`,
                      color: CADENCE_COLORS[quest.cadence],
                      textTransform: "uppercase", letterSpacing: 0.5,
                    }}>{quest.cadence}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{quest.description}</div>
                  <div style={{ marginBottom: 6 }}>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.dim }}>{currentProgress}/{quest.target_count}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>
                      +{quest.reward_value} {quest.reward_type === "xp" ? "XP" : "Cr"}
                    </span>
                  </div>
                </div>
                {completed && !claimed && (
                  <button
                    onClick={() => claimReward(quest)}
                    style={{
                      background: GREEN, border: "none", color: "#0A0C11",
                      padding: "6px 12px", borderRadius: 8, fontSize: 11,
                      fontWeight: 800, cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    {t("gamification.claimReward")}
                  </button>
                )}
                {claimed && (
                  <span style={{ fontSize: 11, color: GREEN, fontWeight: 700 }}>✅ {t("gamification.claimed")}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SECTION 4 — Badge Wall */}
      <div style={{ marginBottom: 24 }}>
        <div className="font-display" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1, color: C.muted, marginBottom: 12, textTransform: "uppercase" }}>
          {t("gamification.yourBadges")}
        </div>
        {badges.length > 0 ? (
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {badges.map((b: any) => (
              <div key={b.id} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
                padding: "12px 16px", textAlign: "center", flexShrink: 0, minWidth: 80,
              }}>
                <div style={{ fontSize: 28 }}>{b.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{b.label}</div>
                <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>
                  {new Date(b.earned_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "16px 0" }}>
            {t("gamification.noBadges")}
          </div>
        )}
      </div>

      {/* SECTION 5 — Backer Stats */}
      {(me.backs_total ?? 0) > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="font-display" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 1, color: C.muted, marginBottom: 12, textTransform: "uppercase" }}>
            {t("gamification.backerRep")}
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px" }}>
            {(() => {
              const accuracy = Math.round((me.backs_correct / me.backs_total) * 100);
              const label = accuracy >= 70 ? "Expert Backer 🎯" : accuracy >= 50 ? "Reliable Backer 📊" : "Learning the Game 📈";
              return (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>{accuracy}%</span>
                  </div>
                  <Progress value={accuracy} className="h-1.5" />
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                    {me.backs_correct}/{me.backs_total} correct · {me.backs_total} total backs
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────
export default function GamificationPage() {
  const { user } = useAuth();
  const { data: me, isLoading } = usePadelPlayer(user?.id);
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Logged-in with player record → personal dashboard
  if (user && me && !isLoading) {
    return (
      <MarketingLayout>
        <PersonalDashboard me={me} />

        {/* SECTION 6 — Reference: How XP Works */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">How XP Works</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <MarketingContent />
        </section>
      </MarketingLayout>
    );
  }

  // Logged out → marketing + CTA
  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 py-16">
        {/* Sign in CTA */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <button
              onClick={() => navigate("/auth?returnTo=/gamification")}
              className="text-sm font-bold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: GREEN, color: "#0A0C11" }}
            >
              Sign in to see your progress →
            </button>
          </motion.div>
        )}

        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">
          XP System & Divisions
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
          Every match earns XP. Climb through five divisions and compete for monthly prizes.
        </p>

        <MarketingContent />
      </section>
    </MarketingLayout>
  );
}

// ─── SHARED MARKETING CONTENT ────────────────────────
function MarketingContent() {
  return (
    <>
      {/* Division badges */}
      <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto mb-12">
        {DIVISIONS_DISPLAY.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-3 text-center"
            style={{ background: `${d.color}10`, border: `2px solid ${d.color}30` }}
          >
            <div className="text-2xl">{d.icon}</div>
            <div className="text-xs font-extrabold mt-1" style={{ color: d.color }}>{d.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{d.min} XP</div>
          </motion.div>
        ))}
      </div>

      {/* XP table */}
      <div className="bg-card border border-border rounded-2xl p-5 max-w-xl mx-auto mb-12">
        <h3 className="font-bold text-sm mb-4 text-foreground">📊 XP Earned Per Match</h3>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="font-extrabold text-muted-foreground text-[10px] uppercase tracking-wider">Result</div>
          <div className="font-extrabold text-muted-foreground text-[10px] uppercase tracking-wider">Rank #1</div>
          <div className="font-extrabold text-muted-foreground text-[10px] uppercase tracking-wider">Rank #3</div>
          <div className="font-extrabold text-muted-foreground text-[10px] uppercase tracking-wider">Rank #6</div>
          {XP_TABLE.map(row => (
            <div key={row.result} className="contents">
              <div className="font-bold" style={{ color: row.result === "Win" ? GREEN : "#e74c3c" }}>
                {row.result === "Win" ? "✅ Win" : "❌ Loss"}
              </div>
              <div className="text-foreground">{row.rank1}</div>
              <div className="text-foreground">{row.rank3}</div>
              <div className="text-foreground">{row.rank6}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          💡 Higher session ranking = bigger XP multiplier. Rank #1 gets ×2.0, Rank #6+ gets ×1.2.
        </p>
      </div>

      {/* Support Economy */}
      <h2 className="font-display text-2xl font-black text-center mb-2">Support Economy</h2>
      <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto text-sm">
        Back players before a match. Win together, earn together.
      </p>

      <div className="flex flex-col items-center gap-0 max-w-sm mx-auto">
        {ECONOMY_FLOW.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-3 min-w-[280px] justify-between rounded-xl border"
              style={{
                background: i === 1 ? `${GREEN}08` : "hsl(var(--card))",
                borderColor: i === 1 ? `${GREEN}40` : "hsl(var(--border))",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{step.icon}</span>
                <span className="text-sm font-semibold text-foreground">{step.label}</span>
              </div>
              {step.amount && (
                <span className="font-display text-sm font-extrabold" style={{ color: GREEN }}>{step.amount}</span>
              )}
            </div>
            {i < ECONOMY_FLOW.length - 1 && (
              <div className="w-0.5 h-4 mx-auto" style={{ background: "hsl(var(--border))" }} />
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}
