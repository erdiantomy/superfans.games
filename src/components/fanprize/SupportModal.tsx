import { useState } from "react";
import { type Match, type Player, idr } from "@/data/constants";
import { Avatar } from "./UIElements";

interface Props {
  m: Match;
  p: Player;
  onClose: () => void;
  onConfirm: (amt: number) => void;
}

export default function SupportModal({ m, p, onClose, onConfirm }: Props) {
  const [amt, setAmt] = useState(25000);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(false);
  const c = p.id === m.pA.id ? "hsl(var(--green))" : "hsl(var(--blue))";
  const AMTS = [10000, 25000, 50000, 100000];

  const confirm = () => {
    setDone(true);
    setTimeout(() => onConfirm(amt), 2200);
  };

  return (
    <div className="fixed inset-0 bg-background/75 flex items-end z-50" onClick={onClose}>
      <div className="w-full bg-card rounded-t-[22px] p-5 pb-10 animate-slide-up" onClick={e => e.stopPropagation()}>
        {!done ? (
          <>
            <div className="w-[34px] h-1 rounded-full bg-muted mx-auto mb-[18px]" />
            <div className="flex items-center gap-3 mb-5">
              <Avatar s={p.av} size={46} color={c} />
              <div>
                <div className="font-display text-[20px] font-bold">Support {p.name}</div>
                <div className="text-label text-[12px]">{m.title}</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {AMTS.map(a => (
                <button
                  key={a}
                  onClick={() => { setAmt(a); setCustom(""); }}
                  className="rounded-xl p-3.5 font-display text-[17px] font-bold cursor-pointer transition-all"
                  style={{
                    backgroundColor: amt === a ? `${c}22` : "hsl(var(--muted))",
                    border: `1px solid ${amt === a ? c + "50" : "transparent"}`,
                    color: amt === a ? c : "hsl(var(--foreground))",
                  }}
                >
                  Rp {a / 1000}k
                </button>
              ))}
            </div>

            <input
              placeholder="Custom amount (Rp)"
              value={custom}
              onChange={e => { setCustom(e.target.value); setAmt(parseInt(e.target.value) || 0); }}
              className="w-full bg-muted border border-subtle rounded-xl px-3.5 py-3 text-foreground text-[14px] mb-3 outline-none focus:border-ring transition-colors"
            />

            <div className="bg-accent rounded-lg px-3 py-2.5 mb-4 text-center">
              <span className="text-label text-[12px]">You'll earn </span>
              <span className="text-green font-display font-bold text-[14px]">+100 Support Points 🪙</span>
            </div>

            <div className="flex gap-2.5">
              <button onClick={onClose} className="flex-1 bg-muted rounded-xl py-3.5 font-display text-[15px] font-bold text-foreground cursor-pointer">Cancel</button>
              <button onClick={confirm} className="flex-[2] rounded-xl py-3.5 font-display text-[15px] font-bold cursor-pointer text-background" style={{ background: `linear-gradient(135deg, ${c}, ${c}dd)` }}>
                CONFIRM {idr(amt)}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-[56px] mb-3">🎉</div>
            <div className="font-display text-[28px] font-black text-green mb-1.5">SUPPORT SENT!</div>
            <div className="text-muted-foreground text-[13px] mb-3.5">You are now part of this match</div>
            <div className="inline-block bg-green/10 border border-green/40 rounded-xl px-5 py-2.5">
              <span className="font-display text-[22px] font-extrabold text-green">+100 SP Earned 🪙</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
