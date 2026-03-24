import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBg: React.FC = () => {
  const frame = useCurrentFrame();

  const x1 = interpolate(frame, [0, 540], [0, 60]);
  const y1 = interpolate(frame, [0, 540], [0, 40]);
  const x2 = interpolate(frame, [0, 540], [100, 50]);
  const y2 = interpolate(frame, [0, 540], [100, 70]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 800px 600px at ${30 + x1 * 0.3}% ${20 + y1 * 0.3}%, rgba(0,230,77,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 600px 500px at ${70 + (x2 - 100) * 0.2}% ${80 + (y2 - 100) * 0.2}%, rgba(59,130,246,0.04) 0%, transparent 70%),
          linear-gradient(160deg, #07090D 0%, #0B0E16 40%, #0D1118 100%)
        `,
      }}
    />
  );
};
