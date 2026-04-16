import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSession, useSessionPlayers, usePadelPlayer, useSessionSupports, usePlaceSupport, useRequestJoin, useUpdatePlayerStatus, useUpdateSession } from "@/hooks/useArena";
import { incrementQuestProgress } from "@/hooks/useQuests";
import { useSessionRealtime } from "@/hooks/useRealtime";
import { getDivision, getDivisionProgress, getXpToNextDivision, cr, resolveSupports } from "@/lib/gamification";
import { Av, Tag, StatusTag, CountdownBadge, Divider, Row, C, fmtLabel, shareUrl, fmtTs } from "@/components/arena";
import PlayerLink from "@/components/arena/PlayerLink";
import { toast } from "sonner";
import logo from "@/assets/superfans-logo.png";

type AuthState = "loading" | "preview" | "unauthenticated" | "pending" | "approved" | "host";

const QUEST_HINTS = [
  { icon: "🏸", label: "Play a Match", desc: "Progress on daily & weekly match quests" },
  { icon: "🔥", label: "Build Streak", desc: "Win consecutive matches for streak quests" },
  { icon: "⭐", label: "Earn XP", desc: "Climb divisions with every game played" },
];

function QuestHints() {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>
        🎯 Quest progress by joining
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {QUEST_HINTS.map(q => (
          <div key={q.label} style={{ display: "flex", alignItems: "center", gap: 10, background: `${C.green}08`, border: `1px solid ${C.green}14`, borderRadius: 10, padding: "8px 12px" }}>
            <span style={{ fontSize: 16 }}>{q.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.fg }}>{q.label}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{q.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SessionPage() {
  const { code }      = useParams<{ code: string }>();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { data: me }  = usePadelPlayer(user?.id);

  const { data: session, isLoading: sLoad } = useSession(code);
  const { data: sessionPlayers = [] }        = useSessionPlayers(session?.id);
  const { data: supports = [] }              = useSessionSupports(session?.id);

  useSessionRealtime(session?.id);

  useEffect(() => {
    document.title = session?.name ? `${session.name} | SuperFans` : "SuperFans";
    return () => { document.title = "SuperFans — Play. Compete. Get Supported."; };
  }, [session?.name]);

  const requestJoin      = useRequestJoin();
  const updateStatus     = useUpdatePlayerStatus();
  const placeSupport     = usePlaceSupport();
  const updateSession    = useUpdateSession();

  const [tab,       setTab]       = useState("live");
  const [copied,    setCopied]    = useState(false);
  const [supPicked, setSupPicked] = useState<string | null>(null);
  const [supAmt,    setSupAmt]    = useState(50000);
  const [supported, setSupported] = useState(false);
  const [locked,    setLocked]    = useState(false);
  const [justRequested, setJustRequested] = useState(false);

  // Derive auth state
  const authState: AuthState = (() => {
    if (sLoad) return "loading";
    if (!session) return "preview";
    if (!user || !me) return "unauthenticated";
    if (session.host_id === me.id) return "host";
    const sp = sessionPlayers.find(p => p.player_id === me.id);
    if (!sp) return "preview";
    if (sp.status === "approved") return "approved";
    return "pending";
  })();

  const isHost     = authState === "host";
  const canSee     = authState === "approved" || authState === "host";
  const isActive   = session && ["active","live","finished"].includes(session.status);

  const approved   = sessionPlayers.filter(p => p.status === "approved");
  const pending    = sessionPlayers.filter(p => p.status === "pending");
  const pool       = supports.reduce((t, s) => t + s.amount, 0);

  const copy = () => {
    if (!session) return;
    const slug = (window.location.pathname.match(/^\/([^/]+)\/session/) || [])[1];
    navigator.clipboard?.writeText(shareUrl(session.code, slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const handleJoin = async () => {
    if (!session || !me) return;
    try {
      await requestJoin.mutateAsync({ sessionId: session.id, playerId: me.id });
      setJustRequested(true);
      toast.success("Join request sent · Waiting for host approval");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed to join"); }
  };

  const handleApprove = async (spId: string) => {
    if (!session) return;
    await updateStatus.mutateAsync({ id: spId, status: "approved", sessionId: session.id });
    toast.success("Player approved");
  };

  const handleDecline = async (spId: string) => {
    if (!session) return;
    await updateStatus.mutateAsync({ id: spId, status: "declined", sessionId: session.id });
    toast.error("Player declined");
  };

  const handleSupport = async () => {
    if (!session || !me || !supPicked) return;
    try {
      await placeSupport.mutateAsync({ sessionId: session.id, supporterId: me.id, backedId: supPicked, amount: supAmt });
      setSupported(true);
      toast.success(`You're backing this player — ${cr(supAmt)} locked`);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Failed to place support"); }
  };

  const tabs = isHost
    ? [{ v: "players", l: `👥 Players${pending.length > 0 ? ` (${pending.length})` : ""}` }, { v: "live", l: "Live" }, { v: "standings", l: "Standings" }, { v: "support", l: "⭐ Support" }, { v: "rounds", l: "Rounds" }, { v: "share", l: "🔗 Share" }]
    : [{ v: "live", l: "Live" }, { v: "standings", l: "Standings" }, { v: "support", l: "⭐ Support" }, { v: "rounds", l: "Rounds" }];

  if (sLoad) {
    return (
      <div style={{ height: "100dvh", background: C.bg, color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.green}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 12, color: C.muted }}>Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ height: "100dvh", background: C.bg, color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 800 }}>Session not found</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>This link may be invalid or expired</div>
          <button onClick={() => navigate("/")} style={{ marginTop: 20, background: C.green, border: "none", color: "#0A0C11", padding: "12px 24px", borderRadius: 12, fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>← HOME</button>
        </div>
      </div>
    );
  }

  // PUBLIC PREVIEW (not signed in and session is not draft)
  if (session && (!user || !me) && (session.status as string) !== 'draft') {
    const spotsLeft = Math.max(0, session.max_players - approved.length);
    const xpEstimate = (session as any).points_per_match * 3 || 96;
    const venueDisplay = (session as any).venue_id
      ? (session as any).venue?.name
      : (session as any).venue_name_tag || "Independent Session";

    return (
      <div style={{ height: "100dvh", background: C.bg, color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <img src={logo} alt="SuperFans" style={{ height: 28 }} />
          </button>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900 }}>Session Preview</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 120px" }}>
          {/* Event Identity */}
          <div style={{ background: "linear-gradient(160deg,#0D1E14,#0A0C11)", border: `1px solid ${C.green}30`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <StatusTag status={session.status} />
              <Tag label={fmtLabel(session.format)} color={session.format === "americano" ? C.green : C.purple} />
            </div>
            <div className="font-display" style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>{session.name}</div>
            {session.scheduled_at && (
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{fmtTs(session.scheduled_at)}</div>
            )}
            <div style={{ fontSize: 12, color: C.muted }}>
              Hosted by <strong style={{ color: C.fg }}>{session.host?.name || "Unknown"}</strong>
            </div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>📍 {venueDisplay}</div>
          </div>

          {/* Social Proof */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{approved.length}</div>
              <div style={{ fontSize: 10, color: C.muted }}>players joined</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
              {spotsLeft > 0 ? (
                <>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.green }}>{spotsLeft}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>spots left</div>
                </>
              ) : (
                <>
                  <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.red }}>FULL</div>
                  <div style={{ fontSize: 10, color: C.muted }}>no spots left</div>
                </>
              )}
            </div>
          </div>

          {spotsLeft > 0 && session.status !== "pending_approval" && (
            <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}25`, borderRadius: 12, padding: "10px 14px", marginBottom: 20, textAlign: "center", fontSize: 13, color: C.green, fontWeight: 700 }}>
              ⚡ Join to earn up to {xpEstimate} XP
            </div>
          )}

          {/* CTA */}
          {session.status === "pending_approval" ? (
            <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}30`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 13, color: C.orange, fontWeight: 700 }}>This session is awaiting approval. Check back soon.</div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                style={{ width: "100%", background: `linear-gradient(135deg, ${C.green}, ${C.green}cc)`, border: "none", color: "#0A0C11", padding: "16px 0", borderRadius: 16, fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: `0 14px 34px ${C.green}30`, letterSpacing: 0.8 }}
              >
                JOIN THIS SESSION
              </button>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Free to join · Takes 30 seconds</div>
            </div>
          )}

          {/* Quest hints */}
          <QuestHints />
        </div>
      </div>
    );
  }

  // PREVIEW (not signed in or not joined yet)
  if (!canSee) {
    return (
      <div style={{ height: "100dvh", background: C.bg, color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>←</button>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 900 }}>Session Preview</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 120px" }}>
          {/* Status gate */}
          {!isActive && (
            <div style={{ background: session.status === "rejected" ? `${C.red}12` : `${C.orange}12`, border: `1px solid ${session.status === "rejected" ? C.red : C.orange}30`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
              {session.status === "pending_approval" && <>⏳ <strong style={{ color: C.orange }}>Awaiting admin approval.</strong> This session is not yet open for joining.</>}
              {session.status === "rejected" && <>❌ <strong style={{ color: C.red }}>Session rejected by admin.</strong>{session.admin_note && <> Reason: {session.admin_note}</>}</>}
            </div>
          )}

          {/* Session card */}
          <div style={{ background: "linear-gradient(160deg,#0D1E14,#0A0C11)", border: `1px solid ${isActive ? C.green + "30" : C.border}`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              <Tag label={fmtLabel(session.format)} color={session.format === "americano" ? C.green : C.purple} />
              <Tag label={session.partner_type === "random" ? "🎲 Random" : "🤝 Fixed"} color={session.partner_type === "random" ? C.orange : C.blue} />
              <StatusTag status={session.status} />
            </div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{session.name}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              Hosted by <strong style={{ color: C.fg }}>{session.host?.name}</strong> · {session.courts} court{session.courts > 1 ? "s" : ""} · doubles
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
              {approved.length}/{session.max_players} players joined
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {approved.map(sp => sp.player && <Av key={sp.id} initials={sp.player.avatar} size={32} color={getDivision(sp.player.lifetime_xp).color} />)}
              {Array.from({ length: Math.max(0, session.max_players - approved.length) }).map((_, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", border: `1.5px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, color: C.dim }}>+</span>
                </div>
              ))}
            </div>
          </div>

          {authState === "pending" || justRequested ? (
            <div style={{ background: `${C.orange}10`, border: `1px solid ${C.orange}30`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.green }}>REQUEST SENT!</div>
              <div style={{ fontSize: 13, color: C.fg, marginTop: 8, lineHeight: 1.6 }}>Your join request has been sent to the host.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14, textAlign: "left" }}>
                {[
                  { icon: "📩", text: "The host has been notified of your request" },
                  { icon: "⏳", text: "You'll be added to the session once approved" },
                  { icon: "🔔", text: "Check back here for status updates" },
                ].map(item => (
                  <div key={item.icon} style={{ display: "flex", alignItems: "center", gap: 10, background: "hsl(var(--accent))", borderRadius: 10, padding: "10px 12px" }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : isActive ? (
            <div style={{ background: "linear-gradient(180deg, hsl(var(--accent)), hsl(var(--card)))", border: "1px solid hsl(var(--green) / 0.28)", borderRadius: 20, padding: "18px 16px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 18px 42px hsl(var(--green) / 0.12)" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top, hsl(var(--green) / 0.14), transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <Tag label={user ? "PRIMARY ACTION" : "NEXT STEP"} color={C.green} dot />
                </div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, lineHeight: 1 }}>JOIN THIS SESSION</div>
                <div style={{ fontSize: 12, color: C.fg, textAlign: "center", marginBottom: 12, lineHeight: 1.6 }}>
                  {user ? "Tap the bright button below to send your join request. The host will review it next." : "Sign in first, then come right back here to request access to this session."}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {(user
                    ? ["1. Tap request", "2. Host reviews", "3. Join when approved"]
                    : ["1. Sign in", "2. Request access", "3. Wait for approval"]
                  ).map(step => (
                    <div key={step} style={{ fontSize: 10, color: C.muted, padding: "7px 11px", borderRadius: 999, border: "1px solid hsl(var(--green) / 0.16)", background: "hsl(var(--background) / 0.38)" }}>
                      {step}
                    </div>
                  ))}
                </div>
                <div style={{ background: "hsl(var(--green) / 0.08)", border: "1px solid hsl(var(--green) / 0.18)", borderRadius: 14, padding: "10px 12px", marginBottom: 14 }}>
                  <div className="font-display" style={{ fontSize: 13, fontWeight: 800, color: C.green, letterSpacing: 1 }}>READY TO PLAY?</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>The large button below is the main action for joining this session.</div>
                </div>
                {!user ? (
                  <>
                    <button onClick={() => navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`)} aria-label="Sign in to join this session" style={{ width: "100%", background: C.fg, border: "1px solid hsl(var(--foreground) / 0.28)", color: C.bg, padding: "15px 14px", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", boxShadow: "0 14px 34px hsl(var(--foreground) / 0.16)" }}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 15, fontWeight: 800 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        <span className="font-display" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.8 }}>SIGN IN TO JOIN</span>
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.76 }}>You’ll return here automatically</span>
                    </button>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>After signing in, tap the same large button to send your request.</div>
                  </>
                ) : (
                  <>
                    <button onClick={handleJoin} disabled={requestJoin.isPending} aria-label="Send join request" style={{ width: "100%", background: "linear-gradient(135deg, hsl(var(--green)), hsl(var(--green) / 0.82))", border: "1px solid hsl(var(--green) / 0.58)", color: C.bg, padding: "16px 14px", borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontFamily: "'Barlow Condensed'", fontWeight: 900, letterSpacing: 0.8, cursor: "pointer", boxShadow: "0 18px 38px hsl(var(--green) / 0.32)", textTransform: "uppercase", opacity: requestJoin.isPending ? 0.82 : 1 }}>
                      <span style={{ fontSize: 22, lineHeight: 1 }}>{requestJoin.isPending ? "SENDING REQUEST..." : "SEND JOIN REQUEST"}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 0.3, opacity: 0.82 }}>
                        {requestJoin.isPending ? "Please wait a moment" : "Primary action · host approval required"}
                      </span>
                    </button>
                    <div style={{ fontSize: 11, color: C.fg, marginTop: 10, fontWeight: 600 }}>Tap the bright green button to send your request to the host.</div>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {/* Quest hints */}
          <QuestHints />
        </div>

        {/* Sticky bottom join bar */}
        {authState !== "pending" && !justRequested && isActive && (
          <div style={{ position: "sticky", bottom: 0, flexShrink: 0, padding: "12px 16px", paddingBottom: "max(12px, env(safe-area-inset-bottom))", background: "linear-gradient(180deg, transparent, hsl(var(--background)) 20%)", borderTop: "1px solid hsl(var(--green) / 0.14)" }}>
            {!user ? (
              <button onClick={() => navigate(`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`)} style={{ width: "100%", background: C.fg, border: "none", color: C.bg, padding: "14px 14px", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, letterSpacing: 0.6, cursor: "pointer", boxShadow: "0 10px 28px hsl(var(--foreground) / 0.18)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                SIGN IN TO JOIN
              </button>
            ) : (
              <button onClick={handleJoin} disabled={requestJoin.isPending} style={{ width: "100%", background: "linear-gradient(135deg, hsl(var(--green)), hsl(var(--green) / 0.82))", border: "1px solid hsl(var(--green) / 0.5)", color: C.bg, padding: "14px 14px", borderRadius: 14, fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 900, letterSpacing: 0.6, cursor: "pointer", boxShadow: "0 10px 28px hsl(var(--green) / 0.28)", opacity: requestJoin.isPending ? 0.82 : 1 }}>
                {requestJoin.isPending ? "SENDING..." : "⚡ SEND JOIN REQUEST"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // FULL SESSION VIEW (host or approved player)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      style={{ height: "100dvh", background: C.bg, color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}
    >
      <motion.div
        className="pointer-events-none fixed inset-0 z-50"
        style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--green) / 0.12), transparent 70%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
            <img src={logo} alt="SuperFans" style={{ height: 28 }} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 900 }}>{session.name}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
              <Tag label={fmtLabel(session.format)} color={session.format === "americano" ? C.green : C.purple} />
              <StatusTag status={session.status} />
              {isHost && <Tag label="🏠 Host" color={C.orange} />}
            </div>
          </div>
          {me && <Av initials={me.avatar} size={32} color={getDivision(me.lifetime_xp).color} />}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 5, padding: "8px 12px 0", flexShrink: 0, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, background: tab === t.v ? `${C.green}15` : "transparent", border: `1px solid ${tab === t.v ? C.green + "40" : C.border}`, color: tab === t.v ? C.green : C.muted, fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{t.l}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 90px" }}>

        {/* POST-SESSION RECAP */}
        {session.status === "finished" && canSee && (
          <div style={{ background: "linear-gradient(135deg, #0B1A0C, #0B0E16)", border: `1px solid ${C.green}30`, borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.green, marginBottom: 4 }}>SESSION COMPLETE</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{session.name}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.green }}>{approved.length}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Players</div>
              </div>
              <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.gold }}>{cr(pool)}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Pool</div>
              </div>
              <div style={{ background: C.raised, borderRadius: 10, padding: "10px 6px" }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.blue }}>{supports.length}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>Supporters</div>
              </div>
            </div>
            {me && approved.find(sp => sp.player_id === me.id) && (() => {
              const div = getDivision(me.lifetime_xp);
              const xpToNext = getXpToNextDivision(me.lifetime_xp);
              return (
                <div style={{ background: C.raised, borderRadius: 12, padding: "12px 14px", textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: div.color }}>{div.label} Division</span>
                    <span className="font-display" style={{ fontSize: 16, fontWeight: 900, color: C.green }}>{me.lifetime_xp.toLocaleString()} XP</span>
                  </div>
                  <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ height: "100%", background: div.color, borderRadius: 2, width: `${getDivisionProgress(me.lifetime_xp)}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>
                    {xpToNext !== null ? `${xpToNext} XP to next division` : "You've reached the highest division!"}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* HOST: PLAYERS TAB */}
        {tab === "players" && isHost && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Session {locked ? "Locked" : "Open"}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{locked ? "No new join requests" : "Accepting requests"}</div>
              </div>
              <button onClick={() => setLocked(l => !l)} style={{ background: locked ? `${C.red}18` : `${C.green}18`, border: `1px solid ${locked ? C.red + "40" : C.green + "40"}`, color: locked ? C.red : C.green, padding: "7px 14px", borderRadius: 10, fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                {locked ? "🔓 Unlock" : "🔒 Lock"}
              </button>
            </div>

            {pending.length > 0 && (
              <>
                <Divider label={`Join Requests (${pending.length})`} />
                {pending.map(sp => sp.player && (
                  <div key={sp.id} style={{ background: C.card, border: `1px solid ${C.orange}40`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Av initials={sp.player.avatar} size={44} color={getDivision(sp.player.lifetime_xp).color} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}><PlayerLink player={sp.player} size={44} showAvatar={false} /></div>
                        <div style={{ fontSize: 11, color: C.muted }}>{sp.player.email}</div>
                        {sp.created_at && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>Requested {fmtTs(sp.created_at)}</div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleApprove(sp.id)} style={{ flex: 2, background: `${C.green}15`, border: `1px solid ${C.green}40`, color: C.green, padding: "10px 0", borderRadius: 10, fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✓ Approve</button>
                      <button onClick={() => handleDecline(sp.id)} style={{ flex: 1, background: `${C.red}12`, border: `1px solid ${C.red}35`, color: C.red, padding: "10px 0", borderRadius: 10, fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✕ Decline</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <Divider label={`Roster (${approved.length}/${session.max_players})`} />
            {approved.map((sp, i) => sp.player && (
              <div key={sp.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, marginBottom: 6, background: C.card, border: `1px solid ${C.border}` }}>
                <span style={{ width: 18, fontSize: 10, color: C.dim, textAlign: "center" }}>{i + 1}</span>
                <Av initials={sp.player.avatar} size={34} color={getDivision(sp.player.lifetime_xp).color} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}><PlayerLink player={sp.player} size={34} showAvatar={false} /></div>
                  <div style={{ fontSize: 10, color: C.muted }}>{sp.player.email}</div>
                </div>
                {sp.role === "host" && <Tag label="HOST" color={C.orange} />}
              </div>
            ))}
          </>
        )}

        {/* HOST: SHARE TAB */}
        {tab === "share" && isHost && (
          <>
            <Divider label="Invite Link" />
            <div style={{ background: "linear-gradient(135deg,#0B1A0C,#0B0E16)", border: `1px solid ${C.green}30`, borderRadius: 16, padding: 20, marginBottom: 14, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
              <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.green, marginBottom: 6 }}>SHARE TO INVITE</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>Only you (the host) can share this link. Players request to join — you approve or decline each one.</div>
              <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, textAlign: "left", wordBreak: "break-all" }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>Session Link</div>
                <div className="font-display" style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{shareUrl(session.code, (window.location.pathname.match(/^\/([^/]+)\/session/) || [])[1])}</div>
              </div>
              <button onClick={copy} style={{ width: "100%", background: copied ? `${C.green}20` : C.card, border: `1px solid ${copied ? C.green + "50" : C.border}`, color: copied ? C.green : C.fg, padding: "12px 0", borderRadius: 12, fontFamily: "'Barlow Condensed'", fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all .2s" }}>
                {copied ? "✓ Copied!" : "🔗 Copy Invite Link"}
              </button>
            </div>
            <div style={{ background: C.raised, border: `1px solid ${C.orange}25`, borderRadius: 12, padding: "10px 14px", fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
              🛡️ This link was issued after admin approval. Only admin-approved sessions get shareable links. This prevents fraud.
            </div>
          </>
        )}

        {/* LIVE TAB */}
        {tab === "live" && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "24px 0" }}>
            {session.status === "active" && "⏳ Session hasn't started yet. Matches will appear here once the host begins Round 1."}
            {session.status === "finished" && "✅ This session has ended. Check the Standings tab for final results."}
            {session.status === "live" && "No matches in progress. The host will start rounds when all players are ready."}
            {!["active", "finished", "live"].includes(session.status) && "No matches in progress. The host will start rounds when all players are ready."}
          </div>
        )}

        {/* STANDINGS TAB */}
        {tab === "standings" && (
          <>
            <Divider label="Session Standings" />
            <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 10, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
              Ranked by Wins then Win%. <strong style={{ color: C.fg }}>Win = 100 XP · Loss = 50 XP</strong> × rank multiplier. Updates live on score approval.
            </div>
            {approved.map((sp, i) => {
              if (!sp.player) return null;
              const div = getDivision(sp.player.lifetime_xp);
              return (
                <React.Fragment key={sp.id}>
                <Row style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, textAlign: "center", fontSize: i < 3 ? 15 : 11, fontWeight: 700, color: i < 3 ? C.green : C.dim }}>{["👑","🥈","🥉"][i] || i + 1}</span>
                  <Av initials={sp.player.avatar} size={34} color={div.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}><PlayerLink player={sp.player} size={34} showAvatar={false} /></div>
                    <Tag label={div.label} color={div.color} />
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-display" style={{ fontSize: 16, fontWeight: 900, color: C.green }}>{sp.player.lifetime_xp.toLocaleString()}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>lifetime XP</div>
                  </div>
                </Row>
                {sp.player_id === me?.id && (() => {
                  const xpToNext = getXpToNextDivision(sp.player.lifetime_xp);
                  return (
                    <div style={{ background: `${div.color}08`, border: `1px solid ${div.color}20`, borderRadius: 10, padding: "8px 12px", marginBottom: 8, marginTop: -4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                        <span style={{ color: div.color, fontWeight: 700 }}>{div.label}</span>
                        <span style={{ color: C.muted }}>
                          {xpToNext !== null ? `${xpToNext} XP to next` : "Max Division!"}
                        </span>
                      </div>
                      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: div.color, borderRadius: 2, width: `${getDivisionProgress(sp.player.lifetime_xp)}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })()}
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* SUPPORT TAB */}
        {tab === "support" && (
          <>
            <Divider label="⭐ Player Support" />
            <div style={{ marginBottom: 12 }}><CountdownBadge startTime={session.scheduled_at} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {[{ v: cr(pool), l: "Total pool", c: C.green }, { v: supports.length, l: "Supporters", c: C.blue }, { v: "70/20/10", l: "Split", c: C.gold }].map(s => (
                <div key={s.l} style={{ background: C.raised, borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                  <div className="font-display" style={{ fontSize: 15, fontWeight: 900, color: s.c, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 12, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
              ⭐ Back a player before match starts. Winner-takes-all. If your player finishes 1st you earn from the losing pool. The winner gets 20% bonus too.
            </div>
            {supported ? (
              <div style={{ background: `${C.green}10`, border: `1px solid ${C.green}30`, borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.green }}>YOU'RE BACKING</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{approved.find(sp => sp.player_id === supPicked)?.player?.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{cr(supAmt)} locked · Cannot cancel</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Pick a Player</div>
                {approved.filter(sp => sp.player_id !== me?.id).map(sp => {
                  if (!sp.player) return null;
                  const div = getDivision(sp.player.lifetime_xp);
                  const sel = supPicked === sp.player_id;
                  const pSupport = supports.filter(s => s.backed_id === sp.player_id).reduce((t, s) => t + s.amount, 0);
                  const pct = pool > 0 ? Math.round((pSupport / pool) * 100) : 0;
                  return (
                    <div key={sp.id} onClick={() => setSupPicked(sp.player_id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, marginBottom: 6, background: sel ? `${div.color}12` : C.raised, border: `2px solid ${sel ? div.color : C.border}`, cursor: "pointer", transition: "all .15s" }}>
                      <Av initials={sp.player.avatar} size={36} color={div.color} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}><PlayerLink player={sp.player} size={36} showAvatar={false} /></div>
                        <Tag label={div.label} color={div.color} />
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="font-display" style={{ fontSize: 14, fontWeight: 900, color: pSupport > 0 ? C.green : C.dim }}>{cr(pSupport)}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{pct}% of pool</div>
                      </div>
                      {sel && <span>✅</span>}
                    </div>
                  );
                })}
                {supPicked && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[10000, 50000, 100000, 200000].map(a => (
                        <button key={a} onClick={() => setSupAmt(a)} style={{ background: supAmt === a ? `${C.green}20` : C.raised, border: `1px solid ${supAmt === a ? C.green + "50" : C.border}`, color: supAmt === a ? C.green : C.muted, padding: "10px 4px", borderRadius: 12, fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>{a / 1000}k</button>
                      ))}
                    </div>
                    <button onClick={handleSupport} disabled={placeSupport.isPending} style={{ width: "100%", background: `linear-gradient(135deg,${C.green},${C.green}cc)`, border: "none", color: "#0A0C11", padding: "13px 0", borderRadius: 12, fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
                      {placeSupport.isPending ? "SENDING..." : `⭐ BACK — ${cr(supAmt)}`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ROUNDS TAB */}
        {tab === "rounds" && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "24px 0" }}>
            {session.status === "finished" && "Session complete. All rounds have been played."}
            {session.status === "active" && "Rounds will appear here once the session begins."}
            {!["finished", "active"].includes(session.status) && "No rounds generated yet."}
          </div>
        )}
      </div>
    </motion.div>
  );
}
