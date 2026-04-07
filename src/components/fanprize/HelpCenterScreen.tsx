import { useState } from "react";
import { motion } from "framer-motion";
import { container, item } from "./MotionVariants";

interface HelpCenterProps {
  onBack: () => void;
}

const faqs = [
  {
    q: "How do I earn points?",
    a: "You earn points by supporting players in matches. When the player you support wins, you earn bonus points! You also get points for daily logins and completing activities.",
  },
  {
    q: "How do credits work?",
    a: "Credits (SP) are the in-app currency. You can top up credits via the Wallet tab, then use them to support players in matches. If your supported player wins, you earn rewards!",
  },
  {
    q: "How do I support a player?",
    a: "Go to any live or upcoming match, tap on the player you want to support, choose the amount of credits, and confirm. Your support contributes to the prize pool.",
  },
  {
    q: "What happens after a match ends?",
    a: "When a match finishes, supporters of the winning player receive rewards proportional to their support amount. Check the match result screen for your payout details.",
  },
  {
    q: "How do I top up my wallet?",
    a: "Go to the Wallet tab → Top Up. Choose a credit package that suits you. We accept various payment methods including bank transfer and e-wallets.",
  },
  {
    q: "Can I get a refund?",
    a: "Credits used to support players in ongoing matches cannot be refunded. Unused credits in your wallet balance are subject to our refund policy. Contact support for assistance.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us at superfans.games@gmail.com or use the AI Assistant (chat bubble) at the bottom right of the screen for instant help.",
  },
];

export default function HelpCenterScreen({ onBack }: HelpCenterProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <motion.div
      className="px-5 pt-5 pb-24 overflow-y-auto h-full no-scrollbar"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-muted-foreground text-[20px]">←</button>
        <h1 className="font-display text-[22px] font-black">Help Center</h1>
      </motion.div>
      <motion.div variants={item} className="text-label text-[12px] mb-6">
        Frequently asked questions and support
      </motion.div>

      {/* FAQ List */}
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          variants={item}
          className="bg-card border border-subtle rounded-[14px] mb-2.5 overflow-hidden"
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full text-left px-4 py-3.5 flex items-center justify-between"
          >
            <span className="text-[13px] font-semibold pr-3">{faq.q}</span>
            <span className={`text-muted-foreground text-[16px] transition-transform ${openIdx === i ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
          {openIdx === i && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-3.5 border-t border-subtle"
            >
              <p className="text-label text-[12px] leading-relaxed pt-3">{faq.a}</p>
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Contact Section */}
      <motion.div variants={item} className="mt-6 bg-card border border-green/20 rounded-[14px] p-4 text-center">
        <div className="text-[28px] mb-2">💬</div>
        <div className="font-display text-[15px] font-bold mb-1">Still need help?</div>
        <div className="text-label text-[12px] mb-3">Contact our support team</div>
        <a
          href="mailto:superfans.games@gmail.com"
          className="inline-block bg-green/15 border border-green/40 text-green text-[12px] font-semibold px-4 py-2 rounded-full"
        >
          superfans.games@gmail.com
        </a>
      </motion.div>
    </motion.div>
  );
}
