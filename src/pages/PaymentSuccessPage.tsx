import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

function fmtCr(n: number) {
  return n.toLocaleString("id-ID");
}

/* ── Lightweight canvas confetti ── */
function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#00E676", "#FFD600", "#FF5252", "#2979FF", "#E040FB", "#00BCD4"];
    const particles: {
      x: number; y: number; w: number; h: number;
      color: string; vx: number; vy: number; rot: number; vr: number;
      opacity: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width * Math.random(),
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }

    let frameId: number;
    let elapsed = 0;
    const duration = 3000; // 3 seconds
    const startTime = performance.now();

    function draw(now: number) {
      elapsed = now - startTime;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const fadeProgress = Math.max(0, (elapsed - 2000) / 1000); // fade last second

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.rot += p.vr;
        p.opacity = Math.max(0, 1 - fadeProgress);

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      if (elapsed < duration) {
        frameId = requestAnimationFrame(draw);
      }
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [canvasRef]);
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useConfetti(canvasRef);

  const { data: player } = useQuery({
    queryKey: ["padel_player", user?.id, "post-payment"],
    enabled: !!user?.id,
    refetchInterval: 3000,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("padel_players")
        .select("credits")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data as { credits: number } | null;
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Green glow entrance */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        style={{ background: "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.3), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="text-center max-w-sm relative z-20"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.15, damping: 12, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
        >
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.3, damping: 10 }}
          >
            <CheckCircle size={40} className="text-primary" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-2xl font-bold mb-2"
        >
          Payment Successful! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-sm text-muted-foreground mb-6"
        >
          Your credits have been added to your wallet.
        </motion.p>

        {player && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-card border border-border rounded-2xl p-4 mb-6"
          >
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Cr {fmtCr(player.credits)}
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm"
        >
          Back to Game
        </motion.button>
      </motion.div>
    </div>
  );
}
