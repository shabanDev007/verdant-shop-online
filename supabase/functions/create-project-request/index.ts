import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ProjectRequest = {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  projectType?: string;
  spaceSize?: string;
  budget?: string;
  preferredContactTime?: string;
  details?: string;
};

const allowedProjectTypes = new Set([
  "balcony",
  "villa",
  "landscape",
  "office",
  "garden",
  "maintenance",
]);
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
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
  const uploadedPaths: string[] = [];
  try {
    if (request.method !== "POST") throw new Error("Method not allowed");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const notificationEmail =
      Deno.env.get("PROJECT_NOTIFICATION_EMAIL") ?? Deno.env.get("ORDER_NOTIFICATION_EMAIL");
    const fromEmail =
      Deno.env.get("PROJECT_FROM_EMAIL") ??
      Deno.env.get("ORDER_FROM_EMAIL") ??
      "Jothour Projects <onboarding@resend.dev>";
    if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server secrets are missing");
    if (!resendApiKey || !notificationEmail) throw new Error("Email secrets are missing");

    const formData = await request.formData();
    const rawRequest = formData.get("request");
    if (typeof rawRequest !== "string") throw new Error("Project details are missing");
    const body = JSON.parse(rawRequest) as ProjectRequest;
    const project = {
      fullName: clean(body.fullName, 100),
      email: clean(body.email, 255),
      phone: clean(body.phone, 30),
      city: clean(body.city, 100),
      projectType: clean(body.projectType, 30),
      spaceSize: clean(body.spaceSize, 100),
      budget: clean(body.budget, 100),
      preferredContactTime: clean(body.preferredContactTime, 100),
      details: clean(body.details, 2000),
    };
    if (
      !project.fullName ||
      !project.email.includes("@") ||
      !project.phone ||
      !project.city ||
      !allowedProjectTypes.has(project.projectType) ||
      project.details.length < 10
    ) {
      throw new Error("Project details are incomplete");
    }

    const images = formData
      .getAll("images")
      .filter((item): item is File => item instanceof File)
      .slice(0, 5);
    for (const image of images) {
      if (!allowedImageTypes.has(image.type)) throw new Error("Unsupported image type");
      if (image.size > 5 * 1024 * 1024) throw new Error("Each image must be 5 MB or less");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const requestId = crypto.randomUUID();
    for (const [index, image] of images.entries()) {
      const extension = allowedImageTypes.get(image.type)!;
      const path = `${requestId}/${index + 1}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("project-requests")
        .upload(path, image, { contentType: image.type, upsert: false });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
    }

    const { data: savedRequest, error: insertError } = await supabase
      .from("project_requests")
      .insert({
        id: requestId,
        customer_name: project.fullName,
        email: project.email,
        phone: project.phone,
        city: project.city,
        project_type: project.projectType,
        space_size: project.spaceSize || null,
        budget: project.budget || null,
        preferred_contact_time: project.preferredContactTime || null,
        details: project.details,
        image_paths: uploadedPaths,
      })
      .select("request_number,created_at")
      .single();
    if (insertError) throw insertError;

    let imageLinks = "";
    if (uploadedPaths.length) {
      const { data: signedImages } = await supabase.storage
        .from("project-requests")
        .createSignedUrls(uploadedPaths, 60 * 60 * 24 * 7);
      imageLinks = (signedImages ?? [])
        .map(
          (image, index) =>
            `<li><a href="${image.signedUrl}">Open space photo ${index + 1}</a></li>`,
        )
        .join("");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [notificationEmail],
        reply_to: project.email,
        subject: `New Jothour project request #${savedRequest.request_number}`,
        html: `<h1>Project request #${savedRequest.request_number}</h1>
          <p><strong>Customer:</strong> ${escapeHtml(project.fullName)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(project.phone)}</p>
          <p><strong>Email:</strong> ${escapeHtml(project.email)}</p>
          <p><strong>City:</strong> ${escapeHtml(project.city)}</p>
          <p><strong>Project:</strong> ${escapeHtml(project.projectType)}</p>
          <p><strong>Space size:</strong> ${escapeHtml(project.spaceSize || "Not provided")}</p>
          <p><strong>Budget:</strong> ${escapeHtml(project.budget || "Not provided")}</p>
          <p><strong>Contact time:</strong> ${escapeHtml(project.preferredContactTime || "Not provided")}</p>
          <p><strong>Details:</strong><br>${escapeHtml(project.details)}</p>
          ${imageLinks ? `<h2>Space photos</h2><ul>${imageLinks}</ul><p>Links expire after 7 days.</p>` : ""}`,
      }),
    });
    if (!emailResponse.ok) {
      console.error("Project saved, but email failed:", await emailResponse.text());
    }

    return Response.json(
      {
        requestNumber: String(savedRequest.request_number),
        createdAt: savedRequest.created_at,
        emailSent: emailResponse.ok,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error(error);
    if (uploadedPaths.length) {
      const url = Deno.env.get("SUPABASE_URL");
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (url && key) {
        await createClient(url, key).storage.from("project-requests").remove(uploadedPaths);
      }
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create project request" },
      { status: 400, headers: corsHeaders },
    );
  }
});
