export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://protechtb.sk",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, service: "protechtb-cf-contact" }), {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    if (request.method !== "POST" || url.pathname !== "/contact") {
      return new Response(JSON.stringify({ ok: false, error: "not_found" }), {
        status: 404,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const form = await request.formData();
    const honeypot = (form.get("website") || "").toString().trim();
    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json", ...corsHeaders } });
    }

    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const topic = (form.get("topic") || "general").toString().trim();
    const message = (form.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, error: "missing_fields" }), {
        status: 422,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    const mailBody = [
      `Meno: ${name}`,
      `Email: ${email}`,
      `Tema: ${topic}`,
      `
Sprava:
${message}`,
    ].join("
");

    // Resend API (recommended)
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: [env.MAIL_TO],
        reply_to: email,
        subject: `Novy dopyt z ProTechTB webu — ${topic}`,
        text: mailBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      return new Response(JSON.stringify({ ok: false, error: "mail_send_failed", detail: errText }), {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json", ...corsHeaders },
    });
  }
};
