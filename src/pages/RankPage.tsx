import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMonthlyLeaderboard, useLifetimeLeaderboard, usePadelPlayer } from "@/hooks/useArena";
import { useArenaRealtime } from "@/hooks/useRealtime";
import { getDivision } from "@/lib/gamification";
import { Tag, C } from "@/components/arena";
import PlayerLink from "@/components/arena/PlayerLink";
import ClaimProfileBanner from "@/components/profile/ClaimProfileBanner";
import BottomNav from "@/components/arena/BottomNav";
import { useVenue } from "@/hooks/useVenue";

function fmtPrize(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}k`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function RankPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { venue } = useVenue();
  const [tab, setTab] = useState<"monthly" | "lifetime">("monthly");
  useArenaRealtime();

  useEffect(() => {
    document.title = "Rankings | SuperFans";
    return () => { document.title = "SuperFans — Play. Compete. Get Supported."; };
  }, []);

  const { data: monthly  = [], isLoading: mLoad } = useMonthlyLeaderboard();
  const { data: lifetime = [], isLoading: lLoad } = useLifetimeLeaderboard();

  // Check if user has a profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-check", user?.id],
    queryFn: async () => {
      const { data: player } = await (supabase as any).from("padel_players").select("id").eq("user_id", user!.id).single();
      if (!player) return null;
      const { data: profile } = await (supabase as any).from("player_profiles").select("slug").eq("player_id", player.id).single();
      return profile?.slug ?? null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: me } = usePadelPlayer(user?.id);

  const list    = tab === "monthly" ? monthly : lifetime;
  const loading = tab === "monthly" ? mLoad : lLoad;
  const top3    = list.slice(0, 3);
  const rest    = list.slice(3);

  // Find current user in list
  const myRank = (() => {
    if (!me) return null;
    const idx = list.findIndex((p: any) => p.id === me.id);
    return idx >= 0 ? { rank: idx + 1, player: list[idx] } : null;
  })();

  // Hot streaks
  const { data: hotStreaks = [] } = useQuery({
    queryKey: ["hot-streaks"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("padel_players")
        .select("id, name, avatar, streak")
        .gte("streak", 3)
        .order("streak", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumHeight = [80, 110, 60];
  const podiumEmoji  = ["🥈", "👑", "🥉"];
  const podiumRank   = [2, 1, 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      style={{
        minHeight: "100dvh", background: C.bg, color: C.fg,
        fontFamily: "'DM Sans', sans-serif", maxWidth: 480,
        margin: "0 auto", display: "flex", flexDirection: "column",
      }}
    >
      {/* Entrance glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50"
        style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--green) / 0.12), transparent 70%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* HEADER */}
      <div style={{
        padding: "14px 18px 12px",
        borderBottom: `1px solid ${C.border}`,
        background: "hsl(var(--card))",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 900, letterSpacing: 2, color: C.green, lineHeight: 1 }}>
              RANKINGS
            </div>
            <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1, marginTop: 2 }}>
              superfans.games · LIVE
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, color: C.muted }}>Auto-updates</span>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8 }}>
          {([
            { v: "monthly",  l: "🏅 Monthly Points",  sub: "Resets monthly · Prize season" },
            { v: "lifetime", l: "⚡ Lifetime XP",      sub: "All-time · Never resets" },
          ] as const).map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              flex: 1, padding: "9px 10px", borderRadius: 14,
              background: tab === t.v ? `${C.green}18` : C.raised,
              border: `1.5px solid ${tab === t.v ? C.green + "50" : C.border}`,
              color: tab === t.v ? C.green : C.muted,
              cursor: "pointer", textAlign: "left", transition: "all .15s",
            }}>
              <div className="font-display" style={{ fontSize: 12, fontWeight: 800 }}>{t.l}</div>
              <div style={{ fontSize: 9, color: tab === t.v ? C.green + "99" : C.dim, marginTop: 2 }}>{t.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

        {/* PRIZE BANNER — monthly only */}
        {tab === "monthly" && (
          <div style={{
            margin: "14px 18px 0",
            background: "hsl(var(--accent))",
            border: `1px solid ${C.green}25`,
            borderRadius: 16, padding: "12px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{venue?.name || "Prize"} · Prize Season</div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 900, color: C.green }}>
                {venue?.monthly_prize ? `Rp ${venue.monthly_prize.toLocaleString("id-ID")}` : "–"}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>
                {venue?.prize_split_1st && venue?.prize_split_2nd && venue?.prize_split_3rd
                  ? `🥇 ${fmtPrize(venue.prize_split_1st)} · 🥈 ${fmtPrize(venue.prize_split_2nd)} · 🥉 ${fmtPrize(venue.prize_split_3rd)}`
                  : "Prize splits TBD"}
              </div>
            </div>
          </div>
        )}

        {/* YOUR RANK banner */}
        {user && me && !loading && (
          <div style={{
            margin: "14px 18px 0", padding: "12px 16px",
            background: C.card, border: `1px solid ${C.border}`,
            borderLeft: `4px solid ${C.green}`, borderRadius: 14,
          }}>
            {myRank ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>YOUR RANK</div>
                  <div className="font-display" style={{ fontSize: 24, fontWeight: 900, color: C.green }}>#{myRank.rank}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.muted }}>
                    {tab === "monthly" ? (myRank.player as any).monthly_pts : (myRank.player as any).lifetime_xp}
                  </div>
                  <div style={{ fontSize: 9, color: C.dim }}>{tab === "monthly" ? "pts" : "XP"}</div>
                </div>
                <Tag label={getDivision((myRank.player as any).lifetime_xp).label} color={getDivision((myRank.player as any).lifetime_xp).color} />
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.muted }}>Unranked this month — play to get ranked</div>
            )}
          </div>
        )}
        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.muted, fontSize: 12 }}>
            Loading rankings...
          </div>
        )}

        {/* PODIUM — top 3 */}
        {!loading && top3.length >= 3 && (
          <div style={{ padding: "20px 18px 0" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 16 }}>
              {podiumOrder.map((player, i) => {
                if (!player) return <div key={i} style={{ flex: 1 }} />;
                const div = getDivision(player.lifetime_xp);
                const val = tab === "monthly" ? player.monthly_pts : player.lifetime_xp;
                const isPrime = podiumRank[i] === 1;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    <div style={{
                      background: isPrime
                        ? `hsl(var(--accent))`
                        : C.card,
                      border: `1.5px solid ${isPrime ? C.green + "50" : div.color + "30"}`,
                      borderRadius: 16,
                      padding: isPrime ? "20px 8px 14px" : "14px 8px 10px",
                      position: "relative",
                    }}>
                      {isPrime && (
                        <div style={{
                          position: "absolute", top: -11, left: "50%",
                          transform: "translateX(-50%)",
                          background: C.green, color: "hsl(var(--background))",
                          fontSize: 8, fontWeight: 900, padding: "2px 8px",
                          borderRadius: 20, whiteSpace: "nowrap", letterSpacing: 0.5,
                        }}>LEADER</div>
                      )}
                      <div style={{ fontSize: isPrime ? 26 : 20, marginBottom: 6 }}>{podiumEmoji[i]}</div>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                        <PlayerLink player={player} size={isPrime ? 50 : 38} glow={isPrime} nameOnly />
                      </div>
                      <div className="font-display" style={{ fontSize: isPrime ? 20 : 15, fontWeight: 900, color: div.color }}>
                        {val.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted }}>{tab === "monthly" ? "pts" : "XP"}</div>
                      <div style={{ marginTop: 4 }}>
                        <Tag label={div.label} color={div.color} />
                      </div>
                    </div>
                    {/* Podium base */}
                    <div style={{
                      height: podiumHeight[i], marginTop: 0,
                      background: isPrime
                        ? `linear-gradient(180deg, ${C.green}25, ${C.green}10)`
                        : `linear-gradient(180deg, ${C.raised}, ${C.border}40)`,
                      border: `1px solid ${isPrime ? C.green + "30" : C.border}`,
                      borderTop: "none", borderRadius: "0 0 8px 8px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div className="font-display" style={{
                        fontSize: 28, fontWeight: 900,
                        color: isPrime ? C.green : C.dim, opacity: 0.4,
                      }}>
                        {podiumRank[i]}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* FULL LIST — 4th onwards */}
        {!loading && (
          <div style={{ padding: "0 18px" }}>
            {/* Section label */}
            {rest.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1 }}>FULL STANDINGS</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            )}

            {rest.map((player, i) => {
              const rank = i + 4;
              const div  = getDivision(player.lifetime_xp);
              const val  = tab === "monthly" ? player.monthly_pts : player.lifetime_xp;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 14, marginBottom: 6,
                    background: C.card, border: `1px solid ${C.border}`,
                  }}
                >
                  <div className="font-display" style={{
                    width: 26, textAlign: "center", fontSize: 16,
                    fontWeight: 900, color: C.dim, flexShrink: 0,
                  }}>{rank}</div>
                  <PlayerLink player={player} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag label={div.label} color={div.color} />
                      {player.streak >= 3 && <Tag label={`🔥 ${player.streak}`} color="#FF8C00" />}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="font-display" style={{ fontSize: 18, fontWeight: 900, color: C.muted }}>
                      {val.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 9, color: C.dim }}>{tab === "monthly" ? "pts" : "XP"}</div>
                  </div>
                </motion.div>
              );
            })}

            {/* Empty state */}
            {!loading && list.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎾</div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: C.muted, marginBottom: 6 }}>
                  No rankings yet
                </div>
                <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.6 }}>
                  Rankings appear once the first<br />match is approved by staff.
                </div>
              </div>
            )}

            {/* Claim Your Page Banner */}
            {user && userProfile === null && (
              <ClaimProfileBanner />
            )}

            {/* Hot Streaks */}
            {hotStreaks.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 10, color: C.dim, fontWeight: 700, letterSpacing: 1 }}>🔥 HOT STREAKS</span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                {hotStreaks.map((p: any, i: number) => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 14, marginBottom: 6,
                    background: C.card, border: `1px solid ${C.border}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: `${C.orange}15`, border: `1.5px solid ${C.orange}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: C.orange,
                    }}>{p.avatar?.slice(0, 2) || "??"}</div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#FF8C00" }}>🔥 {p.streak} week streak</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            {list.length > 0 && (
              <div style={{
                margin: "16px 0 8px",
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: "14px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
                  Rankings update live when matches are approved by staff
                </div>
                <button onClick={() => navigate("/")} style={{
                  background: `${C.green}18`, border: `1px solid ${C.green}40`,
                  color: C.green, padding: "8px 20px", borderRadius: 20,
                  fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 800,
                  cursor: "pointer",
                }}>
                  VIEW LIVE SESSIONS →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <BottomNav />
    </motion.div>
  );
}
