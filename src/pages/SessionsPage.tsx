import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { getDivision } from "@/lib/gamification";
import TopNav from "@/components/TopNav";
import { Search, MapPin, Calendar, Users, Filter } from "lucide-react";
import type { Session, PadelPlayer } from "@/hooks/useArena";

interface SessionWithVenue extends Session {
  venue?: { name: string; slug: string; city: string | null } | null;
  _playerCount?: number;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "live" | "past">("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["all-sessions-browse"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("sessions")
        .select("*, host:padel_players!sessions_host_id_fkey(id, name, avatar, lifetime_xp), venue:venues!sessions_venue_id_fkey(name, slug, city)")
        .in("status", ["active", "live", "finished"])
        .order("scheduled_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as SessionWithVenue[];
    },
  });

  // Get player counts per session
  const sessionIds = sessions.map(s => s.id);
  const { data: playerCounts = [] } = useQuery({
    queryKey: ["session-player-counts", sessionIds.join(",")],
    enabled: sessionIds.length > 0,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)("session_players")
        .select("session_id, status")
        .in("session_id", sessionIds)
        .eq("status", "approved");
      if (error) throw error;
      // Count per session
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.session_id] = (counts[row.session_id] || 0) + 1;
      }
      return counts;
    },
  });

  const now = new Date();
  const isExpired = (s: SessionWithVenue) => {
    if (!s.scheduled_at) return false;
    const scheduled = new Date(s.scheduled_at);
    // Consider expired if scheduled time + 3 hours has passed
    return scheduled.getTime() + 3 * 60 * 60 * 1000 < now.getTime();
  };

  const filtered = sessions.filter(s => {
    if (statusFilter === "past") {
      if (!isExpired(s) && s.status !== "finished") return false;
    } else if (statusFilter === "open") {
      if (s.status !== "active" || isExpired(s)) return false;
    } else if (statusFilter === "live") {
      if (s.status !== "live") return false;
    }
    // "all" shows everything — no filtering by status/expiry
    if (search) {
      const q = search.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) ||
        s.host?.name?.toLowerCase().includes(q) ||
        s.venue?.name?.toLowerCase().includes(q) ||
        s.venue?.city?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    return true;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black">Browse Sessions</h1>
            <p className="text-sm text-muted-foreground mt-1">Find a session to join</p>
          </div>
          {user && (
            <button
              onClick={() => navigate("/host")}
              className="bg-primary text-primary-foreground font-bold text-sm px-4 py-2 rounded-lg"
            >
              + Create
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, host, venue, or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {([
              { key: "all", label: "All" },
              { key: "open", label: "Open" },
              { key: "live", label: "🔴 Live" },
              { key: "past", label: "Past Sessions" },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                  statusFilter === f.key
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Status pills always visible */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "all", label: "Active", count: sessions.filter(s => s.status !== "finished" && !isExpired(s)).length },
            { key: "open", label: "Open", count: sessions.filter(s => s.status === "active" && !isExpired(s)).length },
            { key: "live", label: "Live", count: sessions.filter(s => s.status === "live").length },
            { key: "past", label: "Past", count: sessions.filter(s => s.status === "finished" || isExpired(s)).length },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                statusFilter === f.key
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-16">Loading sessions…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎾</div>
            <p className="font-bold text-lg mb-2">No open sessions right now</p>
            <p className="text-sm text-muted-foreground mb-6">Check back soon or create your own!</p>
            {user && (
              <button
                onClick={() => navigate("/host")}
                className="bg-primary text-primary-foreground font-bold text-sm px-6 py-3 rounded-xl"
              >
                Create a Session
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, i) => {
              const count = (playerCounts as Record<string, number>)[s.id] || 0;
              const spotsLeft = s.max_players - count;
              const hostDiv = s.host ? getDivision(s.host.lifetime_xp) : null;
              const venueSlug = s.venue?.slug;

              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(venueSlug ? `/${venueSlug}/session/${s.code}` : `/s/${s.code}`)}
                  className="bg-card border border-border rounded-2xl p-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {s.status === "live" && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {s.status === "active" && spotsLeft > 0 && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            OPEN
                          </span>
                        )}
                        {s.status === "active" && spotsLeft <= 0 && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            FULL
                          </span>
                        )}
                        {s.status === "finished" && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            FINISHED
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                          {s.format}
                        </span>
                      </div>
                      <h3 className="font-bold text-base">{s.name}</h3>
                    </div>
                    {s.status === "active" && spotsLeft > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (!user) navigate(`/auth?returnTo=${encodeURIComponent(venueSlug ? `/${venueSlug}/session/${s.code}` : `/s/${s.code}`)}`);
                          else navigate(venueSlug ? `/${venueSlug}/session/${s.code}` : `/s/${s.code}`);
                        }}
                        className="bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-lg shrink-0 ml-3"
                      >
                        Join
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(s.scheduled_at)} {formatTime(s.scheduled_at) && `· ${formatTime(s.scheduled_at)}`}
                    </span>
                    {s.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {s.venue.name}{s.venue.city ? `, ${s.venue.city}` : ""}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {count}/{s.max_players} players
                      {spotsLeft > 0 && s.status === "active" && (
                        <span className="text-primary font-semibold">· {spotsLeft} spots left</span>
                      )}
                    </span>
                  </div>

                  {s.host && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span>Hosted by</span>
                      <span className="font-semibold text-foreground">{s.host.name}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
