import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cleanCode = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase().slice(0, 50) : "";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (request.method !== "POST") throw new Error("Method not allowed");
    const body = await request.json();
    const code = cleanCode(body.code);
    const subtotal = Number(body.subtotal);
    if (!code || !Number.isFinite(subtotal) || subtotal < 0) throw new Error("Invalid request");

    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) throw new Error("Supabase server secrets are missing");
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select(
        "code,type,value,min_subtotal,max_discount,usage_limit,used_count,starts_at,expires_at,active,description_en",
      )
      .eq("code", code)
      .maybeSingle();
    if (error) throw error;

    const now = Date.now();
    if (!coupon || !coupon.active) throw new Error("Coupon code is invalid");
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now)
      throw new Error("This coupon is not active yet");
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= now)
      throw new Error("This coupon has expired");
    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit)
      throw new Error("This coupon has reached its usage limit");
    if (subtotal < Number(coupon.min_subtotal))
      throw new Error(`Minimum order ${Number(coupon.min_subtotal)} EGP required`);

    let discount = 0;
    let deliveryDiscount = 0;
    if (coupon.type === "percent") discount = subtotal * (Number(coupon.value) / 100);
    if (coupon.type === "fixed") discount = Number(coupon.value);
    if (coupon.type === "free_shipping") deliveryDiscount = subtotal >= 2000 ? 0 : 50;
    if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
    discount = Math.min(Math.round(discount * 100) / 100, subtotal);

    return Response.json(
      {
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: Number(coupon.value),
          minSubtotal: Number(coupon.min_subtotal),
          active: true,
          description: coupon.description_en,
        },
        discount,
        deliveryDiscount,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not validate coupon" },
      { status: 400, headers: corsHeaders },
    );
  }
});
