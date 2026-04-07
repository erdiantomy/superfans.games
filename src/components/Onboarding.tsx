import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { C } from "@/components/arena";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Onboarding({ open, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  if (!open) return null;

  const roles = [
    { key: "player", icon: "🎾", label: t("onboarding.playerRole"), desc: t("onboarding.playerRoleDesc"), color: "#00E676" },
    { key: "host", icon: "📋", label: t("onboarding.hostRole"), desc: t("onboarding.hostRoleDesc"), color: "#FFD166" },
    { key: "venue", icon: "🏟️", label: t("onboarding.venueRole"), desc: t("onboarding.venueRoleDesc"), color: "#60D5FF" },
  ];

  const handleGetStarted = () => {
    localStorage.setItem("sf_onboarded", "true");
    onClose();
    if (selectedRole === "venue") navigate("/register");
    else if (selectedRole === "host") navigate("/fanprize");
    else navigate("/fanprize");
  };

  const handleSkip = () => {
    localStorage.setItem("sf_onboarded", "true");
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={handleSkip} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          position: "relative", width: "100%", maxWidth: 380,
          background: C.card, borderRadius: 20, border: `1px solid ${C.border}`,
          padding: "28px 24px", margin: 16,
        }}
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎾</div>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{t("onboarding.welcome")}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{t("onboarding.chooseRole")}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRole(r.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                      background: selectedRole === r.key ? `${r.color}15` : C.raised,
                      border: `2px solid ${selectedRole === r.key ? r.color : C.border}`,
                      color: C.fg, textAlign: "left",
                      transition: "all .15s",
                    }}
                  >
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: selectedRole === r.key ? r.color : C.fg }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.desc}</div>
                    </div>
                    {selectedRole === r.key && <span style={{ color: r.color }}>✓</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGetStarted}
                disabled={!selectedRole}
                style={{
                  width: "100%", padding: 14, borderRadius: 14,
                  background: selectedRole ? "#00E676" : C.dim,
                  border: "none", color: "#0D0D0D",
                  fontFamily: "'Barlow Condensed'", fontSize: 16, fontWeight: 900,
                  cursor: selectedRole ? "pointer" : "not-allowed",
                }}
              >
                {t("onboarding.getStarted")}
              </button>
              <button
                onClick={handleSkip}
                style={{
                  width: "100%", padding: 10, background: "none", border: "none",
                  color: C.muted, fontSize: 12, cursor: "pointer", marginTop: 8,
                }}
              >
                {t("onboarding.skip")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
