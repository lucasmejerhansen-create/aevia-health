# GDPR & jura — punkter til DPO/advokat

**Til:** databeskyttelsesrådgiver / advokat med sundhedsdata-erfaring
**Fra:** Aevia (CVR 46 52 07 50)
**Dato:** 17. juni 2026
**Baggrund:** Teknisk audit af aevia.dk har lukket de verificerbare tekniske/faktuelle GDPR-huller (samtykke-gating, dataminimering til klinikker, sletning/pseudonymisering ved aflysning, databehandler-liste + tredjelands-afsnit i privatlivspolitikken, brute-force-bremse, SSRF-hærdning m.m.). Nedenstående punkter kræver et **juridisk skøn** og kan ikke afgøres teknisk. De bør afklares før systemet behandler rigtige patientdata i drift.

> **Bemærk:** Dette er et sundhedsbrand, der behandler **følsomme helbredsdata (GDPR art. 9)**. Det er høj-risiko-kategorien, og flere punkter hænger sammen (DPIA, hjemmel, tredjelandsoverførsel).

---

## A. Overførsel, databehandlere & aftaler

1. **Tredjelandsoverførsel (USA).** Følgende databehandlere er i/overfører til USA: **Anthropic** (AI-chat + AI-rapportudkast), **Google** (Analytics 4), **Microsoft** (Clarity), **Stripe** (betaling), **Vercel** (hosting). Privatlivspolitikken angiver nu SCC og/eller EU-US Data Privacy Framework som grundlag — **bekræft pr. leverandør, at grundlaget faktisk foreligger** (DPF-certificering / underskrevne SCC'er). Verificér også **Upstash**-regionen (koden peger på "eu1" → sandsynligvis EU-resident; så er det ikke en tredjelandsoverførsel).

2. **Databehandleraftaler (DPA, art. 28).** Bekræft at der er **underskrevet DPA** med hver databehandler: Resend, Stripe, Upstash, Vercel, Anthropic, Google, Microsoft — samt partnerklinikker/laboratorier. Privatlivspolitikken siger "hvor det er relevant"; den endelige formulering bør matche virkeligheden.

3. **Partnerklinikkernes rolle.** Afgør pr. partner om en klinik er **databehandler** (handler på Aevias instruks → art. 28-aftale) eller **selvstændig/fælles dataansvarlig** (egen journalføring → art. 26-arrangement eller controller-to-controller). Dette bestemmer aftaletypen og er endnu ikke fastlagt.

---

## B. Følsomme helbredsdata & AI

4. **Art. 9-hjemmel i rapport-pipelinen.** Rapporter behandler navn, e-mail, **CPR** og helbredsmarkører (admin-rapport → classify → formulate → approve). Bekræft at det indhentede **udtrykkelige samtykke (art. 9, stk. 2, litra a)** dækker hele kæden, inkl. CPR-behandling (art. 87).

5. **Pseudonymiseret helbredsdata til AI (Anthropic, USA).** Rapport-udkastet sendes pseudonymiseret (aldersbånd + køn + markørstatus, ingen navn/CPR) til Anthropic. Vurdér om pseudonymisering + efterfølgende **lægegodkendelse** er tilstrækkeligt, og at oplysningen i politikken er dækkende.

6. **Automatiseret behandling / profilering (art. 13(2)(f) / art. 22).** Motoren (lib/aevia-engine) beregner deterministisk en **biologisk alder + score** og flager markører — en profilering. Afgør: (a) skal det oplyses som profilering (ja, sandsynligvis art. 13(2)(f)), og (b) udløser det art. 22, eller er lægegodkendelsen tilstrækkelig "menneske i løkken"?

7. **"Biologisk alder" — medicinsk udstyr?** Vurdér om software, der beregner biologisk alder ud fra IVD-blodprøvesvar, er **IVD/medicinsk udstyrs-software (IVDR 2017/746 / MDR)** med CE-mærkningspligt. Indtil afklaring bevares "model, ikke en diagnose"-formuleringen.

8. **Estimator-helbredsinference.** Den offentlige biologisk-alder-estimator indsamler selvrapporteret livsstil + sender et beregnet estimat (via Resend) knyttet til e-mail. Afgør om estimatet er **art. 9-helbredsdata**, og om behandlingsgrundlaget (samtykke) er korrekt beskrevet.

---

## C. Forbruger- & markedsføringsret

9. **14-dages fortrydelsesret (forbrugeraftaleloven).** Teksten beskriver undtagelsen (ret bortfalder ved fuld levering efter udtrykkelig anmodning om at starte), men det **udtrykkelige "start nu"-samtykke fanges ikke ved køb**. Teknisk kan en (ikke-forudkrydset) checkbox + tidsstempel bygges; juridisk skal formuleringen og lovhenvisningen (§§18-19 + 21-22) bekræftes, og standard-fortrydelsesvejledning/-formular bør tilføjes.

10. **Markedsførings-/lead-hjemmel.** Day-0/2/5 drip-mails (Resend) og exit-intent-lead uden samtykke-checkbox: afgør **samtykke vs. legitim interesse** og overhold ePrivacy/markedsføringsloven §10 (afmelding skal være let — link findes, men hjemlen bør fastlægges).

11. **"Godkendt af læge"-claim.** Bruges site-wide. Markedsføringsretligt skal det være korrekt, og det bør **holdes tilbage, indtil motoren (lib/aevia-engine) har dokumenteret klinisk validering** (jf. intern note om Judit).

12. **Sælger-identitet (e-handelsloven §7).** Betingelserne siger "Aevia drives af **Klart Studio** (enkeltmandsvirksomhed)", mens privatlivspolitik + footer bruger **"Aevia Health"** — samme CVR, to navne. Bekræft det CVR-registrerede navn og tilføj en konsekvent binavn-oplysning ("Aevia Health er et binavn for Klart Studio, CVR 46 52 07 50").

---

## D. Governance

13. **DPO-pligt (art. 37(1)(c)).** Vurdér om kerneaktivitet = **storskala behandling af art. 9-helbredsdata** udløser pligt til at udpege en databeskyttelsesrådgiver. Hvis ja: udpeg + offentliggør kontaktoplysninger i privatlivspolitikken §1.

14. **DPIA (art. 35).** Storskala art. 9-data + ny teknologi (AI i rapportprocessen) peger stærkt mod, at en **konsekvensanalyse (DPIA)** er påkrævet, før live patientdata behandles. (Kode-kommentar i classify-report.js nævner allerede "Ingen LIVE patientdata før DPIA + DPA-aftaler er på plads".)

---

### Teknisk status (allerede håndteret — til orientering)
- Samtykke: GA4/Clarity loader først efter "Accepter alle" på alle sider; consent-mode default denied.
- Dataminimering: klinikker får kun navn + én kontaktkanal (ikke e-mail+telefon+pakke).
- Sletning: aflysning pseudonymiserer kundedata + sletter betalingsmarkør; opbevarings-TTL'er oplyst.
- Privatlivspolitik: databehandler-liste + tredjelands-afsnit + estimator/booking-kategorier tilføjet (DA+EN).
- Sikkerhed: tokens i Authorization-header (ikke URL), brute-force-bremse på admin/klinik/rapport-endpoints, SSRF-hærdet kalender-hentning, klinik-bekraeft viser kun server-verificerede felter.
- Per-læge-autentificering på rapport-endpoints (doctorId kan i dag forfalskes med ADMIN_TOKEN) er **endnu ikke bygget** — anbefales sammen med en separat DOCTOR_TOKEN/SSO-rolle før live.
