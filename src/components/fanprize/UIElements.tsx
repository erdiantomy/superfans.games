import { type Match, type Player } from "@/data/constants";

export function Avatar({ s, size = 34, color = "hsl(var(--green))" }: { s: string; size?: number; color?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-bold"
      style={{ width: size, height: size, backgroundColor: `${color}22`, color, fontSize: size * 0.38 }}
    >
      {s}
    </div>
  );
}

export function LiveDot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-green animate-live-dot" />;
}

export function SportTag({ sport }: { sport: string }) {
  const colors: Record<string, string> = {
    Padel: "hsl(var(--green))",
    Badminton: "hsl(var(--blue))",
    Tennis: "#FF9800",
  };
  const c = colors[sport] || "hsl(var(--green))";
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}40` }}
    >
      {sport}
    </span>
  );
}

export function SupportBar({ a, b }: { a: number; b: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-green text-[11px] font-bold">{a}%</span>
        <span className="text-label text-[10px]">Support Split</span>
        <span className="text-blue text-[11px] font-bold">{b}%</span>
      </div>
      <div className="h-[5px] rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-600 ease-out"
          style={{ width: `${a}%`, background: "linear-gradient(90deg, hsl(var(--green)), hsl(155 100% 38%))" }}
        />
      </div>
    </div>
  );
}

export function SectionHead({ title, size = 16, mb = 12 }: { title: string; size?: number; mb?: number }) {
  return (
    <div className="font-display font-bold tracking-wider uppercase text-label" style={{ fontSize: size, marginBottom: mb, letterSpacing: 1.5 }}>
      {title}
    </div>
  );
}
