# Guide: Google Business Profile + UptimeRobot (Lucas' egne opgaver)

Begge opgaver tager tilsammen under en time og kræver ingen kode.

---

## 1) Google Business Profile (Herning)

Hvorfor: Gratis synlighed i Google Maps og lokale søgninger ("sundhedstjek Herning", "helbredstjek nær mig"). Vigtigt signal til Google om, at Aevia er en rigtig virksomhed.

1. Gå til https://business.google.com og log ind med Google Workspace-kontoen (kontakt@aevia.dk).
2. Klik **Tilføj virksomhed** og udfyld:
   - Navn: **Aevia Health**
   - Kategori: **Sundhedskonsulent** (primær) — tilføj evt. "Helbredsundersøgelsescenter" som sekundær
   - Adresse: **Bredgade 11, 7400 Herning** (vælg "kunder besøger ikke adressen" + serviceområde, hvis I ikke vil have walk-ins; serviceområde: hele Danmark)
   - Telefon: **+45 28 30 39 33**
   - Website: **https://aevia.dk**
3. Verificér ejerskab (typisk postkort til adressen eller telefon/video — følg flowet).
4. Efter verificering, udfyld profilen helt:
   - Åbningstider: man–fre 08–17
   - Beskrivelse (maks. 750 tegn): "Aevia Health hjælper dig med at kende dit reelle helbred. Biologisk alder, fuldt blodpanel med 70+ markører, VO2max, helkrops-MRI og genetik — samlet i én personlig rapport, gennemgået 1:1. Forebyggende helbredstjek for private og virksomheder i hele Danmark."
   - Upload logo + og-image samt evt. fotos.
   - Tilføj booking-link: https://aevia.dk/book.html
5. Når de første kunder er igennem: bed dem om en Google-anmeldelse (link findes i profilen under "Få flere anmeldelser"). Anmeldelser er den største lokale rangeringsfaktor.

Tip: Opret et opslag i profilen ca. én gang om måneden (genbrug LinkedIn-posts fra PLAN-linkedin-og-artikler.md) — aktive profiler rangerer bedre.

---

## 2) UptimeRobot (overvågning af aevia.dk + booking-API)

Hvorfor: Du opdager nedetid før kunderne gør — gratis op til 50 monitorer.

1. Opret konto på https://uptimerobot.com (gratis plan er nok).
2. Opret disse monitorer (**Add New Monitor → HTTP(s)**), interval 5 min:

   | Navn | URL | Forventet |
   |---|---|---|
   | aevia.dk forside | https://aevia.dk | 200 OK |
   | Booking-side | https://aevia.dk/book.html | 200 OK |
   | Booking-API | https://aevia.dk/api/booking | (se note) |
   | Checkout-API | https://aevia.dk/api/checkout | (se note) |

   Note: API-endpointene svarer 405 på GET (de forventer POST). Sæt monitor-typen til **Keyword** i stedet og tjek at svaret indeholder `Method not allowed` — så ved du, at funktionen kører. Alternativt accepter 405 under "HTTP Status Codes" (kræver betalt plan), eller brug keyword-metoden (gratis).
3. **Alerts**: tilføj kontakt → e-mail til kontakt@aevia.dk (og evt. SMS/push via UptimeRobot-appen).
4. Valgfrit: opret en offentlig statusside (Settings → Public Status Pages), hvis I vil kunne dele driftsstatus.

Tjek efter en uge, at der ikke er falske alarmer (justér interval/keyword hvis nødvendigt).
