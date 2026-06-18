# Fedtprocent — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `fedtprocent` · **Enhed:** % · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 25 |
| Aevia optimal-zone | 12 | 20 |
| Motorens udledte ref. (±25%, erstattes) | åben | 25 |
| Kvinde-optimal (motor) | 18 | 28 |

## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen (Overvægt — hvad er det?) som primær/autoritativ dansk kilde + motionsplan.dk (alders- og kønsopdelte fedtprocent-normer, baseret på Gallagher et al., New York Obesity Research Center / WHO-NIH, samt ACE-klassifikation)
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/sundhedsoplysning/overvaegt/overvaegt-hvad-er-det/
- **Verbatim citat:** "Der findes ingen international grænse for fedtprocent ved overvægt og fedtprocenten kan være svær at beregne." (sundhed.dk, gen-bekræftet). Alders-/kønsopdelte normbånd (motionsplan.dk, "Perfekt"/sund-kategori, gen-bekræftet verbatim): **Mænd** 20-39 år "8 - 19 %", 40-59 år "11 - 22 %", 60+ år "13 - 25 %". **Kvinder** 20-39 år "21 - 33 %", 40-59 år "23 - 35 %", 60+ år "24 - 36 %".
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk bekræftede ordret, at der ikke findes nogen international grænse for fedtprocent ved overvægt, at bioimpedans-/kropsanalysevægte er upålidelige og unøjagtige, og at overvægt klinisk vurderes via BMI + taljemål (mænd ≥94/≥102 cm; kvinder ≥80/≥88 cm), IKKE via fedtprocent. Gen-fetch af motionsplan.dk bekræftede de seks alders-/kønsbånd ordret som angivet i citatet ovenfor; siden tilskriver tallene Gallagher et al. (NY Obesity Research Center) / WHO-NIH og refererer ACE-klassifikation separat. Enheden er % i alle kilder — ingen konvertering nødvendig.
- **Confidence:** low — fordi (1) fedtprocent IKKE har noget egentligt klinisk laboratorie-referenceinterval; den autoritative danske kilde (sundhed.dk) anfører eksplicit, at en international grænse ikke findes, og at målemetoden er usikker; (2) de konkrete tal stammer fra sekundære danske sundheds-/motionssider, der republicerer amerikanske ACE-/WHO-NIH-afledte normer — ikke en dansk klinisk retningslinje; (3) kilderne er indbyrdes uenige om grænserne (fx mænds øvre sunde grænse 24-25 % vs. iform/andre, og kvinders øvre sunde grænse 33-36 %).

## Køns-/alders-specifikt
Stærkt KØNS- OG ALDERSAFHÆNGIG — ét enkelt voksen-interval er en betydelig forenkling.

**Kønsgab:** Kvinder har fysiologisk ~10 procentpoint højere fedtprocent end mænd (essentielt fedt knyttet til kønshormoner/reproduktion). Hele kvindernes normbånd ligger derfor ca. 10 pp over mændenes.

**Aldersopdelt sund/"Perfekt"-bånd (verbatim, motionsplan.dk):**
- Mænd 20-39 år: 8 - 19 % · 40-59 år: 11 - 22 % · 60+ år: 13 - 25 %
- Kvinder 20-39 år: 21 - 33 % · 40-59 år: 23 - 35 % · 60+ år: 24 - 36 %

refHigh = 25 svarer til MÆNDENES øvre sunde yderpunkt (60+ år). For kvinder løber det fulde sunde bånd op til ca. 36 %. Aevias kønsspecifikke optimal-zoner (mænd 12-20 % / kvinder 18-28 %) ligger bevidst LAVERE end den brede sunde befolkningsnorm — konsistent med en longevity/"lavere-er-bedre"-tilgang, men det er et MÅL, ikke et lab-referenceinterval. Hvis motoren kan differentiere efter køn, bør kvindernes øvre grænse hæves (mod ~36 % som befolkningsnorm, eller bevares lavere bevidst som eksplicit markeret longevity-mål).

## Noter & forbehold til Judit
- **IKKE en blodprøve / IKKE et klinisk lab-referenceinterval:** Fedtprocent er et fysiologisk/antropometrisk mål uden NPU-analyse og uden formelt dansk myndigheds-/lab-referenceinterval (sundhed.dk/Lægehåndbogen, DSKB, Sundhedsstyrelsen). sundhed.dk (øverst i kildehierarkiet) anfører eksplicit, at "Der findes ingen international grænse for fedtprocent ved overvægt", og at bioimpedansvægte er upålidelige. Confidence er derfor low trods god kilde-konsistens.
- **refHigh = 25 = MÆNDENES øvre sunde yderpunkt:** Den udledte ±25 %-reference (åben-25 %) er rimelig for mænd. For kvinder er den brede sunde øvre grænse ca. 36 % — overvej kønsdifferentiering i motoren, eller marker kvinde-zonen eksplicit som longevity-mål (ikke referenceinterval).
- **refLow = null (åben):** Retningen er lavere-er-bedre, så kun den øvre grænse skal eskalere. Bemærk dog, at meget lav fedtprocent (under essentielt fedt: ~2-5 % mænd / ~10-13 % kvinder) er sundhedsskadelig — en helt åben nedre side er en forenkling. Hvis Aevia ønsker at flagge for-lav fedtprocent (særligt hos kvinder, ift. hormonel/reproduktiv funktion), bør en blød nedre advarselsgrænse overvejes klinisk, selvom hovedretningen forbliver lavere-er-bedre.
- **Klinisk overvægtsvurdering bruger BMI + taljemål, ikke fedtprocent:** WHO BMI >25 (overvægt) / >30 (fedme); taljemål mænd ≥94/≥102 cm, kvinder ≥80/≥88 cm. Fedtprocent kan kommunikeres som supplerende mål, men bør ikke fremstilles som en autoritativ dansk klinisk tærskel.
- **Enhed:** % i alle kilder, matcher motoren — ingen konvertering nødvendig.
- **Kilde-type-forbehold:** De konkrete tal er sekundære (danske motions-/sundhedssites, der republicerer ACE-/WHO-NIH-afledte amerikanske normer), ikke en dansk klinisk retningslinje, og forskellige kilder angiver let varierende grænser. Judit bør afgøre, om fedtprocent skal markeres som et ikke-lab/livsstils-mål med tilsvarende forsigtig kommunikation, og om kvinde-grænsen skal hæves eller bevares som bevidst longevity-mål.
