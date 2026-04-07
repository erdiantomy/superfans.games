import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { Avatar, SectionHead } from "./UIElements";
import { container, item } from "./MotionVariants";

interface ProfileProps {
  onNotifications?: () => void;
  onEditProfile?: () => void;
  onHelpCenter?: () => void;
}

export default function ProfileScreen({ onNotifications, onEditProfile, onHelpCenter }: ProfileProps) {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  const displayName = profile?.display_name || profile?.username || user?.email || "User";
  const email = user?.email || "";
  const points = profile?.points || 0;
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  const stats = [
    ["🪙", points.toLocaleString(), "Points Earned"],
    ["🏅", profile?.rank ? `#${profile.rank}` : "–", "Rank"],
  ];

  // Show badges based on actual user data
  const badges: [string, string][] = [];
  if (points >= 5000) badges.push(["🏆", "Top Supporter"]);
  if (points >= 1000) badges.push(["🔥", "On Fire"]);
  if (profile?.created_at) badges.push(["⚡", "Early Bird"]);
  if (points >= 10000) badges.push(["🌟", "VIP Fan"]);
  // Always show at least a starter badge
  if (badges.length === 0) badges.push(["⭐", "New Fan"]);

  const handleMenuItem = (menuItem: string) => {
    if (menuItem === "Notifications") {
      onNotifications?.();
    } else if (menuItem === "Edit Profile") {
      onEditProfile?.();
    } else if (menuItem === "Referral Code") {
      const code = user?.id?.slice(0, 8).toUpperCase() || "SUPERFAN";
      navigator.clipboard.writeText(code);
      toast.success(`Referral code "${code}" copied to clipboard!`);
    } else if (menuItem === "Help Center") {
      onHelpCenter?.();
    }
  };

  return (
    <motion.div
      className="px-5 pt-5 pb-24 overflow-y-auto h-full no-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Profile Header */}
      <motion.div variants={item} className="text-center mb-6">
        <div className="inline-block relative mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-green" />
          ) : (
            <Avatar s={avatarInitials} size={72} />
          )}
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green border-2 border-background flex items-center justify-center text-[10px]">✓</div>
        </div>
        <div className="font-display text-[26px] font-black">{displayName}</div>
        <div className="text-label text-[12px]">{email}</div>
        <div className="inline-flex items-center gap-1.5 mt-2 bg-green/10 border border-green/40 rounded-full px-3 py-1">
          <span className="text-green text-[10px] font-semibold">RANK #{profile?.rank || "–"} · SUPPORTER</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-2 mb-[18px]">
        {stats.map(([ic, val, lb]) => (
          <div key={lb} className="bg-card border border-subtle rounded-lg p-3.5 text-center">
            <div className="text-[20px] mb-1">{ic}</div>
            <div className="font-display text-[22px] font-black">{val}</div>
            <div className="text-label text-[10px]">{lb}</div>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div variants={item}>
          <SectionHead title="BADGES" />
          <div className={`grid gap-2 mb-5 ${badges.length >= 4 ? "grid-cols-4" : `grid-cols-${badges.length}`}`}>
            {badges.map(([ic, lb]) => (
              <div key={lb} className="bg-card border border-subtle rounded-lg p-2.5 text-center">
                <div className="text-[24px] mb-1">{ic}</div>
                <div className="text-[9px] text-label">{lb}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Menu */}
      {["Edit Profile", "Referral Code", "Notifications", "Help Center"].map(menuItem => (
        <motion.div
          key={menuItem}
          variants={item}
          className="flex items-center justify-between py-3.5 border-b border-border cursor-pointer"
          onClick={() => handleMenuItem(menuItem)}
        >
          <span className="text-[14px] font-medium">{menuItem}</span>
          <span className="text-muted-foreground">›</span>
        </motion.div>
      ))}
      <motion.div
        variants={item}
        className="flex items-center justify-between py-3.5 border-b border-border cursor-pointer"
        onClick={signOut}
      >
        <span className="text-[14px] font-medium text-destructive">Sign Out</span>
        <span className="text-muted-foreground">›</span>
      </motion.div>
    </motion.div>
  );
}
