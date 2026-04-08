import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

/**
 * Generate a unique payment ID (8 characters, alphanumeric)
 */
function generatePaymentId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars (0, O, I, 1)
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // LAMIN uses PAYMENT_LINK_BEARER; this project historically used PAYMENT_LINK_CREATE_SECRET (same value).
    const expectedSecret = (Deno.env.get("PAYMENT_LINK_BEARER") ?? Deno.env.get("PAYMENT_LINK_CREATE_SECRET") ?? "")
      .trim();
    if (expectedSecret) {
      const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "")?.trim() ?? "";
      const headerSecret = req.headers.get("x-payment-link-secret")?.trim() ?? "";
      if (bearer !== expectedSecret && headerSecret !== expectedSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    // reference | external_reference: your invoice/order/CRM id (stored in external_reference; also ok inside metadata)
    const body = await req.json() as {
      amount: number;
      code: string;
      currency?: string;
      expirationMinutes?: number;
      metadata?: Record<string, unknown>;
      reference?: string;
      external_reference?: string;
      /** When true, `payment_url` uses `/embed/pay/:id` (iframe-friendly, no site chrome). */
      embed?: boolean;
    };

    const {
      amount,
      code,
      currency = "USD",
      expirationMinutes = 15,
      metadata: rawMetadata = {},
      embed: embedBody = false,
    } = body;

    const embed =
      embedBody === true ||
      rawMetadata.embed === true ||
      rawMetadata.payment_ui === "embed";

    const metaRef =
      typeof rawMetadata.reference === "string" ? rawMetadata.reference.trim() : "";
    const topRef = (body.reference ?? body.external_reference ?? "").toString().trim();
    const reference = (topRef || metaRef).slice(0, 500);

    const metadata = { ...rawMetadata };
    if (reference) metadata.reference = reference;
    if (embed) metadata.embed = true;

    const sourceIsLamin =
      typeof rawMetadata?.source === "string" && rawMetadata.source.toLowerCase() === "lamin";

    // Validate inputs
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be greater than 0." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!code || code.trim().length < 4) {
      return new Response(
        JSON.stringify({ error: "Invalid code. Must be at least 4 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requireSixDigit =
      sourceIsLamin || Deno.env.get("PAYMENT_LINK_REQUIRE_SIX_DIGIT_CODE") === "true";
    if (requireSixDigit && !/^\d{6}$/.test(code.trim())) {
      return new Response(
        JSON.stringify({ error: "Code must be exactly 6 digits." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sourceIsLamin && !reference) {
      return new Response(
        JSON.stringify({ error: "reference is required when metadata.source is lamin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (expirationMinutes < 5 || expirationMinutes > 60) {
      return new Response(
        JSON.stringify({ error: "Expiration must be between 5 and 60 minutes." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const paymentPath = (paymentId: string) =>
      embed ? `/embed/pay/${paymentId}` : `/pay/${paymentId}`;

    // Idempotency: same LAMIN order (reference) + pending + not expired → return existing URL
    if (reference) {
      const { data: existing } = await supabase
        .from("payment_links")
        .select("payment_id, amount, expires_at, status")
        .eq("external_reference", reference)
        .eq("status", "pending")
        .maybeSingle();

      if (existing && new Date(existing.expires_at) > new Date()) {
        if (Number(existing.amount) !== Number(amount)) {
          return new Response(
            JSON.stringify({ error: "Conflict: reference already exists with a different amount." }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const baseUrlEarly = req.headers.get("origin") || Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
        const paymentUrlEarly = `${baseUrlEarly.replace(/\/$/, "")}${paymentPath(existing.payment_id)}`;
        return new Response(
          JSON.stringify({
            payment_url: paymentUrlEarly,
            payment_id: existing.payment_id,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Hash the code (using bcrypt for secure one-way hashing)
    const codeHash = bcrypt.hashSync(code.trim(), 10);

    let paymentId = "";
    let lastError: { message: string; code?: string } | null = null;

    for (let attempt = 0; attempt < 12; attempt++) {
      paymentId = generatePaymentId();
      const { error } = await supabase.from("payment_links").insert({
        payment_id: paymentId,
        amount,
        currency: currency.toUpperCase(),
        code_hash: codeHash,
        metadata,
        external_reference: reference || null,
        expires_at: expiresAt.toISOString(),
        status: "pending",
      });

      if (!error) {
        lastError = null;
        break;
      }
      lastError = error;
      if (error.code !== "23505") {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create payment link" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (lastError) {
      return new Response(
        JSON.stringify({ error: "Could not allocate a unique payment id" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate payment URL
    const baseUrl = req.headers.get("origin") || Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
    const paymentUrl = `${baseUrl.replace(/\/$/, "")}${paymentPath(paymentId)}`;

    return new Response(
      JSON.stringify({
        payment_url: paymentUrl,
        payment_id: paymentId,
        amount,
        currency,
        reference: reference || null,
        expires_at: expiresAt.toISOString(),
        expires_in_minutes: expirationMinutes,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("create-payment-link error:", err instanceof Error ? err.message : err);
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
