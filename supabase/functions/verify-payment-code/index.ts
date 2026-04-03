import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json() as {
      payment_id: string;
      code: string;
    };

    const { payment_id, code } = body;

    // Validate inputs
    if (!payment_id || !code) {
      return new Response(
        JSON.stringify({ error: "Missing payment_id or code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch payment link (including code_hash which is not exposed via RLS)
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
      // Update status to expired if not already
      if (paymentLink.status === "pending") {
        await supabase
          .from("payment_links")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("payment_id", payment_id);
      }

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

    // Verify code against hash
    const isValid = await bcrypt.compare(code, paymentLink.code_hash);

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid code" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const unlockToken = crypto.randomUUID();
    const { error: unlockErr } = await supabase
      .from("payment_links")
      .update({
        unlock_token: unlockToken,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", payment_id);

    if (unlockErr) {
      console.error("unlock_token update:", unlockErr);
      return new Response(
        JSON.stringify({ error: "Could not unlock payment session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const extRef = (paymentLink as { external_reference?: string | null }).external_reference;

    // Code is valid — return payment details + one-time unlock token for process-payment-link
    return new Response(
      JSON.stringify({
        valid: true,
        unlock_token: unlockToken,
        payment_id: paymentLink.payment_id,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        reference: extRef ?? null,
        metadata: paymentLink.metadata,
        expires_at: paymentLink.expires_at,
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
