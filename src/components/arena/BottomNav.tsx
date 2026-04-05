import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { C } from "@/components/arena";
import { toast } from "sonner";

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

  if (!user || !slug) return null;

  const path = location.pathname;
  const tabs = [
    { id: "home", icon: "🏟️", label: "Home", path: `/${slug}` },
    { id: "rank", icon: "🏆", label: "Rankings", path: `/${slug}/rank` },
    { id: "profile", icon: "👤", label: profileSlug ? "My Page" : "Profile", path: profileSlug ? `/${profileSlug}` : "/auth" },
    { id: "topup", icon: "💰", label: "Top Up", path: "/topup" },
  ];

  const getActive = () => {
    if (path === `/${slug}/rank`) return "rank";
    if (path === "/topup") return "topup";
    if (profileSlug && path === `/${profileSlug}`) return "profile";
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
                if (t.id === "profile" && !profileSlug) {
                  toast("Sign in to claim your player page");
                  navigate("/auth");
                } else {
                  navigate(t.path);
                }
              }}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 2,
                background: "none", border: "none", cursor: "pointer",
                padding: 0,
              }}
            >
              <span style={{ fontSize: 18, opacity: isActive ? 1 : 0.4 }}>{t.icon}</span>
              <span className="font-display" style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 1,
                textTransform: "uppercase" as const,
                color: isActive ? C.green : C.muted,
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
