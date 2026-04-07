import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { venue_slug, password, session_id, action, note } = await req.json();

    if (!venue_slug || !password || !session_id || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify venue password using crypt()
    const { data: venue, error: venueErr } = await supabase
      .from("venues")
      .select("id, admin_password_hash")
      .eq("slug", venue_slug)
      .single();

    if (venueErr || !venue) {
      return new Response(
        JSON.stringify({ error: "Venue not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password via RPC
    const { data: valid, error: pwErr } = await supabase.rpc("verify_venue_password", {
      venue_slug,
      plain_password: password,
    });

    if (pwErr || !valid) {
      return new Response(
        JSON.stringify({ error: "Invalid password" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session belongs to this venue
    const { data: session, error: sessErr } = await supabase
      .from("sessions")
      .select("id, venue_id, status")
      .eq("id", session_id)
      .single();

    if (sessErr || !session || session.venue_id !== venue.id) {
      return new Response(
        JSON.stringify({ error: "Session not found for this venue" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update session
    const updateData: Record<string, unknown> = action === "approve"
      ? { status: "active", approved_at: new Date().toISOString() }
      : { status: "rejected", admin_note: note || "Session rejected by admin." };

    const { data: updated, error: updateErr } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", session_id)
      .select("*")
      .single();

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, session: updated }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
