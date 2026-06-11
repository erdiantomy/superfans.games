// Superfans — app shell: premium dark layout, top bar + mobile bottom nav
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy, Newspaper, CalendarDays, User, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "./ui";

const NAV = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/matches", label: "Matches", icon: CalendarDays, match: (p: string) => p.startsWith("/matches") || p.startsWith("/m/") },
  { to: "/feed", label: "Feed", icon: Newspaper, match: (p: string) => p.startsWith("/feed") },
  { to: "/leaderboard", label: "Ranks", icon: Trophy, match: (p: string) => p.startsWith("/leaderboard") },
  { to: "/me", label: "Profile", icon: User, match: (p: string) => p.startsWith("/me") },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-lime-500 text-zinc-950">
              <Zap size={16} strokeWidth={3} />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Super<span className="text-emerald-400">fans</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 sm:inline">
              ⚽ World Cup 2026
            </span>
            {user ? (
              <button onClick={() => navigate("/me")} className="rounded-full">
                <Avatar name={user.user_metadata?.name || user.email || "Fan"} src={user.user_metadata?.avatar_url} size={32} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-4">{children}</main>

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-900 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2">
          {NAV.map(({ to, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link key={to} to={to}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                  active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
                }`}>
                <Icon size={20} strokeWidth={active ? 2.6 : 2} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
