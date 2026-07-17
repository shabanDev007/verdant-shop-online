import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OrderRequest = {
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  items?: Array<{ productId?: string; quantity?: number }>;
  notes?: string;
  couponCode?: string;
};

const clean = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!,
  );

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (request.method !== "POST") throw new Error("Method not allowed");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail = Deno.env.get("ORDER_NOTIFICATION_EMAIL");
    const fromEmail = Deno.env.get("ORDER_FROM_EMAIL") ?? "Verdura Orders <onboarding@resend.dev>";

    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server secrets are missing");
    if (!resendApiKey || !notificationEmail) throw new Error("Email secrets are missing");

    const body = (await request.json()) as OrderRequest;
    const customer = {
      fullName: clean(body.customer?.fullName, 100),
      email: clean(body.customer?.email, 255),
      phone: clean(body.customer?.phone, 30),
      address: clean(body.customer?.address, 200),
      city: clean(body.customer?.city, 100),
    };
    const notes = clean(body.notes, 500);
    const couponCode = clean(body.couponCode, 50).toUpperCase();
    const requestedItems = (body.items ?? [])
      .map((item) => ({
        productId: clean(item.productId, 100),
        quantity: Number.isInteger(item.quantity) ? Number(item.quantity) : 0,
      }))
      .filter((item) => item.productId && item.quantity > 0 && item.quantity <= 99);

    if (
      !customer.fullName ||
      !customer.email.includes("@") ||
      !customer.phone ||
      !customer.address ||
      !customer.city
    ) {
      throw new Error("Customer details are incomplete");
    }
    if (requestedItems.length === 0) throw new Error("The order has no valid items");

    const productIds = [...new Set(requestedItems.map((item) => item.productId))];
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,name_en,name_ar,price,stock,active")
      .in("id", productIds);

    if (productsError) throw productsError;
    if (!products || products.length !== productIds.length) {
      throw new Error("One or more products no longer exist");
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const calculatedItems = requestedItems.map((requestedItem) => {
      const product = productsById.get(requestedItem.productId);
      if (!product?.active) throw new Error("One or more products are unavailable");
      if (product.stock < requestedItem.quantity) {
        throw new Error(`${product.name_en} does not have enough stock`);
      }
      const unitPrice = Number(product.price);
      return {
        product,
        quantity: requestedItem.quantity,
        unitPrice,
        total: unitPrice * requestedItem.quantity,
      };
    });

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
    let deliveryFee = subtotal === 0 || subtotal >= 2000 ? 0 : 50;
    let discount = 0;
    let appliedCoupon: { code: string; used_count: number } | null = null;

    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select(
          "code,type,value,min_subtotal,max_discount,usage_limit,used_count,starts_at,expires_at,active",
        )
        .eq("code", couponCode)
        .maybeSingle();
      if (couponError) throw couponError;
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
      if (coupon.type === "percent") discount = subtotal * (Number(coupon.value) / 100);
      if (coupon.type === "fixed") discount = Number(coupon.value);
      if (coupon.type === "free_shipping") deliveryFee = 0;
      if (coupon.max_discount != null) discount = Math.min(discount, Number(coupon.max_discount));
      discount = Math.min(Math.round(discount * 100) / 100, subtotal);
      appliedCoupon = coupon;
    }
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        notes: notes || null,
        subtotal,
        delivery_fee: deliveryFee,
        coupon_code: appliedCoupon?.code ?? null,
        discount,
        total,
        status: "pending",
      })
      .select("id,order_number,created_at")
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      calculatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name_en,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total: item.total,
      })),
    );
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    if (appliedCoupon) {
      const { error: usageError } = await supabase
        .from("coupons")
        .update({ used_count: appliedCoupon.used_count + 1 })
        .eq("code", appliedCoupon.code)
        .eq("used_count", appliedCoupon.used_count);
      if (usageError) console.error("Could not update coupon usage:", usageError.message);
    }

    const itemRows = calculatedItems
      .map(
        (item) =>
          `<tr><td>${escapeHtml(item.product.name_en)}</td><td>${item.quantity}</td><td>${item.total.toFixed(2)} EGP</td></tr>`,
      )
      .join("");
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notificationEmail],
        subject: `New Verdura order #${order.order_number}`,
        html: `<h1>New order #${order.order_number}</h1>
          <p><strong>Customer:</strong> ${escapeHtml(customer.fullName)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
          <p><strong>Address:</strong> ${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}</p>
          <table border="1" cellpadding="8" cellspacing="0"><thead><tr><th>Product</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>
          <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} EGP</p>
          <p><strong>Delivery:</strong> ${deliveryFee.toFixed(2)} EGP</p>
          ${appliedCoupon ? `<p><strong>Coupon:</strong> ${escapeHtml(appliedCoupon.code)} (−${discount.toFixed(2)} EGP)</p>` : ""}
          <p><strong>Total:</strong> ${total.toFixed(2)} EGP</p>
          ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ""}`,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Order saved, but email failed:", await emailResponse.text());
    }

    return Response.json(
      {
        id: order.id,
        orderNumber: String(order.order_number),
        createdAt: order.created_at,
        subtotal,
        deliveryFee,
        discount,
        couponCode: appliedCoupon?.code,
        total,
        emailSent: emailResponse.ok,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create order" },
      { status: 400, headers: corsHeaders },
    );
  }
});
