// Superfans — shared presentational primitives (premium dark, mobile-first)
import { initials, statusMeta, tierMeta } from "../lib/format";
import type { MatchStatus } from "../lib/queries";

export function TeamBadge({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      <img
        src={src} alt={name} width={size} height={size}
        className="rounded-full object-contain bg-zinc-800 ring-1 ring-white/10"
        style={{ width: size, height: size }}
        loading="lazy"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-zinc-800 ring-1 ring-white/10 grid place-items-center text-zinc-300 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </div>
  );
}

export function StatusPill({ status, minute }: { status: MatchStatus; minute?: number | null }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide ${m.tone}`}>
      {m.dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {m.label}{status === "live" && minute ? ` ${minute}'` : ""}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const t = tierMeta(tier);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${t.tone}`}>
      <span>{t.emoji}</span>{tier}
    </span>
  );
}

export function Avatar({ name, src, size = 36 }: { name: string; src?: string | null; size?: number }) {
  if (src) return <img src={src} alt={name} className="rounded-full object-cover ring-1 ring-white/10" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full bg-gradient-to-br from-emerald-500/30 to-sky-500/30 ring-1 ring-white/10 grid place-items-center text-emerald-200 font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {initials(name || "Fan")}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function EmptyState({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-800 py-14 text-center">
      <div className="text-3xl">{icon ?? "⚽"}</div>
      <div className="font-semibold text-zinc-200">{title}</div>
      {subtitle && <div className="max-w-xs text-sm text-zinc-500">{subtitle}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">{children}</h2>
      {action}
    </div>
  );
}
