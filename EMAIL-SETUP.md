# Bekræftelses-emails efter booking (Stripe → Resend)

Når en kunde betaler via Stripe, sender `api/stripe-webhook.js` automatisk en
bekræftelses-email til kunden (og en kopi til kontakt@aevia.dk).

## 1. Opret Resend-konto (5 min)
1. Gå til [resend.com](https://resend.com) → opret konto (gratis: 100 mails/dag).
2. **Domains** → Add domain → `aevia.dk` → tilføj de viste DNS-poster (DKIM/SPF)
   hos din DNS-udbyder → vent på "Verified".
3. **API Keys** → Create API key → kopiér nøglen (`re_...`).

## 2. Opret webhook i Stripe (3 min)
1. [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks → **Add endpoint**.
2. Endpoint URL: `https://aevia.dk/api/stripe-webhook`
3. Vælg eventet **`checkout.session.completed`** → Add endpoint.
4. Kopiér **Signing secret** (`whsec_...`).

## 3. Miljøvariabler i Vercel (2 min)
Vercel → Project → Settings → Environment Variables:

| Navn | Værdi |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` fra trin 2 |
| `RESEND_API_KEY` | `re_...` fra trin 1 |
| `MAIL_FROM` | `Aevia <kontakt@aevia.dk>` |

(`STRIPE_SECRET_KEY` er der allerede.)

## 4. Test
1. Redeploy projektet (Vercel gør det automatisk ved næste push).
2. Lav et testkøb (brug Stripe testkort `4242 4242 4242 4242` i testmode).
3. Tjek at mailen lander — og se evt. fejl i Vercel → Logs.

## Hvad mailen indeholder
Kvittering (forløb + beløb) og de tre næste skridt: vi kontakter dig inden for
1 arbejdsdag, forberedelsesguide (faste), rapport inden for 10 arbejdsdage.
