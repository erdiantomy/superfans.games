import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Img,
  staticFile,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/BarlowCondensed";

const { fontFamily } = loadFont("normal", {
  weights: ["800", "900"],
  subsets: ["latin"],
});

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance — scale + fade
  const logoScale = spring({ frame, fps, config: { damping: 15, stiffness: 120 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Glow pulse behind logo
  const glowScale = interpolate(frame, [0, 60, 120], [0.8, 1.3, 0.9]);
  const glowOpacity = interpolate(frame, [0, 20, 60, 120], [0, 0.5, 0.3, 0.15], { extrapolateRight: "clamp" });

  // Tagline entrance
  const tagY = interpolate(
    spring({ frame: frame - 25, fps, config: { damping: 20, stiffness: 180 } }),
    [0, 1],
    [40, 0]
  );
  const tagOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subOpacity = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(
    spring({ frame: frame - 50, fps, config: { damping: 20 } }),
    [0, 1],
    [30, 0]
  );

  // Particles
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = interpolate(frame, [10, 80], [0, 300 + i * 30], { extrapolateRight: "clamp" });
    const pOpacity = interpolate(frame, [10, 30, 80, 110], [0, 0.8, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return {
      x: Math.cos(angle + frame * 0.01) * radius,
      y: Math.sin(angle + frame * 0.01) * radius,
      opacity: pOpacity,
      size: 4 + i * 0.5,
    };
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "transparent",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,230,77,0.35) 0%, transparent 70%)",
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#00E64D" : "#3B82F6",
            opacity: p.opacity,
            transform: `translate(${p.x}px, ${p.y}px)`,
          }}
        />
      ))}

      {/* Logo */}
      <Img
        src={staticFile("images/logo.png")}
        style={{
          width: 420,
          objectFit: "contain",
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: "58%",
          fontFamily,
          fontSize: 52,
          fontWeight: 900,
          color: "white",
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: tagOpacity,
          transform: `translateY(${tagY}px)`,
        }}
      >
        PLAY. WIN. <span style={{ color: "#00E64D" }}>REWARD.</span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: "68%",
          fontSize: 22,
          color: "rgba(255,255,255,0.5)",
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          letterSpacing: 2,
        }}
      >
        The fan engagement platform for competitive sports
      </div>
    </AbsoluteFill>
  );
};
