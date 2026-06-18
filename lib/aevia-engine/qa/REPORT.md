# QA-rapport — Cohort Simulator for Aevia-motoren

Slutrapport for QA-workflowet "Cohort Simulator". Workflowet crashede før denne
rapport blev skrevet; regressionstestene er ryddet op, kørt mod den kompilerede
motor og kategoriseret nedenfor.

## 1. Resumé

**Metode (4 trin):**

1. **Syntetisk kohorte** — 8 kohorte-filer (`qa/cohort/*.json`) med i alt **800
   syntetiske patienter** (raske unge/ældre, metabolisk, thyroidea/hormonel,
   jern/anæmi, grænseværdier, blandet-realistisk og bevidste "fælder"/traps).
2. **Rigtig motor** — alle 800 patienter kørt gennem den faktisk kompilerede motor
   (`../dist/src/index.js`, identisk med `src/`) via `qa/run-cohort.mjs`. Output:
   `qa/results.ndjson`.
3. **Klinisk audit** — auditor-agenter joinede de 800 resultater mod kohorte-input
   og reglerne i `src/classify.ts`, `clinical.ts`, `reference-data.ts`, `bio-age.ts`,
   `deidentify.ts`, `score.ts` og fandt afvigelser.
4. **Regressionstests** — hvert fund blev fastfrosset som en `node:test`-fil i
   `qa/regressions/`, der kører mod den kompilerede motor.

**Hovedresultat:** Motoren er **robust mod crash og PII-lækage** (0 crashes, 0
PII-lækager på 800 patienter). De reelle fund sidder i det **kliniske
fortolkningslag**: biologisk alder (`bio-age.ts`), mønster-/risiko-detektion
(`clinical.ts`) og klassificering af åbne/retningsbestemte bånd
(`reference-data.ts` + `classify.ts`). Efter oprydning står der **14 rene
regressionstest-filer** (én pr. unikt fund). **Alle 14 fejler** mod den nuværende
motor — dvs. de dokumenterer hver et reelt fund, ikke en falsk alarm. De 5
beståede *sub*-tests er kontrol-/sanity-asserts inde i ellers fejlende filer (fx
"et rent panel giver stadig finit PhenoAge").

## 2. Kørsels-statistik (optalt fra `qa/results.ndjson`)

| Metrik | Antal |
|---|---|
| Patienter kørt | **800** |
| Crashes (`ok === false`) | **0** |
| PII-lækager (`piiLeak === true`) | **0** |
| Consistency-mismatches (en eller flere `*MatchesDraft === false`) | **1** |
| — heraf `scoreMatchesDraft === false` | 0 |
| — heraf `bioAgeMatchesDraft === false` | 1 (`trap-088`) |
| — heraf `markerCountMatchesDraft === false` | 0 |

Fordeling pr. kohorte: boundary 90, healthy-older 90, healthy-young 90,
iron-anemia 80, metabolic 110, mixed-realistic 140, thyroid-hormonal 90, traps 110.

**Den ene consistency-mismatch (`trap-088`)** er ikke en separat bug — det er
præcis det non-finite bio-age-fund (B1 nedenfor): draftens `biologicalAge` er
`{"estimatedAge":null, "available":true, ...}`. `run-cohort.mjs` markerer derfor
`bioAgeMatchesDraft:false`, fordi `null` ikke matcher et tal-estimat.

## 3. Bekræftede fund (tests der fejler = reelle bugs)

Sorteret efter sværhedsgrad. "Forbehold": optimal-zonerne er endnu **ikke klinisk
valideret** (se §6) — fundene handler om **logisk konsistens og datakontrakt**, ikke
om klinisk sandhed.

### Høj

**B1 — PhenoAge: ikke-finit/serialiseret-`null` bio-alder med `available:true`**
Testfil: `bioage-non-finite-available-true.test.mjs`
- **Input (min.):** 9 normale PhenoAge-input, men `glukose=126` (mg/dL-værdi
  fejlmærket mmol/L), `age=52` (`metabolic-091`); eller `kreatinin=NaN` (`trap-088`);
  eller `hscrp=Infinity` (`trap-089`).
- **Observeret:** `Math.exp(xb)` mætter → `mortalityScore→1` → `Math.log(1-1)=-Infinity`
  → `estimatedAge=Infinity/NaN`, men `available:true`. Efter JSON/NDJSON:
  `{"estimatedAge":null, "confidenceInterval":[null,null], "available":true}`.
- **Forventet:** ikke-finit/ikke-beregneligt estimat ⇒ `available:false`;
  `estimatedAge` må aldrig vises som tal (jf. `types.ts BiologicalAge`).
- **Rod-årsag:** `src/bio-age.ts` — `extractPhenoInputs()` tjekker kun `== null`
  (ikke `Number.isFinite`); `phenoAgeYears()` har intet output-værn;
  `estimateBiologicalAge()` sætter `available:true` uden finitheds-tjek.
- **Omfang:** 3 records i `results.ndjson` har `available:true` + `estimatedAge:null`.

**B2 — PhenoAge: klinisk umulig biologisk alder (< 18 år) for raske unge**
Testfil: `bioage-under18-estimat.test.mjs`
- **Input (min.):** rask 22-årig med 9 normale PhenoAge-input (`healthy-young-006`)
  → `estimatedAge=3`, `confidenceInterval=[0,6]`, `available:true`.
- **Observeret:** encifrede biologiske aldre præsenteres som gyldige.
- **Forventet:** plausibel voksen-alder (≥ 18) eller `available:false`
  (uden for valideret voksen-domæne).
- **Rod-årsag:** `src/bio-age.ts` — 18–110-værnet gælder kun det **kronologiske
  input**, ikke output-estimatet; PhenoAge afgrænses ikke (clamp) mod modellens
  voksen-domæne.
- **Omfang:** 48 `available`-records < 18 år; 122 < 25 år.

**B3 — `hypothyroid`-mønster fyrer (severity `action`) på euthyroidt panel**
Testfil: `hypothyroid-falsk-action.test.mjs`
- **Input (min.):** `tsh=3,1 / ft4=11 / ft3=3,9` (alle inden for lab-reference,
  `boundary-018`); og `tsh=2,9 / ft4=16 (optimal) / ft3=3,7` (`healthy-older-004`).
- **Observeret:** `hypothyroid` udløses med severity `action` ("søg læge") på
  normale stofskifteprøver.
- **Forventet:** intet mønster (eller ikke `action`). Etableret kriterium: TSH
  over lab-øvre-grænse + ft4 under reference.
- **Rod-årsag:** `src/clinical.ts detectPatterns` — bruger optimal-zonens kant
  (`hi/lo` mod `optimal[]`) i stedet for klinisk reference; severity hårdkodet `action`.

**B4 — Mønstre udløses falsk-positivt på raske (optimal-kant frem for status)**
Testfil: `moenstre-falsk-positiv-rask.test.mjs`
- **Input (min.):** `b12=326 / homocystein=10,7 / mcv=89` — alle inden for reference
  (`healthy-older-002`) → `b12_deficiency` (watch) udløses.
- **Observeret:** `isLow(b12): 326 < optimal[0]=350` og `isHigh(homocystein): 10,7 >
  optimal[1]=9` driver mønsteret, selvom ingen markør når watch/action.
- **Forventet:** mønster kun ved klinisk afvigelse (markørens egen watch/action-status).
- **Rod-årsag:** `src/clinical.ts` — `isHigh`/`isLow` sammenligner mod **optimal-zonens
  kant**, ikke `ClassifiedMarker.status`. Aevias optimal-zoner er bevidst strammere
  end lab-reference.
- **Omfang:** 53 distinkte patienter får ≥ 1 mønster hvor ingen listet markør når
  watch/action (58/90 i den rask-designede `healthy-older`-kohorte).

**B5 — Mønster-`markers`-liste indeholder optimale markører (vildledende evidens)**
Testfil: `moenstre-lister-optimale-markoerer.test.mjs`
- **Input (min.):** `hscrp=1,2 / fibrinogen=2,4 (optimal) / sr=12` (`metabolic-015`)
  → `inflammation` lister fibrinogen som "forhøjet"; `alat/ggt/trig/fedtprocent/taljemaal`
  alle optimale/ok (`healthy-older-005`) → `fatty_liver` lister optimale markører.
- **Observeret:** detaljen siger "forhøjede samtidig", men listede markører er optimale;
  desuden udløses `inflammation` af hs-CRP=1,2 mg/L (AHA: lav/moderat, ikke "forhøjet").
- **Forventet:** `markers` må kun liste reelt forhøjede; inflammation kræver klinisk
  tærskel (fx hs-CRP ≥ 3 mg/L).
- **Rod-årsag:** `src/clinical.ts present()` returnerer alle panel-markører uanset `isHigh`.

**B6 — Stærkt supprimeret TSH klassificeres `optimal` + manglende `hyperthyroid`**
Testfil: `klassificering-supprimeret-tsh-optimal.test.mjs`
- **Input (min.):** `tsh=0,001` → `optimal`; `tsh=0,001 / ft4=58 / ft3=15,8`
  (klassisk thyrotoksikose) → intet `hyperthyroid`-mønster.
- **Observeret:** supprimeret TSH (hyperthyreose) vises som "optimal".
- **Forventet:** mindst `watch`/`action`; lav TSH + høj FT4/FT3 ⇒ `hyperthyroid`.
- **Rod-årsag:** `src/reference-data.ts bandsFor()` åbner hele den lave ende
  (`optimal[0]=-Infinity`) for `lowerIsBetter`-markører; `src/clinical.ts` mangler
  et `hyperthyroid`-mønster.
- **Omfang:** thyroid-hormonal-019/020/021/023/025/028/030/032/088/090 + trap-094
  har `tsh='optimal'` mens `ft4/ft3='action'`.

**B7 — `insulin_resistance`-flaget misbehaver (3 sammensmeltede vinkler)**
Testfil: `insulinresistens-falsk-flag.test.mjs`
- **Input (min.):**
  - `trap-096`: HOMA-IR=0,84 / glukose=5,0 / hba1c=33 (alle optimal) +
    insulin=1.000.000 pmol/L → `insulin_resistance(action)`.
  - `metabolic-093`: HOMA-IR=1,1 (optimal) + insulin=140 → flag citerer optimal HOMA-IR.
  - `mixed-realistic-134`: insulin=22 µIU/mL (→152,79 pmol/L) men homair-feltet=1,9 →
    action-flag på internt modstridende input; outranger samtidigt `metabolic_risk(watch)`.
- **Observeret:** absurd/implausibel insulin driver action-flag; OR-logik
  (`HOMA-IR≥2,5 ELLER insulin>80`) løfter til action alene af insulin-grenen;
  criteria viser en **optimal** HOMA-IR som "evidens"; ingen krydstjek; severity
  inkonsistent ift. metabolic_risk.
- **Forventet:** plausibilitets-flag på absurde værdier; krydstjek insulin↔homair↔glukose;
  ingen action ved fuldt optimalt blodsukkerbillede; criteria kun af reelt opfyldte kriterier.
- **Rod-årsag:** `src/clinical.ts assessRisks` (OR-logik + ubetinget criteria-liste +
  ingen samordning) og `src/classify.ts` (kun `Number.isFinite`, intet øvre plausibilitets-loft).

### Middel

**B8 — Dubleret markør-id kan skjule en farlig status i et id→status-map**
Testfil: `klassificering-dubleret-markoer-id.test.mjs`
- **Input (min.):** to `ldl`-input — `1,9 (optimal)` og `6,8 (action, FH-niveau)`.
  Med `optimal` sidst kollapser et naivt last-wins-map til `ldl='optimal'`.
- **Observeret:** `classifyAll` dedupliderer ikke; downstream last-wins-map
  (fx `run-cohort.mjs summarizeDraft`) skjuler den værste status rent rækkefølge-styret.
- **Forventet:** deterministisk dedup ("værste status vinder") før id→status-map.
- **Rod-årsag:** `src/classify.ts` (ingen dedup). Sikkerhedsnet: `flaggedForDoctor`
  beholder action-værdien uanset rækkefølge.

**B9 — Ukendt/ugyldigt køn falder lydløst tilbage til male-bånd uden flag**
Testfil: `koen-fallback-male.test.mjs`
- **Input (min.):** `testosteron=15, sex:'other'` → male-zone, `optimal`, intet flag;
  `sex:'female'` for samme værdi → `action`. `ferritin/haemoglobin` med tomt køn → male-fallback.
- **Observeret:** kønsspecifikke markører fejlklassificeres uden spor på rapporten.
- **Forventet:** `unknown_sex`-issue (datakvalitet), ikke tavs male-antagelse.
- **Rod-årsag:** `src/reference-data.ts markerForSex()` (`sex !== "female" ⇒ male`);
  `src/classify.ts` validerer ikke `input.sex`; `types.ts` mangler `unknown_sex`-kode.

**B10 — Åben +Infinity høj ende på higherIsBetter maskerer indtastningsfejl**
Testfil: `klassificering-higherisbetter-aaben-overgraense.test.mjs`
- **Input (min.):** `egfr=210` (reel `mixed-realistic-048` data-/decimalfejl, loft ~140),
  `egfr=9999`, `hdl=50 mmol/L`, `omega3=99 %`, `vo2max=100000` → alle `optimal`.
- **Observeret:** enhver finit værdi ≥ optimalLow bliver `optimal`; ingen øvre værdi flages.
- **Forventet:** fysiologisk umulige høje værdier ⇒ ikke `optimal` + datakvalitets-issue.
- **Rod-årsag:** `src/reference-data.ts bandsFor()` (optimal/ref/watch-high = +Infinity for
  higherIsBetter); `src/classify.ts` (intet øvre plausibilitets-loft).

**B11 — Implausible/inkonsistente input flages ikke som datakvalitet**
(Testet sammen med B7 i `insulinresistens-falsk-flag.test.mjs`: absurde værdier som
insulin=1e6 pmol/L får kun `unvalidated_range`, ingen `implausible_value`/sanity-/
inkonsistens-kode. Rod: `src/classify.ts` (intet plausibilitets-loft) + `src/clinical.ts`
assessRisks (intet krydstjek insulin↔homair↔glukose).)

### Lav

**B12 — Biologisk alders confidenceInterval kan ramme 0/negativ; falsk præcision**
Testfil: `bioage-confidence-interval-graense.test.mjs`
- **Input (min.):** `healthy-young-006` → `estimatedAge=3, CI=[0,6]`; ekstremt ungt
  panel → `CI=[-2,4]` (strengt negativ undergrænse).
- **Observeret:** konstant halvbredde (±3 PhenoAge / ±6 heuristik), ingen clamp; et
  formidlingsinterval "lover" en alder ≤ 0; samme smalle interval out-of-domain som midt-domæne.
- **Forventet:** CI-undergrænse > 0 (helst fysiologisk grænse); bredere interval out-of-domain.
- **Rod-årsag:** `src/bio-age.ts confidenceHalfWidth()` (konstant) + CI uden clamp
  (kommentaren erkender selv "SKAL kalibreres af Judit").

**B13 — Tom markør-liste: score 0 ("Tid til fokus") + selvsikker bio-alder = kronologisk**
Testfil: `bioage-tom-markoerliste.test.mjs`
- **Input (min.):** `{age:49, sex:'male', markers:[]}` (`trap-101`, `trap-102`).
- **Observeret:** `computeAeviaScore([])→total:0→"Tid til fokus"`;
  `estimateBiologicalAge([],49)→estimatedAge:49, available:true` (= kronologisk).
- **Forventet:** ingen data ⇒ score = N/A (ikke selvsikkert 0); bio-age `available:false`
  ved `inputsUsed:0`.
- **Rod-årsag:** `src/score.ts markerScore()` (returnerer 0 ved længde 0);
  `src/bio-age.ts heuristicAge()` (delta=0, `available:true` selv ved 0 input).

**B14 — Ugyldig alder giver nonsens-aldersbånd der lækker ind i draften**
Testfil: `ugyldig-alder-ageband.test.mjs`
- **Input (min.):** `age:"fyrre"` (`trap-100`) → `ageBand:"NaN-NaN"`; `age:-5`
  (`trap-098`) → `"-5--1"`; `age:null` → falsk plausibelt `"0-4"`.
- **Observeret:** meningsløst bånd lækker uændret ind i `deidentify().ageBand` →
  draftens `ageBand`-felt. (Bio-age degraderer korrekt til `available:false`; kun
  strengen er nonsens; ingen crash.)
- **Forventet:** `ageBandOf()` validerer (`Number.isFinite` + ikke-negativ) og giver en
  eksplicit "ukendt"-etikette.
- **Rod-årsag:** `src/deidentify.ts ageBandOf()` (`Math.floor(age/5)*5` uden validering).

**B15 — `assertNoPII` scanner kun nøgler, ikke strengværdier (defense-in-depth-hul)**
Testfil: `pii-cpr-i-vaerdi.test.mjs`
- **Input (min.):** `assertNoPII({explanation:"patient 010101-1111 Hans Hansen"})` → kaster ikke.
- **Observeret:** CPR-mønster i en **fritekst-værdi** slipper igennem (nøgle-baseret scan kun).
  Ingen faktisk lækage i dag (motoren lægger ikke fritekst-PII i felter), derfor lav.
- **Forventet:** scan også strengværdier for dansk CPR-mønster (`\b\d{6}-?\d{4}\b`).
- **Rod-årsag:** `src/deidentify.ts assertNoPII()` (`walk()` matcher kun nøgle mod `PII_KEYS`).

## 4. Falske alarmer (tests der består)

Ingen test-fil består fuldt ud — alle 14 fund er bekræftede mod den nuværende motor.
De **5 beståede sub-tests** er kontrol-/sanity-asserts, der bevidst er bygget ind i de
ellers fejlende filer for at vise, at den korrekte adfærd **stadig holder** og at
fundet er isoleret (ikke en bredere regression):

- `bioage-non-finite-available-true.test.mjs`: "rent normalt panel giver finit,
  plausibel PhenoAge" — **består** (kun ekstreme/ikke-finitte input er ramt).
- `pii-cpr-i-vaerdi.test.mjs`: 3× nøgle-baseret PII-detektion (`cpr`-nøgle, nested
  nøgle, rent objekt) — **består** (kun *værdi*-indlejret CPR er hullet).
- `ugyldig-alder-ageband.test.mjs`: "gyldig alder giver velformet 5-års bånd" —
  **består** (kun ugyldig/negativ/ikke-numerisk alder er ramt).

Aktivt **undersøgt og afvist** (ingen bug) under workflowet, bekræftet af de globale
tal: ingen crashes, ingen PII-lækager, ingen score-/markør-tælling-mismatch på 800
patienter; enhedskonvertering og degradering ved ukendte markører fungerer.

## 5. Infrastruktur-fund: `npm test` fejler på Node 24

`package.json` har `"test": "node --test --experimental-strip-types test/*.test.ts"`.
På **Node 24** fejler dette med `ERR_MODULE_NOT_FOUND`:

```
Cannot find module '.../src/bio-age.js' imported from '.../test/bio-age.test.ts'
```

**Årsag:** native type-stripping kører `.ts`-filerne direkte, men de importerer
`.js`-stier (`from "../src/bio-age.js"`). Type-stripping omskriver **ikke**
`.js`→`.ts` ved resolution, så modulerne kan ikke findes. Til sammenligning:

```
node --test dist/test/*.test.js   ->  tests 54 | pass 54 | fail 0
```

dvs. alle 54 enhedstests **består** mod den byggede `dist/`.

**Foreslået fix (vælg én):**
1. **Kør de byggede tests** (mindst indgreb):
   `"test": "tsc && node --test dist/test/*.test.js"` — bygger først, kører `.js`.
2. **`tsx` som loader:** `"test": "tsx --test test/*.test.ts"` (tsx resolver `.js`→`.ts`).
3. **Importer uden endelse / med `.ts`** i test-filerne, hvis projektet kan bruge
   `--experimental-strip-types` med `allowImportingTsExtensions`-style resolution.

Anbefaling: (1) er mest robust og matcher det, regressionstestene allerede gør
(de kører mod `dist/`).

## 6. Sådan køres regressionstestene + forbehold

Fra `lib/aevia-engine/` (kræver at `dist/` er bygget — den findes og virker):

```bash
node --test qa/regressions/*.test.mjs
```

Forventet status i dag: **14 filer, alle FEJLER** (én pr. bekræftet fund). Når et
fund er rettet i `src/`, genbyg `dist/` (`tsc`) og den tilhørende test skal skifte
til **bestået**.

**Forbehold:**
- Testene kører mod den **kompilerede** motor (`../../dist/src/index.js`), identisk
  med `src/`. De rører aldrig `src/`.
- **Optimal-zonerne er endnu ikke klinisk valideret** (se `evidence/`-mappen og
  `unvalidated_range`-issuet, der hænger på alle markører — "afventer Judit"). Fund
  om "forkert optimal" handler derfor om **logisk konsistens og datakontrakt**
  (fx: et estimat markeret `available:true` skal være finit; en farlig dublet må ikke
  kunne skjules; et `action`-flag må ikke modsige et fuldt optimalt panel) — **ikke**
  om hvad den klinisk korrekte tærskel *er*. De tærskel-afhængige fund (B3, B6, B7,
  B12) kræver Judits kalibrering for den endelige grænse; testene asserterer kun den
  rækkefølge-/finitheds-/konsistens-invariant der gælder uanset tærsklen.

## 7. Filoversigt (`qa/regressions/`)

| Testfil | Fund | Sværhedsgrad |
|---|---|---|
| `bioage-non-finite-available-true.test.mjs` | B1 | Høj |
| `bioage-under18-estimat.test.mjs` | B2 | Høj |
| `hypothyroid-falsk-action.test.mjs` | B3 | Høj |
| `moenstre-falsk-positiv-rask.test.mjs` | B4 | Høj |
| `moenstre-lister-optimale-markoerer.test.mjs` | B5 | Høj |
| `klassificering-supprimeret-tsh-optimal.test.mjs` | B6 | Høj |
| `insulinresistens-falsk-flag.test.mjs` | B7 + B11 | Høj |
| `klassificering-dubleret-markoer-id.test.mjs` | B8 | Middel |
| `koen-fallback-male.test.mjs` | B9 | Middel |
| `klassificering-higherisbetter-aaben-overgraense.test.mjs` | B10 | Middel |
| `bioage-confidence-interval-graense.test.mjs` | B12 | Lav |
| `bioage-tom-markoerliste.test.mjs` | B13 | Lav |
| `ugyldig-alder-ageband.test.mjs` | B14 | Lav |
| `pii-cpr-i-vaerdi.test.mjs` | B15 | Lav |
