# GDPR & databeskyttelse — Aevia-motoren + rapport-admin

**Status:** Tekniske foranstaltninger på plads. Juridisk proces (DPIA, DPA'er, behandlingsgrundlag) **udestår**.
**⚠️ Ingen live/rigtige patientdata må behandles før DPIA er godkendt.**

Dette dokument beskriver de tekniske og organisatoriske foranstaltninger (TOMs) i koden. Det er **ikke** juridisk rådgivning og erstatter ikke en DPIA eller en databeskyttelsesrådgiver (DPO).

## Datatype
Blodprøver, VO2max og MR-kropskomposition er **helbredsoplysninger** → særlige kategorier af personoplysninger, **GDPR art. 9**. Kræver et eksplicit behandlingsgrundlag ud over art. 6 (typisk art. 9(2)(a) udtrykkeligt samtykke, eller (h) sundhedsbehandling under fagligt ansvar).

## Dataflow
```
Klinik/bruger → [browser: PII indtastes] → POST /api/classify-report (server-til-server)
  → deidentify() fjerner navn/CPR/mail → klassificering (deterministisk)
  → ReportDraft (PII-fri) → [AI-formulering] → [LÆGE godkender] → frigivelse
```

## Implementerede TOMs (kort → hvor i koden)

| GDPR-princip | Foranstaltning | Hvor |
|---|---|---|
| **Pseudonymisering** (art. 4(5), 32) | `deidentify()`: tilfældig UUID, ALDRIG udledt af CPR; kobling PII↔pseudoId ligger ikke i objektet | `lib/aevia-engine/src/deidentify.ts` |
| **Dataminimering** (art. 5(1)(c)) | Præcis alder → 5-års aldersbånd; kun markører + køn + aldersbånd forlader serveren mod AI | `deidentify.ts` |
| **Indbygget databeskyttelse** (art. 25) | AI ser aldrig PII; `assertNoPII()` som runtime-sikkerhedsnet før AI-laget | `deidentify.ts`, `draft.ts` |
| **Formålsbegrænsning** (art. 5(1)(b)) | Motoren klassificerer kun; ingen sekundær brug | hele `lib/aevia-engine` |
| **Ansvarlighed / menneskeligt tilsyn** (art. 5(2), 22) | Læge SKAL godkende (`doctor_approve` kræver `doctorId`); ingen automatiseret frigivelse; fuldt revisionsspor | `pipeline.ts` |
| **Integritet & fortrolighed** (art. 32) | Endpoint kræver `ADMIN_TOKEN` (timing-safe); `Cache-Control: no-store`; fejl-logs indeholder ikke PII; security-headers (HSTS, nosniff, frame) | `api/classify-report.js`, `vercel.json` |
| **Lagringsbegrænsning** (art. 5(1)(e)) | Algoritme-/API-laget er **statsløst** — gemmer intet. Fil-læsning (CSV/PDF/Excel) sker 100% i browseren; filer uploades aldrig | `admin-rapport.html`, `classify-report.js` |
| **Gennemsigtighed** (art. 12–14) | Rapporten mærkes "udkast/fortrolig", viser pseudoId, og at biologisk alder er et estimat | rapport i `admin-rapport.html` |

## Adgang
- `admin-rapport.html`: `noindex,nofollow`; beskyttet af `ADMIN_TOKEN`. Dev-token forudfyldes KUN på `localhost`.
- Endpoint må kun kaldes server-til-server fra autoriseret klinik-/website-backend — **ikke** direkte fra app-klienten med klientens nøgler (PII må ikke i klient-bundlen).

## UDESTÅR — juridisk/organisatorisk (ikke kode)
- [ ] **DPIA** (art. 35) — påkrævet for storskala særlige kategorier. Skal godkendes før live data.
- [ ] **Behandlingsgrundlag** art. 6 + art. 9 fastlagt og dokumenteret (samtykke-flow eller sundhedsbehandling).
- [ ] **Databehandleraftaler** (art. 28) med ALLE underdatabehandlere: Vercel (hosting), AI-leverandør (formulering), Supabase (DB), partnerklinikker/labs, mail.
- [ ] **AI-leverandør:** dataaftale der forbyder træning på data; helst EU-region; kun pseudonymiseret payload sendes (allerede teknisk sikret).
- [ ] **Fortegnelse over behandlingsaktiviteter** (art. 30).
- [ ] **Retention-politik** + sletterutiner for den (adskilte) PII↔pseudoId-tabel og rapporter.
- [ ] **Registreredes rettigheder** (indsigt, sletning, dataportabilitet) — proces + teknik.
- [ ] **Brud-procedure** (art. 33–34) — 72-timers anmeldelse.
- [ ] **Tredjelandsoverførsel** vurderet (AI/cloud uden for EU → SCC'er).
- [ ] **Kryptering at-rest/in-transit** for den fremtidige PII↔pseudoId-kobling og lager.
- [ ] **Klinisk validering** (overlæge Judit Kolovics) af referenceintervaller, enheds-konverteringer og biologisk alder-model — påkrævet før klinisk brug (kvalitet/patientsikkerhed, ikke GDPR i sig selv, men en forudsætning).

## Kontrol af "ingen PII til AI"
Kør motorens test-suite (`npm test` i `lib/aevia-engine`): `deidentify`- og `draft`-tests verificerer at navn/CPR/mail aldrig optræder i `ReportDraft`, og `assertNoPII` kaster ved kendte PII-nøgler.
