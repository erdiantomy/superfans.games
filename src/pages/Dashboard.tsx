import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import TopNav from "@/components/TopNav";
import { Zap, Users, Trophy, Heart, Plus, ClipboardList, Shield, BarChart3, Search, Star, LogOut } from "lucide-react";

interface DashCard {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: () => void;
  accent?: string;
  primary?: boolean;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();

  // Check if user has a player record
  const { data: player } = useQuery({
    queryKey: ["my-player", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("padel_players")
        .select("id, name, avatar, lifetime_xp, credits")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
  });

  // Check if user is a host (has created sessions)
  const { data: isHost } = useQuery({
    queryKey: ["is-host", player?.id],
    enabled: !!player,
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("id")
        .eq("host_id", player!.id)
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
  });

  // Upcoming sessions the player is part of
  const { data: mySessions = [] } = useQuery({
    queryKey: ["my-sessions", player?.id],
    enabled: !!player,
    queryFn: async () => {
      const { data } = await supabase
        .from("session_players")
        .select("session_id, sessions(id, name, status, code, scheduled_at)")
        .eq("player_id", player!.id)
        .in("status", ["confirmed", "pending"])
        .limit(5);
      return data ?? [];
    },
  });

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    || user?.user_metadata?.name?.split(" ")[0]
    || "Player";

  const playerCards: DashCard[] = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Join a Session",
      desc: "Find an open session at your venue and jump in",
      action: () => navigate("/venues"),
      primary: true,
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "My Sessions",
      desc: `${mySessions.length} upcoming · View history`,
      action: () => navigate("/fanprize"),
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "My XP & Rewards",
      desc: `${player?.lifetime_xp?.toLocaleString() ?? 0} XP earned`,
      action: () => navigate("/fanprize"),
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Support a Player",
      desc: "Back your favorite players before their matches",
      action: () => navigate("/top-players"),
    },
  ];

  const hostCards: DashCard[] = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Create a Session",
      desc: "Set up a new match session for your venue",
      action: () => navigate("/tomspadel/host"),
      primary: true,
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "My Sessions",
      desc: "View and manage your created sessions",
      action: () => navigate("/tomspadel/host"),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Manage Players",
      desc: "Approve join requests and manage rosters",
      action: () => navigate("/tomspadel/host"),
    },
  ];

  const fanCards: DashCard[] = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Browse Players",
      desc: "Discover players to support",
      action: () => navigate("/top-players"),
      primary: true,
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Support a Player",
      desc: "Send credits to your favorite players",
      action: () => navigate("/top-players"),
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Leaderboard",
      desc: "See who's on top this month",
      action: () => navigate("/top-players"),
    },
  ];

  const adminCards: DashCard[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Pending Approvals",
      desc: "Review session and venue requests",
      action: () => navigate("/superadmin"),
      primary: true,
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "All Sessions",
      desc: "View and manage all active sessions",
      action: () => navigate("/superadmin"),
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics",
      desc: "Platform-wide stats and metrics",
      action: () => navigate("/superadmin"),
    },
  ];

  const sections: { title: string; cards: DashCard[] }[] = [];

  if (isAdmin) sections.push({ title: "🛡 Admin", cards: adminCards });
  if (isHost) sections.push({ title: "📋 Host", cards: hostCards });
  if (player) sections.push({ title: "🎾 Player", cards: playerCards });
  if (!player && !isHost && !isAdmin) sections.push({ title: "🤝 Fan", cards: fanCards });

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-black">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">What do you want to do today?</p>
          </div>
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {sections.map((section, si) => (
          <div key={section.title} className="mb-8">
            {sections.length > 1 && (
              <h2 className="font-display text-lg font-bold text-muted-foreground mb-3">{section.title}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.cards.map((card, ci) => (
                <motion.button
                  key={card.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.1 + ci * 0.05 }}
                  onClick={card.action}
                  className={`text-left p-5 rounded-2xl border transition-all hover:shadow-md active:scale-[0.98] ${
                    card.primary
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`mb-3 ${card.primary ? "opacity-90" : "text-primary"}`}>
                    {card.icon}
                  </div>
                  <div className="font-bold text-base mb-1">{card.title}</div>
                  <div className={`text-xs leading-relaxed ${card.primary ? "opacity-80" : "text-muted-foreground"}`}>
                    {card.desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
