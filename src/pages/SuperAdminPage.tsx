import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { C, Tag } from "@/components/arena";
import { toast } from "sonner";

const SUPER_ADMIN_PASS = "superfans2026!";

interface Venue {
  id: string; slug: string; name: string; city: string | null;
  status: string; created_at: string; primary_color: string | null;
}

interface Registration {
  id: string; contact_name: string; contact_email: string; contact_phone: string;
  city: string; country: string; venue_name: string; slug: string;
  courts: number; primary_color: string; monthly_prize: number;
  prize_split_1st: number; prize_split_2nd: number; prize_split_3rd: number;
  admin_password_hash: string | null; logo_url: string | null;
  status: string; created_at: string;
}

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<"registrations" | "venues">("registrations");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch venues (uses service-level query; super admin bypasses RLS via direct query)
  const { data: venues = [], isLoading: vLoad } = useQuery({
    queryKey: ["super-admin-venues"],
    enabled: authed,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("venues").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Venue[];
    },
  });

  // Fetch pending registrations
  const { data: registrations = [], isLoading: rLoad } = useQuery({
    queryKey: ["super-admin-registrations"],
    enabled: authed,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("venue_registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Registration[];
    },
  });

  const pendingRegs = registrations.filter(r => r.status === "pending");

  // ─── Approve registration ──────────────────────────────
  const approveRegistration = async (reg: Registration) => {
    try {
      // 1. Insert into venues table
      const { error: venueErr } = await (supabase as any).from("venues").insert({
        slug: reg.slug,
        name: reg.venue_name,
        city: reg.city,
        country: reg.country,
        courts_default: reg.courts,
        primary_color: reg.primary_color,
        monthly_prize: reg.monthly_prize,
        prize_split_1st: reg.prize_split_1st,
        prize_split_2nd: reg.prize_split_2nd,
        prize_split_3rd: reg.prize_split_3rd,
        admin_password_hash: reg.admin_password_hash,
        logo_url: reg.logo_url,
        contact_name: reg.contact_name,
        contact_email: reg.contact_email,
        contact_phone: reg.contact_phone,
        status: "active",
      });
      if (venueErr) throw venueErr;

      // 2. Update registration status
      const { error: regErr } = await (supabase as any).from("venue_registrations")
        .update({ status: "approved" })
        .eq("id", reg.id);
      if (regErr) throw regErr;

      toast.success(`${reg.venue_name} approved and activated!`);
      qc.invalidateQueries({ queryKey: ["super-admin-venues"] });
      qc.invalidateQueries({ queryKey: ["super-admin-registrations"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    }
  };

  // ─── Reject registration ──────────────────────────────
  const rejectRegistration = async (regId: string) => {
    try {
      const { error } = await (supabase as any).from("venue_registrations")
        .update({ status: "rejected" })
        .eq("id", regId);
      if (error) throw error;
      toast.error("Registration rejected");
      setRejectId(null);
      setRejectReason("");
      qc.invalidateQueries({ queryKey: ["super-admin-registrations"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
  };

  // ─── Password gate ────────────────────────────────────
  if (!authed) {
    const check = () => {
      if (pass === SUPER_ADMIN_PASS) setAuthed(true);
      else { alert("Incorrect password"); setPass(""); }
    };
    return (
      <div style={{ height: "100dvh", background: "#0A0A0E", color: C.fg, maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔐</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 900, color: C.orange, letterSpacing: 1 }}>SUPER ADMIN</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, marginBottom: 24 }}>Platform-level access</div>
          <input value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && check()} type="password" placeholder="Super admin password" style={{ width: "100%", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", color: C.fg, fontSize: 14, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <button onClick={check} style={{ width: "100%", background: C.orange, border: "none", color: "#0A0C11", padding: "13px 0", borderRadius: 12, fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 800, cursor: "pointer", marginBottom: 8 }}>ENTER →</button>
          <button onClick={() => navigate("/")} style={{ width: "100%", background: "none", border: "none", color: C.muted, padding: "8px 0", fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>← Back</button>
        </div>
      </div>
    );
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  // ─── MAIN ─────────────────────────────────────────────
  return (
    <div style={{ height: "100dvh", background: "#0A0A0E", color: C.fg, maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: "#0E0D0A" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 900, color: C.orange, letterSpacing: 1 }}>SUPER ADMIN</div>
            <div style={{ fontSize: 9, color: C.dim, letterSpacing: 1 }}>SUPERFANS PLATFORM</div>
          </div>
          <button onClick={() => navigate("/")} style={{ background: C.raised, border: `1px solid ${C.border}`, color: C.muted, padding: "5px 10px", borderRadius: 8, fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>← Exit</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {([
          { v: "registrations" as const, l: "📝 Registrations", n: pendingRegs.length },
          { v: "venues" as const, l: "🏟️ All Venues" },
        ]).map(t => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{ flex: 1, padding: "10px 0", background: tab === t.v ? "#0E0D0A" : C.bg, border: "none", borderBottom: tab === t.v ? `2px solid ${C.orange}` : "2px solid transparent", color: tab === t.v ? C.orange : C.muted, fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t.l}
            {"n" in t && (t as any).n > 0 && <span style={{ background: C.red, color: "#fff", fontSize: 9, fontWeight: 900, borderRadius: 10, padding: "1px 4px", marginLeft: 4 }}>{(t as any).n}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 90px" }}>

        {/* REGISTRATIONS */}
        {tab === "registrations" && (
          <>
            {rLoad ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>Loading...</div>
            ) : registrations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14, color: C.muted }}>No registrations yet</div>
              </div>
            ) : (
              registrations.map(r => {
                const isPending = r.status === "pending";
                const isApproved = r.status === "approved";
                const isRejected = r.status === "rejected";
                return (
                  <div key={r.id} style={{ background: C.card, border: `1px solid ${isPending ? C.orange + "40" : isApproved ? C.green + "30" : C.red + "25"}`, borderRadius: 14, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{r.venue_name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{r.city}, {r.country}</div>
                      </div>
                      <Tag label={r.status.toUpperCase()} color={isPending ? C.orange : isApproved ? C.green : C.red} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <span style={{ width: 14, height: 14, borderRadius: 3, background: r.primary_color, display: "inline-block" }} />
                      <span style={{ fontSize: 12, color: C.muted }}>superfans.games/<strong style={{ color: C.fg }}>{r.slug}</strong></span>
                    </div>
                    <div style={{ background: C.raised, borderRadius: 10, padding: "8px 12px", marginBottom: 8, fontSize: 11, color: C.muted, lineHeight: 1.8 }}>
                      👤 {r.contact_name}<br />
                      📧 {r.contact_email}<br />
                      📱 {r.contact_phone}<br />
                      🎾 {r.courts} courts · Prize: Rp {r.monthly_prize.toLocaleString("id-ID")}<br />
                      📅 {fmtDate(r.created_at)}
                    </div>
                    {isApproved && <div style={{ color: C.green, fontSize: 12, fontWeight: 700 }}>✅ Approved & Activated</div>}
                    {isRejected && <div style={{ color: C.red, fontSize: 12, fontWeight: 700 }}>❌ Rejected</div>}
                    {isPending && rejectId === r.id && (
                      <div style={{ marginBottom: 8 }}>
                        <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Rejection reason (optional)" style={{ width: "100%", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.fg, fontSize: 12, outline: "none", marginBottom: 6, boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => rejectRegistration(r.id)} style={{ flex: 1, background: C.red, border: "none", color: "#fff", padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Confirm Reject</button>
                          <button onClick={() => { setRejectId(null); setRejectReason(""); }} style={{ flex: 1, background: C.raised, border: `1px solid ${C.border}`, color: C.muted, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {isPending && rejectId !== r.id && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => approveRegistration(r)} style={{ flex: 2, background: `${C.green}15`, border: `1px solid ${C.green}40`, color: C.green, padding: "10px 0", borderRadius: 10, fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✓ Approve & Activate</button>
                        <button onClick={() => setRejectId(r.id)} style={{ flex: 1, background: `${C.red}12`, border: `1px solid ${C.red}35`, color: C.red, padding: "10px 0", borderRadius: 10, fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✕ Reject</button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* ALL VENUES */}
        {tab === "venues" && (
          <>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>All registered venues on the platform.</div>
            {vLoad ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>Loading...</div>
            ) : venues.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>No venues yet</div>
            ) : (
              venues.map((v: Venue) => (
                <div key={v.id} onClick={() => navigate(`/${v.slug}`)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: v.primary_color || "#00E676", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{v.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>/{v.slug} · {v.city || "—"}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Tag label={v.status.toUpperCase()} color={v.status === "active" ? C.green : v.status === "suspended" ? C.red : C.orange} />
                    <div style={{ fontSize: 10, color: C.dim, marginTop: 4 }}>{fmtDate(v.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
