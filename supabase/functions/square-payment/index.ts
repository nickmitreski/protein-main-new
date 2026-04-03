import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
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

    const body = await req.json() as {
      sourceId: string;
      orderId: string;
      amountCents: number;
      currency: string;
      idempotencyKey: string;
      buyerEmailAddress?: string;
    };

    const { sourceId, orderId, amountCents, currency, idempotencyKey, buyerEmailAddress } = body;

    if (!sourceId || !orderId || !amountCents || !idempotencyKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: sourceId, orderId, amountCents, idempotencyKey" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const squareEnv = Deno.env.get("SQUARE_ENVIRONMENT") ?? "production";
    const squareBase = squareEnv === "sandbox"
      ? "https://connect.squareupsandbox.com"
      : "https://connect.squareup.com";

    const paymentPayload: Record<string, unknown> = {
      source_id: sourceId,
      idempotency_key: idempotencyKey,
      amount_money: {
        amount: amountCents,
        currency: currency.toUpperCase(),
      },
      location_id: squareLocationId,
      reference_id: orderId,
    };

    if (buyerEmailAddress) {
      paymentPayload.buyer_email_address = buyerEmailAddress;
    }

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
      return new Response(
        JSON.stringify({ error: errDetail }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const squarePaymentId = squareData.payment!.id;
    const paymentStatus = squareData.payment!.status;

    if (supabaseUrl && supabaseServiceKey) {
      const db = createClient(supabaseUrl, supabaseServiceKey);
      await db
        .from("orders")
        .update({
          payment_status: paymentStatus === "COMPLETED" ? "paid" : "pending",
          payment_reference_id: squarePaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }

    return new Response(
      JSON.stringify({
        paymentId: squarePaymentId,
        status: paymentStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
