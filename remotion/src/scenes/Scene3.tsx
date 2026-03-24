import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: display } = loadFont("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });
const { fontFamily: body } = loadInter("normal", { weights: ["400", "500"], subsets: ["latin"] });

const features = [
  { emoji: "⚡", title: "Live Support", desc: "Back your player in real-time during matches", color: "#00E64D" },
  { emoji: "🏆", title: "Earn Points", desc: "Win SuperPoints when your player wins", color: "#3B82F6" },
  { emoji: "💰", title: "Prize Pools", desc: "Monthly prizes for top supporters", color: "#FF9800" },
  { emoji: "📊", title: "Leaderboards", desc: "Climb the ranks, unlock divisions", color: "#E040FB" },
];

export const Scene3Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "transparent", justifyContent: "center", alignItems: "center" }}>
      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          fontFamily: display,
          fontSize: 18,
          fontWeight: 700,
          color: "#00E64D",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: titleOpacity,
        }}
      >
        HOW IT WORKS
      </div>
      <div
        style={{
          position: "absolute",
          top: 140,
          fontFamily: display,
          fontSize: 54,
          fontWeight: 900,
          color: "white",
          opacity: interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(spring({ frame: frame - 5, fps, config: { damping: 20 } }), [0, 1], [30, 0])}px)`,
        }}
      >
        Four Pillars of <span style={{ color: "#00E64D" }}>SuperFans</span>
      </div>

      {/* Feature cards */}
      <div style={{ display: "flex", gap: 28, marginTop: 100 }}>
        {features.map((f, i) => {
          const delay = 20 + i * 15;
          const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
          const opacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(s, [0, 1], [60, 0]);

          return (
            <div
              key={i}
              style={{
                width: 350,
                padding: "40px 32px",
                borderRadius: 24,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${f.color}30`,
                opacity,
                transform: `translateY(${y}px)`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 16 }}>{f.emoji}</div>
              <div style={{ fontFamily: display, fontSize: 26, fontWeight: 800, color: f.color, marginBottom: 10 }}>
                {f.title}
              </div>
              <div style={{ fontFamily: body, fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                {f.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative line */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: interpolate(frame, [60, 100], [0, 1200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          height: 2,
          background: "linear-gradient(90deg, transparent, #00E64D40, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};
