import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const squareAccessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
    const squareLocationId = Deno.env.get("SQUARE_LOCATION_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!squareAccessToken || !squareLocationId) {
      return new Response(
        JSON.stringify({ error: "Square credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json() as {
      payment_id: string;
      sourceId: string;
      idempotencyKey: string;
      unlockToken: string;
    };

    const { payment_id, sourceId, idempotencyKey, unlockToken } = body;

    if (!payment_id || !sourceId || !idempotencyKey || !unlockToken) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: payment_id, sourceId, idempotencyKey, unlockToken",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch payment link
    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("payment_id", payment_id)
      .single();

    if (fetchError || !paymentLink) {
      return new Response(
        JSON.stringify({ error: "Payment link not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(paymentLink.expires_at);
    if (now > expiresAt) {
      await supabase
        .from("payment_links")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("payment_id", payment_id);

      return new Response(
        JSON.stringify({ error: "Payment link has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already paid
    if (paymentLink.status === "paid") {
      return new Response(
        JSON.stringify({ error: "Payment already completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rowUnlock = paymentLink.unlock_token as string | null;
    if (!rowUnlock || rowUnlock !== unlockToken) {
      return new Response(
        JSON.stringify({ error: "Payment session not verified or expired. Verify your code again." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert amount to cents
    const amountCents = Math.round(paymentLink.amount * 100);

    // Determine Square environment
    const squareEnv = Deno.env.get("SQUARE_ENVIRONMENT") ?? "production";
    const squareBase = squareEnv === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const extRef = (paymentLink as { external_reference?: string | null }).external_reference;
    const squareReferenceId = (extRef && String(extRef).trim())
      ? String(extRef).trim().slice(0, 40)
      : payment_id;

    // Prepare Square payment payload (Square reference_id max 40 chars — use LAMIN order reference in external_reference when set)
    const paymentPayload = {
      source_id: sourceId,
      idempotency_key: idempotencyKey,
      amount_money: {
        amount: amountCents,
        currency: paymentLink.currency.toUpperCase(),
      },
      location_id: squareLocationId,
      reference_id: squareReferenceId,
    };

    // Call Square API
    const squareRes = await fetch(`${squareBase}/v2/payments`, {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const squareData = await squareRes.json() as {
      payment?: { id: string; status: string };
      errors?: Array<{ detail: string }>;
    };

    if (!squareRes.ok || squareData.errors) {
      const errDetail = squareData.errors?.[0]?.detail ?? "Square payment failed";

      // Update payment link status to failed
      await supabase
        .from("payment_links")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("payment_id", payment_id);

      return new Response(
        JSON.stringify({ error: errDetail }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const squarePaymentId = squareData.payment!.id;
    const paymentStatus = squareData.payment!.status;

    // Update payment link with payment details
    await supabase
      .from("payment_links")
      .update({
        status: paymentStatus === "COMPLETED" ? "paid" : "pending",
        square_payment_id: squarePaymentId,
        paid_at: paymentStatus === "COMPLETED" ? new Date().toISOString() : null,
        unlock_token: paymentStatus === "COMPLETED" ? null : rowUnlock,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", payment_id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment_id,
        square_payment_id: squarePaymentId,
        status: paymentStatus,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Error:", err);
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
