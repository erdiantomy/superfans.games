import { motion } from "framer-motion";
import MarketingLayout from "@/components/MarketingLayout";

const GREEN = "#00C853";

const DIVISIONS = [
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

export default function GamificationPage() {
  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl md:text-4xl font-black text-center mb-3">
          XP System & Divisions
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-md mx-auto">
          Every match earns XP. Climb through five divisions and compete for monthly prizes.
        </p>

        {/* Division badges */}
        <div className="grid grid-cols-5 gap-3 max-w-lg mx-auto mb-12">
          {DIVISIONS.map((d, i) => (
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
              <>
                <div key={`${row.result}-label`} className="font-bold" style={{ color: row.result === "Win" ? GREEN : "#e74c3c" }}>
                  {row.result === "Win" ? "✅ Win" : "❌ Loss"}
                </div>
                <div key={`${row.result}-r1`} className="text-foreground">{row.rank1}</div>
                <div key={`${row.result}-r3`} className="text-foreground">{row.rank3}</div>
                <div key={`${row.result}-r6`} className="text-foreground">{row.rank6}</div>
              </>
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
      </section>
    </MarketingLayout>
  );
}
