interface Props {
  active: string;
  onNav: (id: string) => void;
}

const tabs = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "matches", icon: "⚔️", label: "Matches" },
  { id: "wallet", icon: "💰", label: "Wallet" },
  { id: "store", icon: "🎁", label: "Store" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function BottomNav({ active, onNav }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40">
      <div className="max-w-md mx-auto flex">
        {tabs.map(t => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onNav(t.id)}
              className="flex-1 flex flex-col items-center py-2.5 cursor-pointer transition-colors"
            >
              <span className={`text-[20px] ${isActive ? "" : "opacity-50"}`}>{t.icon}</span>
              <span
                className={`text-[9px] font-semibold mt-0.5 uppercase tracking-wider ${isActive ? "text-green" : "text-label"}`}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
