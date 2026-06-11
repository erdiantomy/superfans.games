// Superfans — static asset uploader (token-gated, service-role). Hosts the SPA build in Storage.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TOKEN = Deno.env.get("SYNC_TOKEN") ?? "superfans-sync";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, x-sync-token" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const t = req.headers.get("x-sync-token") ?? new URL(req.url).searchParams.get("token") ?? "";
  if (t !== TOKEN) return json({ error: "unauthorized" }, 401);
  let body: { path?: string; base64?: string; contentType?: string };
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { path, base64, contentType } = body;
  if (!path || base64 === undefined) return json({ error: "missing path/base64" }, 400);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { error } = await db.storage.from("site").upload(path, bytes, {
    contentType: contentType || "application/octet-stream", upsert: true,
  });
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, path, size: bytes.length });
});
