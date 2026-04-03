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
    const squareWebhookSignatureKey = Deno.env.get("SQUARE_WEBHOOK_SIGNATURE_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.text();

    if (squareWebhookSignatureKey) {
      const signatureHeader = req.headers.get("x-square-hmacsha256-signature") ?? "";
      const url = req.url;

      const encoder = new TextEncoder();
      const keyData = encoder.encode(squareWebhookSignatureKey);
      const msgData = encoder.encode(url + rawBody);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
      const signatureBytes = new Uint8Array(signatureBuffer);
      const computedSignature = btoa(String.fromCharCode(...signatureBytes));

      if (computedSignature !== signatureHeader) {
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const event = JSON.parse(rawBody) as {
      type: string;
      data?: {
        object?: {
          payment?: {
            id: string;
            status: string;
            reference_id?: string;
          };
        };
      };
    };

    const db = createClient(supabaseUrl, supabaseServiceKey);

    if (event.type === "payment.completed" || event.type === "payment.updated") {
      const payment = event.data?.object?.payment;
      if (!payment) {
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const paymentStatus = payment.status === "COMPLETED" ? "paid" : "pending";
      const orderId = payment.reference_id;

      if (orderId) {
        await db
          .from("orders")
          .update({
            payment_status: paymentStatus,
            payment_reference_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      } else {
        await db
          .from("orders")
          .update({
            payment_status: paymentStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_reference_id", payment.id);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
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
