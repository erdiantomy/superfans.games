import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { C } from "@/components/arena";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: profileSlug } = useQuery({
    queryKey: ["my-profile-slug", user?.id],
    queryFn: async () => {
      const { data: player } = await (supabase as any).from("padel_players").select("id").eq("user_id", user!.id).single();
      if (!player) return null;
      const { data: profile } = await (supabase as any).from("player_profiles").select("slug").eq("player_id", player.id).single();
      return profile?.slug ?? null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch active session count for the venue
  const { data: venueId } = useQuery({
    queryKey: ["venue-id-for-nav", slug],
    queryFn: async () => {
      const { data } = await (supabase as any).from("venues").select("id").eq("slug", slug!).eq("status", "active").maybeSingle();
      return data?.id ?? null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeSessionCount = 0 } = useQuery({
    queryKey: ["venue-active-session-count", venueId],
    queryFn: async () => {
      const { count } = await (supabase.from as any)("sessions")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId!)
        .in("status", ["live", "active"]);
      return count ?? 0;
    },
    enabled: !!venueId,
    refetchInterval: 30_000,
  });

  const { t } = useTranslation();

  if (!user || !slug) return null;

  const path = location.pathname;
  const tabs = [
    { id: "home", icon: "🏟️", label: t("nav.home"), path: `/${slug}`, badge: 0 },
    { id: "rank", icon: "🏆", label: t("nav.rankings"), path: `/${slug}/rank`, badge: 0 },
    { id: "sessions", icon: "🎾", label: t("nav.sessions"), path: `/${slug}/sessions`, badge: activeSessionCount },
    { id: "profile", icon: "👤", label: t("nav.myPage"), path: profileSlug ? `/${profileSlug}/dashboard` : "/auth", badge: 0 },
    { id: "topup", icon: "💰", label: t("nav.topUp"), path: "/topup", badge: 0 },
  ];

  const getActive = () => {
    if (path === `/${slug}/rank`) return "rank";
    if (path === `/${slug}/sessions`) return "sessions";
    if (path === "/topup") return "topup";
    if (profileSlug && path === `/${profileSlug}/dashboard`) return "profile";
    if (path.endsWith("/dashboard")) return "profile";
    if (path === `/${slug}`) return "home";
    return "";
  };

  const active = getActive();

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", justifyContent: "center",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        height: 56, display: "flex",
        background: C.bg, borderTop: `1px solid ${C.border}`,
      }}>
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === "profile" && !user) {
                  toast("Sign in to view your profile");
                  navigate("/auth");
                } else {
                  navigate(t.path);
                }
              }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 1,
                background: "none", border: "none", cursor: "pointer",
                padding: 0, minWidth: 0, position: "relative",
              }}
            >
              <span style={{ fontSize: 16, opacity: isActive ? 1 : 0.4, position: "relative" }}>
                {t.icon}
                {t.badge > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -10,
                    background: C.green, color: "#0D0D0D",
                    fontSize: 8, fontWeight: 900, lineHeight: 1,
                    minWidth: 14, height: 14, borderRadius: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px",
                  }}>
                    {t.badge}
                  </span>
                )}
              </span>
              <span className="font-display" style={{
                fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase" as const,
                color: isActive ? C.green : C.muted,
                whiteSpace: "nowrap",
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
