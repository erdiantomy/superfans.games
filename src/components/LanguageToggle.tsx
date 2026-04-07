import { useTranslation } from "react-i18next";

export default function LanguageToggle({ style }: { style?: React.CSSProperties }) {
  const { i18n } = useTranslation();
  const isID = i18n.language === "id";

  return (
    <button
      onClick={() => i18n.changeLanguage(isID ? "en" : "id")}
      style={{
        background: "transparent",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "5px 10px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        color: "#666",
        ...style,
      }}
    >
      {isID ? "🇬🇧 EN" : "🇮🇩 ID"}
    </button>
  );
}
