// Superfans — sign in / sign up (Supabase auth)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  async function emailAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        });
        if (error) throw error;
        if (data.user) {
          // best-effort profile row so the user appears with a name
          await supabase.from("profiles").upsert(
            { user_id: data.user.id, display_name: name || email.split("@")[0], username: email.split("@")[0] },
            { onConflict: "user_id" },
          );
        }
        toast.success(data.session ? "Welcome to Superfans! ⚽" : "Check your email to confirm your account.");
        if (data.session) navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back! ⚽");
        navigate("/");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-5 text-zinc-100">
      <div className="mb-6 flex flex-col items-center">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-500 text-zinc-950">
          <Zap size={24} strokeWidth={3} />
        </span>
        <h1 className="text-2xl font-extrabold">Super<span className="text-emerald-400">fans</span></h1>
        <p className="mt-1 text-sm text-zinc-500">Where sports fans become legends</p>
      </div>

      <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-zinc-800/60 p-1 text-sm font-bold">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`rounded-lg py-2 transition ${mode === m ? "bg-emerald-500 text-zinc-950" : "text-zinc-400"}`}>
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={emailAuth} className="space-y-3">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          <button type="submit" disabled={busy}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-extrabold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[11px] text-zinc-600">
          <div className="h-px flex-1 bg-zinc-800" />OR<div className="h-px flex-1 bg-zinc-800" />
        </div>

        <button onClick={google}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-sm font-bold transition hover:border-zinc-500">
          <span className="text-base">🇬</span> Continue with Google
        </button>
      </div>

      <button onClick={() => navigate("/")} className="mt-6 text-sm font-semibold text-zinc-500 hover:text-zinc-300">
        ← Back to Superfans
      </button>
    </div>
  );
}
