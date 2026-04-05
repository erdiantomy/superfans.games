import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  // Webhook only accepts POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const callbackToken = Deno.env.get("XENDIT_CALLBACK_TOKEN")!;
    const incomingToken = req.headers.get("x-callback-token");

    if (incomingToken !== callbackToken) {
      console.error("Invalid callback token");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Xendit webhook payload:", JSON.stringify(body));

    const { external_id, status, payment_channel } = body;

    if (!external_id || !status) {
      return new Response("Missing fields", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only process PAID status
    if (status === "PAID") {
      // Get the order
      const { data: order, error: orderErr } = await supabase
        .from("payment_orders")
        .select("*")
        .eq("id", external_id)
        .single();

      if (orderErr || !order) {
        console.error("Order not found:", external_id);
        return new Response("Order not found", { status: 404 });
      }

      // Idempotency: skip if already paid
      if (order.status === "paid") {
        console.log("Order already processed:", external_id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Update order status
      const { error: updateErr } = await supabase
        .from("payment_orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          payment_channel: payment_channel || null,
        })
        .eq("id", order.id);

      if (updateErr) {
        console.error("Failed to update order:", updateErr);
        return new Response("Failed to update order", { status: 500 });
      }

      // Credit the player's balance
      const { error: creditErr } = await supabase.rpc("credit_player_balance", {
        p_player_id: order.player_id,
        p_credits: order.credits_amount,
      });

      if (creditErr) {
        // Fallback: direct update if RPC doesn't exist
        console.warn("RPC failed, using direct update:", creditErr.message);
        const { data: currentPlayer } = await supabase
          .from("padel_players")
          .select("credits")
          .eq("id", order.player_id)
          .single();

        if (currentPlayer) {
          await supabase
            .from("padel_players")
            .update({ credits: (currentPlayer.credits || 0) + order.credits_amount })
            .eq("id", order.player_id);
        }
      }

      // Record wallet transaction
      // Get the user_id from the player
      const { data: playerData } = await supabase
        .from("padel_players")
        .select("user_id")
        .eq("id", order.player_id)
        .single();

      if (playerData) {
        await supabase.from("wallet_transactions").insert({
          user_id: playerData.user_id,
          type: "topup",
          description: `Top-up: ${order.credits_amount} Credits`,
          idr_amount: order.price_idr,
          sp_amount: 0,
          payment_order_id: order.id,
        });
      }

      console.log(`Successfully credited ${order.credits_amount} credits to player ${order.player_id}`);
    } else if (status === "EXPIRED") {
      await supabase
        .from("payment_orders")
        .update({ status: "expired" })
        .eq("id", external_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
