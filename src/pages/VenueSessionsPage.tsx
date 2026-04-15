import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useVenue } from "@/hooks/useVenue";
import { useAuth } from "@/hooks/useAuth";
import { Tag, StatusTag, CountdownBadge, Divider, C, fmtLabel } from "@/components/arena";
import BottomNav from "@/components/arena/BottomNav";
import type { Session } from "@/hooks/useArena";

export default function VenueSessionsPage() {
  const navigate = useNavigate();
  const { venue, loading: venueLoading, slug } = useVenue();
  const { user } = useAuth();
  const venueId = venue?.id;
  const accent = venue?.primary_color || C.green;

  // Active / live sessions
  const { data: activeSessions = [] } = useQuery({
    queryKey: ["venue-sessions-active", venueId],
    enabled: !!venueId,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("sessions")
        .select("*, host:padel_players!sessions_host_id_fkey(*)")
        .eq("venue_id", venueId!)
        .in("status", ["live", "active"])
        .order("created_at", { ascending: false });
      return (data ?? []) as Session[];
    },
  });

  // Finished / past sessions
  const { data: pastSessions = [] } = useQuery({
    queryKey: ["venue-sessions-past", venueId],
    enabled: !!venueId,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("sessions")
        .select("*, host:padel_players!sessions_host_id_fkey(*)")
        .eq("venue_id", venueId!)
        .eq("status", "finished")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Session[];
    },
  });

  // Tagged sessions (independent hosts)
  const { data: taggedSessions = [] } = useQuery({
    queryKey: ["venue-tagged-sessions-page", venue?.name],
    enabled: !!venue?.name,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("sessions")
        .select("*, host:padel_players!sessions_host_id_fkey(*)")
        .ilike("venue_name_tag", venue!.name)
        .is("venue_id", null)
        .eq("venue_claim_status", "unlinked")
        .order("created_at", { ascending: false });
      return (data ?? []) as Session[];
    },
  });

  if (venueLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div style={{ color: C.muted, fontSize: 14 }}>Loading sessions...</div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <div style={{ fontSize: 48 }}>🏟️</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Venue not found</div>
      </div>
    );
  }

  const live = activeSessions.filter(s => s.status === "live");
  const upcoming = activeSessions.filter(s => s.status === "active");

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto" style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>🎾</span>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900 }}>Sessions</div>
          <div style={{ fontSize: 10, color: C.muted }}>{venue.name}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 120px" }}>
        {/* Browse all sessions CTA */}
        <div
          onClick={() => navigate("/sessions")}
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            borderRadius: 16, padding: "14px 16px", marginBottom: 16,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>🔍 Browse All Sessions</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Find sessions across all venues</div>
          </div>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.9)" }}>→</div>
        </div>

        {/* Live sessions */}
        {live.length > 0 && (
          <>
            <Divider label="🔴 Live Now" />
            {live.map((s, i) => (
              <SessionCard key={s.id} session={s} slug={slug!} accent={accent} navigate={navigate} index={i} />
            ))}
          </>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <>
            <Divider label="Upcoming · Support Open" />
            {upcoming.map((s, i) => (
              <SessionCard key={s.id} session={s} slug={slug!} accent={accent} navigate={navigate} index={i} />
            ))}
          </>
        )}

        {/* No active sessions */}
        {live.length === 0 && upcoming.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎾</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>No active sessions</div>
            <div style={{ fontSize: 12, color: C.muted }}>Check back later or browse all sessions</div>
          </div>
        )}

        {/* Past sessions */}
        {pastSessions.length > 0 && (
          <>
            <Divider label="📋 Recent Results" />
            {pastSessions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/${slug}/session/${s.code}`)}
                style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: "10px 14px", marginBottom: 6,
                  cursor: "pointer", opacity: 0.8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <Tag label={fmtLabel(s.format)} color={s.format === "americano" ? accent : C.purple} />
                      <Tag label="Finished" color={C.muted} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: C.dim }}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : ""}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      Host: {(s as any).host?.name?.split(" ")[0] || "—"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}

        {/* Tagged sessions */}
        {taggedSessions.length > 0 && (
          <>
            <Divider label="Sessions Tagging This Venue" />
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>Hosted independently · Not yet linked</div>
            {taggedSessions.map(s => (
              <div key={s.id} style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Tag label={fmtLabel(s.format)} color={s.format === "americano" ? accent : C.purple} />
                  <Tag label={`Host: ${(s as any).host?.name?.split(" ")[0] || "Unknown"}`} color={C.orange} />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ─── Session Card ────────────────────────────────────
function SessionCard({ session: s, slug, accent, navigate, index }: {
  session: Session; slug: string; accent: string; navigate: (path: string) => void; index: number;
}) {
  const isLive = s.status === "live";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/${slug}/session/${s.code}`)}
      style={{
        background: isLive ? "linear-gradient(160deg,#0D1E14,#0A0C11)" : C.card,
        border: `1px solid ${isLive ? `${accent}35` : C.border}`,
        borderRadius: 16, padding: 14, marginBottom: 10, cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 900, marginBottom: 6 }}>{s.name}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Tag label={fmtLabel(s.format)} color={s.format === "americano" ? accent : C.purple} />
            {isLive && <Tag label="LIVE" color={accent} dot />}
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: C.muted }}>
          Host: <strong style={{ color: C.fg }}>{(s as any).host?.name?.split(" ")[0] || "—"}</strong>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isLive ? (
          <div style={{ fontSize: 11, color: accent, fontWeight: 600 }}>Tap to view session →</div>
        ) : (
          <CountdownBadge startTime={s.scheduled_at} compact />
        )}
        <div style={{
          background: `${accent}20`, border: `1px solid ${accent}50`,
          color: accent, padding: "5px 12px", borderRadius: 10,
          fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 800,
        }}>
          🎾 JOIN
        </div>
      </div>
    </motion.div>
  );
}
