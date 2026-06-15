// Aevia Health — Stripe Checkout
// Opretter en betalingsside (engangsbetaling) for den valgte pakke og sender
// kunden videre til Stripe. Kaldes som et almindeligt link:
//   /api/checkout?pkg=core
//
// Kører som serverless-funktion på Vercel. Kræver kun miljøvariablen
// STRIPE_SECRET_KEY for at virke (se STRIPE-SETUP.md).

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pakkerne — beløb i øre (inkl. moms), i danske kroner.
// 10.995 kr = 1099500 øre osv. Skal matche priserne på pakker.html.
const PACKAGES = {
  core: {
    name: "Aevia Core",
    amount: 1099500,
    description:
      "Biologisk alder, fuld blodpanel (70+ markører), metabolisk & kardiovaskulær risikoprofil + lægegennemgang.",
  },
  executive: {
    name: "Aevia Plus",
    amount: 1849500,
    description:
      "Alt i Core + konditionstest (VO2max), fuldt hormonpanel og personlig protokol med målbare KPI'er.",
  },
  elite: {
    name: "Aevia Elite",
    amount: 3699500,
    description:
      "Alt i Plus + helkrops-MRI (uden kontrast), genetisk profil og 3-måneders follow-up med re-test.",
  },
};

// Gavekort — beløb i øre (inkl. moms). Købes via /api/checkout?pkg=gavekort&beloeb=<nøgle>
const GIFTCARDS = {
  "1000":  { name: "Gavekort til Aevia — 1.000 kr.",  amount: 100000 },
  "2500":  { name: "Gavekort til Aevia — 2.500 kr.",  amount: 250000 },
  "5000":  { name: "Gavekort til Aevia — 5.000 kr.",  amount: 500000 },
  "core":  { name: "Gavekort til Aevia — Core-forløb", amount: 1099500, description: "Et komplet Aevia Core-helbredstjek i gave: biologisk alder, fuldt blodpanel (70+ markører) og lægegennemgang." },
  "plus":  { name: "Gavekort til Aevia — Plus-forløb", amount: 1849500, description: "Et komplet Aevia Plus-forløb i gave: alt i Core + konditionstest (VO2max) og fuldt hormonpanel." },
};

// Valgfrie tilvalg — beløb i øre (inkl. moms). Skal matche priserne på pakker.html.
const ADDONS = {
  vo2max:   { name: "Tilvalg: Konditionstest (VO2max)",                        amount: 189500 },
  hormon:   { name: "Tilvalg: Fuldt hormonpanel",                  amount: 229500 },
  mri:      { name: "Tilvalg: Helkrops-MRI (uden kontrast)",       amount: 1189500 },
  genetik:  { name: "Tilvalg: Genetisk profil & risikobærere",     amount: 439500 },
  followup: { name: "Tilvalg: 3-måneders follow-up med re-test",   amount: 359500 },
};

export default async function handler(req, res) {
  try {
    const pkg = String(req.query.pkg || "").toLowerCase();

    // Gavekort: /api/checkout?pkg=gavekort&beloeb=1000|2500|5000|core|plus
    let item = PACKAGES[pkg];
    let isGift = false;
    if (pkg === "gavekort") {
      const beloeb = String(req.query.beloeb || "").toLowerCase();
      item = GIFTCARDS[beloeb];
      isGift = true;
      if (!item) {
        res.status(400).send("Ukendt gavekortbeløb. Gå tilbage og vælg igen.");
        return;
      }
    }

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

    // Byg et line item ud fra navn + beløb (inkl. moms).
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
        isGift
          ? {
              key: "modtager_navn",
              label: { type: "custom", custom: lang === "en" ? "Recipient's name (for the gift card)" : "Modtagerens navn (til gavekortet)" },
              type: "text",
            }
          : {
              key: "navn_paa_testperson",
              label: { type: "custom", custom: "Fulde navn på personen der testes" },
              type: "text",
            },
      ],
      metadata: { pakke: pkg, package_name: item.name, tilvalg: valgteTilvalg.join(","), ...(isGift ? { gavekort: String(req.query.beloeb || "") } : {}), ...(req.query.bid ? { booking_id: String(req.query.bid).slice(0, 40) } : {}) },
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
