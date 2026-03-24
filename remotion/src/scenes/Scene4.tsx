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

const leaderboard = [
  { rank: "👑", name: "AceKing", pts: "12,450", div: "Diamond", divColor: "#E040FB" },
  { rank: "🥈", name: "PadelPro99", pts: "9,200", div: "Platinum", divColor: "#3B82F6" },
  { rank: "🥉", name: "SmashHero", pts: "7,800", div: "Gold", divColor: "#FF9800" },
  { rank: "4", name: "NetNinja", pts: "5,100", div: "Silver", divColor: "#94A3B8" },
  { rank: "5", name: "CourtKing", pts: "3,600", div: "Bronze", divColor: "#CD7F32" },
];

export const Scene4Social: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Left — big number */}
      <div style={{ position: "absolute", left: 120, top: "50%", transform: "translateY(-50%)" }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 18,
            fontWeight: 700,
            color: "#00E64D",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 12,
            opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          LEADERBOARD
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 100,
            fontWeight: 900,
            color: "white",
            lineHeight: 1,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Rp 2<span style={{ color: "#00E64D" }}>M</span>
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            marginTop: 8,
            opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Monthly prize pool for top supporters
        </div>
      </div>

      {/* Right — leaderboard */}
      <div style={{ position: "absolute", right: 120, top: "50%", transform: "translateY(-50%)", width: 600 }}>
        {leaderboard.map((p, i) => {
          const delay = 15 + i * 8;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 160 } });
          const x = interpolate(s, [0, 1], [100, 0]);
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

          // Animated points counter
          const ptsNum = parseInt(p.pts.replace(",", ""));
          const countedPts = Math.round(interpolate(frame, [delay + 10, delay + 40], [0, ptsNum], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                borderRadius: 14,
                background: i === 0 ? "rgba(0,230,77,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${i === 0 ? "#00E64D40" : "rgba(255,255,255,0.06)"}`,
                marginBottom: 8,
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              <span style={{ width: 32, textAlign: "center", fontSize: i < 3 ? 22 : 16, fontWeight: 700, color: i < 3 ? "#00E64D" : "rgba(255,255,255,0.3)" }}>
                {p.rank}
              </span>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `${p.divColor}22`,
                  border: `2px solid ${p.divColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: display,
                  fontSize: 14,
                  fontWeight: 800,
                  color: p.divColor,
                }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: "white" }}>{p.name}</div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: `${p.divColor}18`,
                    border: `1px solid ${p.divColor}40`,
                    fontFamily: display,
                    fontSize: 10,
                    fontWeight: 700,
                    color: p.divColor,
                    marginTop: 2,
                  }}
                >
                  {p.div}
                </div>
              </div>
              <div style={{ fontFamily: display, fontSize: 22, fontWeight: 900, color: i === 0 ? "#00E64D" : "rgba(255,255,255,0.5)" }}>
                {countedPts.toLocaleString()}
              </div>
              <div style={{ fontFamily: body, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>pts</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
