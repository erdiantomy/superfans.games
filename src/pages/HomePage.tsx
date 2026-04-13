import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { useEffect } from "react";
import MarketingLayout from "@/components/MarketingLayout";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/sessions")}
            className="bg-primary text-primary-foreground font-bold text-base px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors"
          >
            🎾 I Want to Play
          </button>
          <button
            onClick={() => navigate("/top-players")}
            className="bg-card border border-border text-foreground font-bold text-base px-8 py-4 rounded-xl hover:bg-accent transition-colors"
          >
            ❤️ I Want to Support
          </button>
        </motion.div>
      </section>

      {/* Role Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🎾", accent: "#00C853", title: "I'm a Player",
              desc: "Join sessions, earn XP, climb divisions, and get fan support. No app download needed.",
              cta: "Sign Up & Play Free →", action: () => navigate("/auth"),
            },
            {
              icon: "🏟️", accent: "#2196F3", title: "I Own a Venue",
              desc: "Free setup in 5 minutes. Get a branded URL, live leaderboards, and monthly prize automation.",
              cta: "Register Your Venue →", action: () => navigate("/register"),
            },
            {
              icon: "📋", accent: "#FF9800", title: "I Host Sessions",
              desc: "Create sessions, manage players, auto-generate matches — all from your phone.",
              cta: "Start Hosting Now →", action: () => navigate("/auth"),
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow text-left flex flex-col"
              style={{ borderLeft: `4px solid ${card.accent}` }}
              onClick={card.action}
            >
              <div className="text-3xl mb-4">{card.icon}</div>
              <div className="font-bold text-lg mb-2">{card.title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{card.desc}</div>
              <button
                onClick={e => { e.stopPropagation(); card.action(); }}
                className="w-full text-sm font-bold px-4 py-3 rounded-xl text-white transition-opacity hover:opacity-90"
                style={{ background: card.accent }}
              >
                {card.cta}
              </button>
            </motion.div>
          ))}
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
