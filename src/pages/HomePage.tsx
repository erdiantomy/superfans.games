import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import MarketingLayout from "@/components/MarketingLayout";

const ROLE_CARDS = [
  {
    key: "player",
    icon: "🎾", accent: "#00C853", title: "I'm a Player",
    desc: "Join sessions, earn XP, climb divisions, and get fan support. No app download needed.",
    cta: "Join", ctaLink: "/auth",
    steps: [
      { icon: "📱", title: "Open Your Venue Link", desc: "No app download. Just open your venue's URL on any device." },
      { icon: "🔐", title: "Sign In with Google", desc: "One-tap sign-in. Your profile is created instantly." },
      { icon: "🏓", title: "Join a Live Session", desc: "See open sessions. Tap to join — the host assigns you to a court." },
      { icon: "📊", title: "Play & Earn XP", desc: "Staff verifies scores. You earn XP based on result and ranking." },
      { icon: "🏆", title: "Climb the Leaderboard", desc: "Rise through divisions: Bronze → Silver → Gold → Platinum → Diamond." },
    ],
  },
  {
    key: "venue",
    icon: "🏟️", accent: "#2196F3", title: "I Own a Venue",
    desc: "Free setup in 5 minutes. Get a branded URL, live leaderboards, and monthly prize automation.",
    cta: "Register", ctaLink: "/register",
    steps: [
      { icon: "📝", title: "Register Your Venue", desc: "5-minute form. We activate within 24 hours." },
      { icon: "🔗", title: "Get Your Branded URL", desc: "Unique link like superfans.games/yourclub. Share it!" },
      { icon: "🏆", title: "Set Monthly Prizes", desc: "Top 3 players split the prize pool automatically." },
      { icon: "📊", title: "Track Everything", desc: "Live player counts, session history, leaderboards." },
      { icon: "💳", title: "Zero Monthly Fees", desc: "10% platform fee on support pools only. No subscription." },
    ],
  },
  {
    key: "host",
    icon: "📋", accent: "#FF9800", title: "I Host Sessions",
    desc: "Create sessions, manage players, auto-generate matches — all from your phone.",
    cta: "Sign Up", ctaLink: "/auth",
    steps: [
      { icon: "➕", title: "Create a Session", desc: "Pick format, set courts and rounds." },
      { icon: "👥", title: "Players Join", desc: "Players join in real-time. Watch the roster build." },
      { icon: "🔀", title: "Auto-Generate Matches", desc: "System pairs players and assigns courts automatically." },
      { icon: "✅", title: "Verify Scores", desc: "Review and approve — XP credited instantly." },
      { icon: "📊", title: "Live Leaderboard", desc: "Updates after each round in real-time." },
    ],
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-black leading-tight mb-5"
        >
          Turn Every Match<br />
          <span className="text-primary">Into a Story</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
        >
          The gamification layer for padel venues. XP, leaderboards, fan support — zero app downloads.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{ delay: 0.4, y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }}
          className="flex flex-col items-center gap-1 cursor-pointer"
          onClick={() => document.getElementById("role-cards")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-xs text-muted-foreground tracking-wide">Discover your role</span>
          <ChevronDown className="text-primary" size={22} />
        </motion.div>
      </section>

      {/* Role Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLE_CARDS.map((card, i) => {
            const isExpanded = expanded === card.key;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow text-left flex flex-col"
                style={{ borderLeft: `4px solid ${card.accent}` }}
                onClick={() => setExpanded(isExpanded ? null : card.key)}
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <div className="font-bold text-lg mb-2">{card.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{card.desc}</div>

                {/* Toggle button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : card.key); }}
                  className="w-full text-sm font-bold px-4 py-3 rounded-xl text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: card.accent }}
                >
                  {isExpanded ? "Close" : "How It Works"}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block"
                  >
                    ▾
                  </motion.span>
                </button>

                {/* Expandable How It Works */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-5 space-y-0">
                        {card.steps.map((step, si) => (
                          <div key={si} className="flex gap-3">
                            {/* Timeline */}
                            <div className="flex flex-col items-center w-8 shrink-0">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: si * 0.06, type: "spring", stiffness: 300 }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                style={{ background: `${card.accent}15`, border: `2px solid ${card.accent}40` }}
                              >
                                {step.icon}
                              </motion.div>
                              {si < card.steps.length - 1 && (
                                <div className="w-0.5 flex-1 min-h-3" style={{ background: `${card.accent}25` }} />
                              )}
                            </div>
                            {/* Content */}
                            <motion.div
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: si * 0.06 + 0.03 }}
                              className="flex-1 mb-2"
                            >
                              <div className="font-bold text-xs mb-0.5">{step.title}</div>
                              <div className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</div>
                            </motion.div>
                          </div>
                        ))}

                        {/* CTA after steps */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: card.steps.length * 0.06 + 0.1 }}
                          className="pt-4"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(card.ctaLink); }}
                            className="w-full text-sm font-bold px-4 py-3 rounded-xl text-white transition-opacity hover:opacity-90"
                            style={{ background: card.accent }}
                          >
                            {card.cta} →
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quick features */}
      <section className="bg-accent py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl md:text-3xl font-black text-center mb-10">Everything You Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: "🏆", title: "Live Leaderboards", desc: "Real-time rankings update the moment scores are approved." },
              { icon: "⚡", title: "XP & Divisions", desc: "Bronze → Silver → Gold → Platinum → Diamond." },
              { icon: "💰", title: "Monthly Prizes", desc: "Top 3 split the prize pool at month's end." },
              { icon: "🤝", title: "Player Support", desc: "Fans back players. Win together, earn together." },
              { icon: "🧑", title: "Player Profiles", desc: "Your own URL at superfans.games/yourname." },
              { icon: "💚", title: "Fan Donations", desc: "Direct support via eWallet. No middleman." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-background rounded-2xl p-5 border border-border"
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <div className="font-bold text-sm mb-1">{f.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
