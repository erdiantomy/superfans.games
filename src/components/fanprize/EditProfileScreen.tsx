import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { container, item } from "./MotionVariants";

interface EditProfileProps {
  onBack: () => void;
}

export default function EditProfileScreen({ onBack }: EditProfileProps) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        username: profile.username || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;
    if (!form.display_name.trim()) {
      toast.error("Display name is required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: form.display_name.trim(),
          username: form.username.trim(),
          avatar_url: form.avatar_url.trim() || null,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      onBack();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="px-5 pt-5 pb-24 overflow-y-auto h-full no-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground text-[20px]">←</button>
        <h1 className="font-display text-[22px] font-black">Edit Profile</h1>
      </motion.div>

      {/* Avatar Preview */}
      <motion.div variants={item} className="text-center mb-6">
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-green mx-auto" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-card border-2 border-subtle mx-auto flex items-center justify-center text-[28px] font-bold text-muted-foreground">
            {(form.display_name || "?").slice(0, 2).toUpperCase()}
          </div>
        )}
      </motion.div>

      {/* Form */}
      <motion.div variants={item} className="space-y-4">
        <div>
          <label className="text-label text-[11px] uppercase tracking-wider mb-1.5 block">Display Name</label>
          <input
            value={form.display_name}
            onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
            className="w-full bg-card border border-subtle rounded-xl px-4 py-3 text-[14px] text-foreground outline-none focus:border-green/50 transition-colors"
            placeholder="Your display name"
          />
        </div>
        <div>
          <label className="text-label text-[11px] uppercase tracking-wider mb-1.5 block">Username</label>
          <input
            value={form.username}
            onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            className="w-full bg-card border border-subtle rounded-xl px-4 py-3 text-[14px] text-foreground outline-none focus:border-green/50 transition-colors"
            placeholder="username"
          />
        </div>
        <div>
          <label className="text-label text-[11px] uppercase tracking-wider mb-1.5 block">Avatar URL</label>
          <input
            value={form.avatar_url}
            onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
            className="w-full bg-card border border-subtle rounded-xl px-4 py-3 text-[14px] text-foreground outline-none focus:border-green/50 transition-colors"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-label text-[10px] mt-1">Paste an image URL for your avatar</p>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={item} className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-green rounded-xl py-3.5 font-display text-[16px] font-extrabold text-background tracking-wider uppercase disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>
    </motion.div>
  );
}
