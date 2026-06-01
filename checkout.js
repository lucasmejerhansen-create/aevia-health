// Aevia Health — Stripe Checkout
// Opretter en betalingsside (engangsbetaling) for den valgte pakke og sender
// kunden videre til Stripe. Kaldes som et almindeligt link:
//   /api/checkout?pkg=core
//
// Kører som serverless-funktion på Vercel. Kræver kun miljøvariablen
// STRIPE_SECRET_KEY for at virke (se STRIPE-SETUP.md).

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pakkerne — beløb i øre (ekskl. moms), i danske kroner.
// 8.900 kr = 890000 øre osv. Skal matche priserne på pakker.html.
const PACKAGES = {
  core: {
    name: "Aevia Core",
    amount: 890000,
    description:
      "Biologisk alder, fuld blodpanel (70+ markører), metabolisk & kardiovaskulær risikoprofil + 1:1 lægegennemgang.",
  },
  executive: {
    name: "Aevia Executive",
    amount: 1490000,
    description:
      "Alt i Core + VO2max, fuldt hormonpanel og personlig protokol med målbare KPI'er.",
  },
  elite: {
    name: "Aevia Elite",
    amount: 2990000,
    description:
      "Alt i Executive + helkrops-MRI (uden kontrast), genetisk profil og 3-måneders follow-up med re-test.",
  },
};

// Valgfrie tilvalg — beløb i øre (ekskl. moms). Skal matche priserne på pakker.html.
const ADDONS = {
  vo2max:   { name: "Tilvalg: VO2max-test",                        amount: 150000 },
  hormon:   { name: "Tilvalg: Fuldt hormonpanel",                  amount: 180000 },
  mri:      { name: "Tilvalg: Helkrops-MRI (uden kontrast)",       amount: 950000 },
  genetik:  { name: "Tilvalg: Genetisk profil & risikobærere",     amount: 350000 },
  followup: { name: "Tilvalg: 3-måneders follow-up med re-test",   amount: 290000 },
};

export default async function handler(req, res) {
  try {
    const pkg = String(req.query.pkg || "").toLowerCase();
    const item = PACKAGES[pkg];

    if (!item) {
      res.status(400).send("Ukendt pakke. Gå tilbage og vælg en pakke.");
      return;
    }

    // Base-URL til success/cancel. Sættes via SITE_URL i produktion,
    // ellers udledes den af forespørgslen.
    const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const origin = process.env.SITE_URL || `${proto}://${req.headers.host}`;

    // Slå dansk moms (25%) til ved at sætte STRIPE_ENABLE_TAX=true i Vercel
    // OG aktivere Stripe Tax i dashboardet. Som standard er den slået fra,
    // så betalingen virker med det samme i testfasen.
    const enableTax = process.env.STRIPE_ENABLE_TAX === "true";

    // Byg et line item ud fra navn + beløb (ekskl. moms).
    const lineItem = (name, amount, description) => ({
      quantity: 1,
      price_data: {
        currency: "dkk",
        unit_amount: amount,
        ...(enableTax ? { tax_behavior: "exclusive" } : {}),
        product_data: description ? { name, description } : { name },
      },
    });

    // Start med selve pakken.
    const lineItems = [lineItem(item.name, item.amount, item.description)];

    // Tilføj valgte tilvalg (fx ?addons=mri,genetik) som separate linjer.
    const valgteTilvalg = String(req.query.addons || "")
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => ADDONS[k]);

    for (const key of valgteTilvalg) {
      lineItems.push(lineItem(ADDONS[key].name, ADDONS[key].amount));
    }

    // Sprog på Stripe-betalingssiden: ?lang=en giver engelsk, ellers dansk.
    const lang = String(req.query.lang || "").toLowerCase() === "en" ? "en" : "da";

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // engangsbetaling — ikke abonnement
      locale: lang,
      line_items: lineItems,
      ...(enableTax ? { automatic_tax: { enabled: true } } : {}),
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: "navn_paa_testperson",
          label: { type: "custom", custom: "Fulde navn på personen der testes" },
          type: "text",
        },
      ],
      metadata: { pakke: pkg, tilvalg: valgteTilvalg.join(",") },
      success_url: `${origin}/${lang === "en" ? "en/" : ""}success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${lang === "en" ? "en/" : ""}pakker.html`,
    });

    res.redirect(303, session.url);
  } catch (err) {
    console.error("Stripe checkout-fejl:", err);
    res
      .status(500)
      .send("Kunne ikke starte betalingen. Prøv igen, eller kontakt os på kontakt@aevia.dk.");
  }
}
