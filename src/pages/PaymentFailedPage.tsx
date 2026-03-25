import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6"
        >
          <XCircle size={40} className="text-destructive" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2">Payment Not Completed</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your payment was cancelled or expired. No charges were made.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/topup")}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-card border border-border text-foreground py-3 rounded-xl font-semibold text-sm"
          >
            Back to Game
          </button>
        </div>
      </motion.div>
    </div>
  );
}
