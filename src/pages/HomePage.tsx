import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const GREEN = "#00E676";

const ROLE_TABS = [
  { key: "player", label: "🎾 Players", color: GREEN },
  { key: "venue", label: "🏟️ Venue Owners", color: "#60D5FF" },
  { key: "host", label: "📋 Session Hosts", color: "#FFD166" },
] as const;

type RoleKey = typeof ROLE_TABS[number]["key"];

const ROLE_FLOWS: Record<RoleKey, { icon: string; title: string; desc: string; visual: string }[]> = {
  player: [
    { icon: "📱", title: "Open Your Venue Link", desc: "No app download. Just open your venue's URL (e.g. superfans.games/yourclub) on any phone or laptop.", visual: "🌐 → 📱" },
    { icon: "🔐", title: "Sign In with Google", desc: "One-tap Google sign-in. Your profile is created instantly with a unique username and avatar.", visual: "👤 ✓" },
    { icon: "🏓", title: "Join a Live Session", desc: "See open sessions at your venue. Tap to join — the host assigns you to a court and match.", visual: "📋 → 🏓" },
    { icon: "📊", title: "Play & Earn XP", desc: "After your match, staff verifies the score. You earn XP based on result and session ranking. Win = 100 base XP, Loss = 50 base XP.", visual: "⭐ +XP" },
    { icon: "🏆", title: "Climb the Leaderboard", desc: "Your XP accumulates across all venues. Rise through divisions: Bronze → Silver → Gold → Platinum → Diamond.", visual: "📈 🥇" },
    { icon: "💰", title: "Support & Earn Credits", desc: "Back other players before matches. If they win, you split 70% of the losing pool proportionally.", visual: "🤝 → 💵" },
  ],
  venue: [
    { icon: "📝", title: "Register Your Venue", desc: "Fill out a 5-minute form with your venue name, city, number of courts, and brand color. We activate within 24 hours.", visual: "📋 → ✅" },
    { icon: "🔗", title: "Get Your Branded URL", desc: "You receive a unique link like superfans.games/yourclub. Share it with your players — that's it!", visual: "🌐 yourclub" },
    { icon: "🏆", title: "Set Monthly Prizes", desc: "Define a prize pool amount. Top 3 players on your leaderboard at month's end split it automatically.", visual: "💰 → 🥇🥈🥉" },
    { icon: "📊", title: "Track Everything", desc: "See live player counts, session history, leaderboards, and revenue from the admin dashboard.", visual: "📈 Dashboard" },
    { icon: "💳", title: "Earn from Support Economy", desc: "10% platform fee on the support pool goes to sustaining the ecosystem. Zero monthly subscription for you.", visual: "0 → 💵" },
  ],
  host: [
    { icon: "➕", title: "Create a Session", desc: "As host, open a new session — pick the format (Americano or Mexicano), set the number of courts and rounds.", visual: "🆕 Session" },
    { icon: "👥", title: "Players Join", desc: "Players see your session in real-time and tap to join. You see the roster build up live on your screen.", visual: "👤👤👤 → 📋" },
    { icon: "🔀", title: "Matches Auto-Generate", desc: "The system pairs players and assigns courts automatically each round. No spreadsheets needed.", visual: "🤖 → 🏓🏓" },
    { icon: "✅", title: "Verify Scores", desc: "After each match, players submit scores. You review and approve — XP is credited instantly upon approval.", visual: "📝 → ✓ → ⭐" },
    { icon: "📊", title: "Session Leaderboard", desc: "A live leaderboard updates after each round. Players see their rank, wins, and XP earned in real-time.", visual: "🏆 Live" },
  ],
};

const ECONOMY_FLOW = [
  { label: "Fan backs Player A", amount: "100 Cr", icon: "🤝" },
  { label: "Player A wins!", amount: "", icon: "🏆" },
  { label: "70% → Winning backers", amount: "70 Cr", icon: "💰" },
  { label: "20% → Winning player", amount: "20 Cr", icon: "⭐" },
  { label: "10% → Platform", amount: "10 Cr", icon: "🏟️" },
];

const XP_TABLE = [
  { result: "Win", base: 100, rank1: "200 XP (×2.0)", rank3: "140 XP (×1.4)", rank6: "120 XP (×1.2)" },
  { result: "Loss", base: 50, rank1: "100 XP (×2.0)", rank3: "70 XP (×1.4)", rank6: "60 XP (×1.2)" },
];

const DIVISIONS = [
  { label: "Diamond", color: "#60D5FF", min: "3000+", icon: "💎" },
  { label: "Platinum", color: "#B8A9FF", min: "2400", icon: "⚪" },
  { label: "Gold", color: "#FFD166", min: "1600", icon: "🥇" },
  { label: "Silver", color: "#C0C0C0", min: "900", icon: "🥈" },
  { label: "Bronze", color: "#CD7F32", min: "0", icon: "🥉" },
];

interface Venue {
  id: string; slug: string; name: string; logo_url: string | null;
  city: string | null; primary_color: string | null;
}

const FEATURES = [
  { icon: "🏆", title: "Live Leaderboards", desc: "Real-time rankings update the moment scores are approved by staff." },
  { icon: "⚡", title: "XP & Division Badges", desc: "Players earn XP every match. Bronze → Silver → Gold → Platinum → Diamond." },
  { icon: "💰", title: "Monthly Prize Pools", desc: "You set the prize amount. Top 3 players split it at month's end." },
  { icon: "🤝", title: "Player Support Economy", desc: "Fans back players before matches. Win together, earn together." },
  { icon: "🌏", title: "One Global Profile", desc: "Players carry their XP and division across every SuperFans venue." },
  { icon: "🛡️", title: "Admin Score Verification", desc: "Every match score is verified by staff before XP is credited." },
];

const STEPS = [
  { n: "1", title: "Register your venue", desc: "Fill out a quick form — takes 5 minutes. We review and activate within 24 hours." },
  { n: "2", title: "Players sign in with Google", desc: "No app download needed. Players open your venue URL and tap Sign In." },
  { n: "3", title: "Matches are tracked automatically", desc: "Scores verified, XP credited, leaderboards updated — all in real time." },
];

export default function HomePage() {
  const navigate = useNavigate();

  const { data: venues = [] } = useQuery({
    queryKey: ["active-venues"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("venues").select("id, slug, name, logo_url, city, primary_color").eq("status", "active").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });

  return (
    <div style={{ background: "#fff", color: "#111", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>SUPERFANS</span>
          <span style={{ fontSize: 10, color: "#999", letterSpacing: 1 }}>.GAMES</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => navigate("/register")} style={{ background: GREEN, color: "#111", border: "none", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Register Venue</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "60px 24px 48px", maxWidth: 640, margin: "0 auto" }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "clamp(28px, 6vw, 44px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: -0.5 }}>
          Your Padel Venue.<br /><span style={{ color: GREEN }}>Fully Gamified.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ fontSize: 16, color: "#555", lineHeight: 1.7, marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          Live rankings, XP points, monthly prizes, and a player support economy — out of the box.
        </motion.p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/register")} style={{ background: "#111", color: "#fff", border: "none", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            Register Your Venue →
          </button>
          <button onClick={() => navigate("/tomspadel")} style={{ background: "transparent", color: "#555", border: "1px solid #ddd", padding: "14px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            See a live example
          </button>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ height: 1, background: "#eee" }} />
      </div>

      {/* HOW IT WORKS — Enhanced */}
      <HowItWorksSection />

      {/* FEATURES */}
      <section style={{ background: "#f9f9f9", padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Features</h2>
          <p style={{ textAlign: "center", fontSize: 24, fontWeight: 800, marginBottom: 32, fontFamily: "'Barlow Condensed', sans-serif" }}>Everything your venue needs</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} style={{ background: "#fff", borderRadius: 14, padding: "20px 18px", border: "1px solid #eee" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVE VENUES */}
      {venues.length > 0 && (
        <section style={{ padding: "48px 24px", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Active Venues</h2>
          <p style={{ textAlign: "center", fontSize: 24, fontWeight: 800, marginBottom: 32, fontFamily: "'Barlow Condensed', sans-serif" }}>Already on SuperFans</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {venues.map(v => (
              <div key={v.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10 }}>
                {v.logo_url ? (
                  <img src={v.logo_url} alt={v.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: `${v.primary_color || GREEN}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏟️</div>
                )}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{v.name}</div>
                  {v.city && <div style={{ fontSize: 12, color: "#999" }}>{v.city}</div>}
                </div>
                <button onClick={() => navigate(`/${v.slug}/rank`)} style={{ background: `${v.primary_color || GREEN}12`, border: `1px solid ${v.primary_color || GREEN}30`, color: v.primary_color || GREEN, padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View Rankings →</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRICING */}
      <section style={{ background: "#111", color: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: GREEN, textTransform: "uppercase", marginBottom: 8 }}>Pricing</h2>
          <p style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, fontFamily: "'Barlow Condensed', sans-serif" }}>Simple & transparent</p>
          <div style={{ display: "grid", gap: 16, textAlign: "left" }}>
            <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "20px 22px", border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Venue Registration</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: GREEN }}>Free</span>
              </div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>Full access to leaderboards, XP system, session management, and admin tools.</div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 14, padding: "20px 22px", border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Platform Fee</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: GREEN }}>10%</span>
              </div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>Applied only to support pools. No monthly subscription, no setup fees.</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#666", marginTop: 20 }}>Want to discuss a venue partnership? <a href="mailto:hello@superfans.games" style={{ color: GREEN, textDecoration: "none", fontWeight: 600 }}>Contact us</a></p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "32px 24px", maxWidth: 800, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>SUPERFANS</span>
          <span style={{ fontSize: 9, color: "#999", letterSpacing: 1 }}>.GAMES</span>
          <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Built for padel communities across Southeast Asia</div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Register", to: "/register" },
            { label: "How it works", to: "/#how-it-works" },
            { label: "Contact", href: "mailto:hello@superfans.games" },
          ].map((l, i) => (
            "to" in l ? (
              <button key={i} onClick={() => navigate(l.to)} style={{ background: "none", border: "none", color: "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>{l.label}</button>
            ) : (
              <a key={i} href={l.href} style={{ color: "#666", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{l.label}</a>
            )
          ))}
        </div>
      </footer>
    </div>
  );
}
