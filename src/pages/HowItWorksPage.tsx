import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MarketingLayout from "@/components/MarketingLayout";

const GREEN = "#00C853";

const ROLE_TABS = [
  { key: "player", label: "🎾 Players", color: GREEN },
  { key: "venue", label: "🏟️ Venue Owners", color: "#2196F3" },
  { key: "host", label: "📋 Session Hosts", color: "#FF9800" },
] as const;

type RoleKey = typeof ROLE_TABS[number]["key"];

const ROLE_FLOWS: Record<RoleKey, { icon: string; title: string; desc: string }[]> = {
  player: [
    { icon: "📱", title: "Open Your Venue Link", desc: "No app download. Just open your venue's URL on any device." },
    { icon: "🔐", title: "Sign In with Google", desc: "One-tap sign-in. Your profile is created instantly." },
    { icon: "🏓", title: "Join a Live Session", desc: "See open sessions. Tap to join — the host assigns you to a court." },
    { icon: "📊", title: "Play & Earn XP", desc: "Staff verifies scores. You earn XP based on result and ranking." },
    { icon: "🏆", title: "Climb the Leaderboard", desc: "Rise through divisions: Bronze → Silver → Gold → Platinum → Diamond." },
    { icon: "💰", title: "Support & Earn Credits", desc: "Back other players. If they win, you split the pool." },
  ],
  venue: [
    { icon: "📝", title: "Register Your Venue", desc: "5-minute form. We activate within 24 hours." },
    { icon: "🔗", title: "Get Your Branded URL", desc: "Unique link like superfans.games/yourclub. Share it!" },
    { icon: "🏆", title: "Set Monthly Prizes", desc: "Top 3 players split the prize pool automatically." },
    { icon: "📊", title: "Track Everything", desc: "Live player counts, session history, leaderboards." },
    { icon: "💳", title: "Zero Monthly Fees", desc: "10% platform fee on support pools only. No subscription." },
  ],
  host: [
    { icon: "➕", title: "Create a Session", desc: "Pick format, set courts and rounds." },
    { icon: "👥", title: "Players Join", desc: "Players join in real-time. Watch the roster build." },
    { icon: "🔀", title: "Auto-Generate Matches", desc: "System pairs players and assigns courts automatically." },
    { icon: "✅", title: "Verify Scores", desc: "Review and approve — XP credited instantly." },
    { icon: "📊", title: "Live Leaderboard", desc: "Updates after each round in real-time." },
  ],
};

export default function HowItWorksPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>("player");
  const flow = ROLE_FLOWS[activeRole];
  const tab = ROLE_TABS.find(t => t.key === activeRole)!;

  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">
          How It Works
        </h1>
        <p className="text-center text-muted-foreground mb-10 max-w-md mx-auto">
          Pick your role to see the step-by-step flow.
        </p>

        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {ROLE_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveRole(t.key)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all border-2"
              style={{
                borderColor: activeRole === t.key ? t.color : "hsl(var(--border))",
                background: activeRole === t.key ? `${t.color}12` : "transparent",
                color: activeRole === t.key ? t.color : "hsl(var(--muted-foreground))",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-0"
          >
            {flow.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center w-10 shrink-0">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${tab.color}15`, border: `2px solid ${tab.color}40` }}
                  >
                    {step.icon}
                  </motion.div>
                  {i < flow.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-4" style={{ background: `${tab.color}25` }} />
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + 0.05 }}
                  className="flex-1 bg-card border border-border rounded-2xl p-4 mb-2"
                >
                  <div className="font-bold text-sm mb-1">{step.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{step.desc}</div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>
    </MarketingLayout>
  );
}
