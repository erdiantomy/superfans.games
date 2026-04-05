import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const xenditKey = Deno.env.get("XENDIT_SECRET_KEY")!;

    // Verify user
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { package_id } = await req.json();
    if (!package_id) {
      return new Response(JSON.stringify({ success: false, error: "Missing package_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get package
    const { data: pkg, error: pkgErr } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", package_id)
      .eq("is_active", true)
      .single();

    if (pkgErr || !pkg) {
      return new Response(JSON.stringify({ success: false, error: "Package not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get player
    const { data: player, error: playerErr } = await supabase
      .from("padel_players")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (playerErr || !player) {
      return new Response(JSON.stringify({ success: false, error: "Player not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compute total credits with bonus
    const bonusCredits = Math.floor(pkg.credits * (pkg.bonus_pct / 100));
    const totalCredits = pkg.credits + bonusCredits;

    // Create payment order
    const { data: order, error: orderErr } = await supabase
      .from("payment_orders")
      .insert({
        player_id: player.id,
        package_id: pkg.id,
        credits_amount: totalCredits,
        price_idr: pkg.price_idr,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ success: false, error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine callback URLs
    const appUrl = req.headers.get("origin") || "https://superfanspro.lovable.app";

    // Create Xendit invoice
    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(xenditKey + ":"),
      },
      body: JSON.stringify({
        external_id: order.id,
        amount: pkg.price_idr,
        currency: "IDR",
        description: `SuperFans Credit Top-Up: ${pkg.name} (${totalCredits} Credits)`,
        success_redirect_url: `${appUrl}/payment/success?order_id=${order.id}`,
        failure_redirect_url: `${appUrl}/payment/failed?order_id=${order.id}`,
        payer_email: user.email,
        invoice_duration: 3600, // 1 hour
        items: [
          {
            name: `${pkg.name} Credit Pack`,
            quantity: 1,
            price: pkg.price_idr,
          },
        ],
      }),
    });

    if (!xenditRes.ok) {
      const errBody = await xenditRes.text();
      console.error("Xendit error:", errBody);
      // Clean up the order
      await supabase.from("payment_orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ success: false, error: "Payment gateway error" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const invoice = await xenditRes.json();

    // Update order with Xendit details
    await supabase
      .from("payment_orders")
      .update({
        xendit_invoice_id: invoice.id,
        xendit_invoice_url: invoice.invoice_url,
        expired_at: invoice.expiry_date,
      })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        success: true,
        invoice_url: invoice.invoice_url,
        order_id: order.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-payment error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
