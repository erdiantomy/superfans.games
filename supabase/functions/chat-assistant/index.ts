import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAILY_LIMIT = 30;
const MAX_TOKENS = 400;
const MODEL = "google/gemini-2.5-flash";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Not authenticated" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return json({ error: "Service unavailable" }, 502);
    }

    // Verify user
    const supabaseUser = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const {
      data: { user },
      error: userErr,
    } = await supabaseUser.auth.getUser();

    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Service role client for usage tracking
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: count messages in last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countErr } = await supabaseAdmin
      .from("chat_assistant_usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since);

    if (countErr) {
      console.error("Usage count error:", countErr);
      return json({ error: "Service error" }, 502);
    }

    if ((count ?? 0) >= DAILY_LIMIT) {
      return json(
        { error: "Daily limit reached", limit: DAILY_LIMIT, remaining: 0 },
        429,
      );
    }

    // Parse request body
    const { messages, systemPrompt, pageRoute } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "Messages required" }, 400);
    }

    // Build OpenAI-compatible messages array
    const aiMessages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      ...messages.slice(-10),
    ];

    // Call Lovable AI gateway (OpenAI-compatible)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Lovable AI API error:", response.status, errBody);
      return json({ error: "AI service temporarily unavailable" }, 502);
    }

    const result = await response.json();
    const assistantMessage =
      result.choices?.[0]?.message?.content ?? "Maaf, saya tidak bisa merespons saat ini.";

    // Track usage
    await supabaseAdmin.from("chat_assistant_usage").insert({
      user_id: user.id,
      page_route: pageRoute || "/",
    });

    const remaining = DAILY_LIMIT - ((count ?? 0) + 1);

    return json({ message: assistantMessage, remaining });
  } catch (err) {
    console.error("Chat assistant error:", err);
    return json({ error: "Internal server error" }, 502);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
