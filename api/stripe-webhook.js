// Aevia — Stripe webhook: sender bekræftelses-email efter gennemført betaling.
//
// Opsætning (se EMAIL-SETUP.md):
//   1) Stripe Dashboard → Developers → Webhooks → Add endpoint:
//        URL: https://aevia.dk/api/stripe-webhook
//        Event: checkout.session.completed
//   2) Miljøvariabler i Vercel:
//        STRIPE_SECRET_KEY      (findes allerede)
//        STRIPE_WEBHOOK_SECRET  (whsec_... fra webhook-endpointet)
//        RESEND_API_KEY         (fra resend.com — gratis op til 100 mails/dag)
//        MAIL_FROM              fx "Aevia <kontakt@aevia.dk>" (domæne verificeret i Resend)

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function rawBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(typeof c === "string" ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

function kr(amountTotal) {
  return (amountTotal / 100).toLocaleString("da-DK") + " kr.";
}

function emailHtml({ name, pkg, total }) {
  return `<!DOCTYPE html><html lang="da"><body style="margin:0;background:#0a1628;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:36px 24px">
    <div style="font-size:26px;font-weight:bold;color:#f5f5f0;font-family:Georgia,serif">Aevia<span style="color:#c9a437">.</span></div>
    <div style="background:#0f1f36;border:1px solid #28394f;border-radius:14px;padding:28px;margin-top:22px">
      <h1 style="color:#f5f5f0;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">Tak for din booking${name ? ", " + name : ""}</h1>
      <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 16px">Vi har modtaget din betaling, og dit forløb er bekræftet.</p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 16px">
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">Forløb</td><td style="color:#f5f5f0;font-size:14px;text-align:right">${pkg}</td></tr>
        <tr><td style="color:#94a0b2;font-size:14px;padding:6px 0">Betalt</td><td style="color:#c9a437;font-size:14px;font-weight:bold;text-align:right">${total}</td></tr>
      </table>
      <p style="color:#aab4c2;font-size:15px;line-height:1.6;margin:0 0 8px"><strong style="color:#f5f5f0">Næste skridt:</strong></p>
      <ol style="color:#aab4c2;font-size:15px;line-height:1.7;margin:0 0 16px;padding-left:20px">
        <li>Vi kontakter dig inden for 1 arbejdsdag for at aftale tid og sted for din prøvetagning.</li>
        <li>Du modtager en forberedelsesguide (bl.a. 8-12 timers faste før blodprøven — vand er ok).</li>
        <li>Din rapport er klar inden for 10 arbejdsdage efter prøvetagning og gennemgås 1:1.</li>
      </ol>
      <p style="color:#aab4c2;font-size:14px;line-height:1.6;margin:0">Spørgsmål? Svar på denne mail eller skriv til <a href="mailto:kontakt@aevia.dk" style="color:#c9a437">kontakt@aevia.dk</a>.</p>
    </div>
    <p style="color:#94a0b2;font-size:12px;margin-top:18px;text-align:center">Aevia Health ApS · CVR 46 52 07 50 · <a href="https://aevia.dk" style="color:#c9a437">aevia.dk</a></p>
  </div>
</body></html>`;
}

async function sendMail({ to, subject, html, bcc }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "Aevia <kontakt@aevia.dk>",
      to: [to],
      bcc: bcc ? [bcc] : undefined,
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(await rawBody(req), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const to = s.customer_details?.email;
    const name = s.customer_details?.name || "";
    const pkg = s.metadata?.package_name || "Aevia-forløb";
    const total = kr(s.amount_total || 0);
    if (to && process.env.RESEND_API_KEY) {
      try {
        await sendMail({
          to,
          bcc: "kontakt@aevia.dk",
          subject: "Din booking hos Aevia er bekræftet",
          html: emailHtml({ name: name.split(" ")[0], pkg, total }),
        });
      } catch (e) {
        console.error("Mail-fejl:", e.message);
        // Returnér alligevel 200, så Stripe ikke gen-sender i én uendelighed;
        // fejlen kan ses i Vercel-loggen.
      }
    }
  }

  return res.status(200).json({ received: true });
}
