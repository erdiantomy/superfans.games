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

const stats = [
  { icon: "🏸", label: "Badminton", color: "#3B82F6" },
  { icon: "🎾", label: "Padel", color: "#00E64D" },
  { icon: "🏓", label: "Tennis", color: "#FF9800" },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headX = interpolate(spring({ frame, fps, config: { damping: 20 } }), [0, 1], [-80, 0]);

  return (
    <AbsoluteFill style={{ background: "transparent", padding: 120 }}>
      {/* Left side — text */}
      <div style={{ position: "absolute", left: 120, top: "50%", transform: "translateY(-50%)", maxWidth: 700 }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 20,
            fontWeight: 700,
            color: "#00E64D",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 16,
            opacity: headOpacity,
            transform: `translateX(${headX}px)`,
          }}
        >
          THE PROBLEM
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 56,
            fontWeight: 900,
            color: "white",
            lineHeight: 1.1,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateX(${interpolate(spring({ frame: frame - 10, fps, config: { damping: 20 } }), [0, 1], [-60, 0])}px)`,
          }}
        >
          Fans watch.
          <br />
          <span style={{ color: "rgba(255,255,255,0.35)" }}>But never earn.</span>
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: 22,
            color: "rgba(255,255,255,0.45)",
            marginTop: 24,
            lineHeight: 1.6,
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          SuperFans turns spectators into supporters — pick your player, earn points, win real prizes.
        </div>
      </div>

      {/* Right side — sport icons */}
      <div style={{ position: "absolute", right: 180, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 28 }}>
        {stats.map((s, i) => {
          const delay = 25 + i * 12;
          const scale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 150 } });
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "20px 32px",
                borderRadius: 16,
                background: `${s.color}12`,
                border: `1px solid ${s.color}40`,
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              <span style={{ fontSize: 48 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: display, fontSize: 28, fontWeight: 800, color: s.color }}>{s.label}</div>
                <div style={{ fontFamily: body, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Live support</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
