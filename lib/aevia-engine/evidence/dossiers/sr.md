# Sænkning (SR/ESR) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `sr` · **Enhed:** mm/t · **Kategori:** inflammation · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 15 |
| Aevia optimal-zone | 0 | 10 |
| Motorens udledte ref. (±25%, erstattes) | åben | 12.5 |


## Evidens
- **Kilde:** sundhed.dk — Lægehåndbogen, Klinisk biokemi, Blodprøver: Sedimentationsreaktion (SR); understøttet af Patienthåndbogen
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/sedimentationsreaktion-sr/
- **Verbatim citat:** "Mænd – Under 50 år: 2 - 15 mm; 50 - 85 år: 2 - 20 mm; Over 85 år: 2 - 30 mm. Kvinder – Under 50 år: 2 - 20 mm; 50 - 85 år: 2 - 30 mm; Over 85 år: 2 - 42 mm."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede ordret de seks alders-/kønsopdelte intervaller (Mænd <50: 2-15; 50-85: 2-20; >85: 2-30 mm. Kvinder <50: 2-20; 50-85: 2-30; >85: 2-42 mm) samt den aldersjusterede formel for asymptomatiske over 50 (kvinder: (Alder+10)/2; mænd: Alder/2, fx 45 mm for 80-årig kvinde og 40 mm for 80-årig mand). Enheden er bekræftet som mm målt efter 1 times henstand: "SR er højden af den cellefrie plasmasøjle ... når den har stået i en time, målt i millimeter (mm)" — dvs. mm/t (mm/time). Kilden bemærker eksplicit at referenceintervaller kan variere mellem laboratorier afhængigt af metode og referencepopulation, og at gravide har stigende SR (op mod ~45 mm ugen efter fødslen).
- **Confidence:** high — Kilden er øverst i det danske kliniske kilde-hierarki (Lægehåndbogen, klinisk biokemi), enheden matcher (mm/t = mm efter 1 time, ingen konvertering), citatet er bekræftet ordret ved gen-fetch, og to uafhængige sundhed.dk-kilder (Lægehåndbogen + Patienthåndbogen) angiver identiske værdier.

## Køns-/alders-specifikt
Stærkt køns- og aldersafhængig markør. **Mænd:** under 50 år 2-15 mm/t · 50-85 år 2-20 mm/t · over 85 år 2-30 mm/t. **Kvinder:** under 50 år 2-20 mm/t · 50-85 år 2-30 mm/t · over 85 år 2-42 mm/t. SR stiger fysiologisk med alderen og er gennemgående højere hos kvinder. For asymptomatiske personer over 50 kan en alternativ øvre grænse anvendes: kvinder (Alder+10)/2, mænd Alder/2 (fx 45 mm hhv. 40 mm for 80-årige). **Graviditet:** SR stiger jævnt fra ca. 4. gestationsuge og topper ~45 mm ugen efter fødslen — det almindelige interval gælder ikke for gravide.

## Noter & forbehold til Judit
- **Enhed matcher** (mm/t = mm målt efter 1 times henstand) — ingen konvertering nødvendig. Bemærk at kilden skriver enheden som "mm" (efter 1 time), mens motoren bruger den eksplicitte notation "mm/t"; de er identiske.
- **Den foreslåede øvre grænse (15) er det laveste/strammeste interval i kilden** (mænd under 50 år). Det er bevidst valgt som et enkelt konservativt referenceloft, men det er en **forenkling**: for kvinder under 50 år er øvre normalgrænse allerede 20 mm/t, og for begge køn stiger normalgrænsen markant med alderen (op til 42 mm/t for kvinder over 85). **Til overvejelse for Judit:** om motoren bør anvende alders- og kønsdifferentierede grænser (evt. de aldersjusterede formler) frem for ét fast loft på 15 — ellers risikeres falsk-positive flag hos raske kvinder og ældre.
- **Optimal-zone konsistens:** Aevias optimal-zone 0-10 mm/t ligger inden for og under det kliniske referenceinterval (strammere end klinisk normal), hvilket er rimeligt og konsistent med "lavere-er-bedre" og et longevity-perspektiv. Den nedre grænse 0 er klinisk uproblematisk — lav SR er sjældent et selvstændigt problem.
- **Laboratorievariation:** Kilden bemærker eksplicit at referenceintervaller kan variere mellem laboratorier afhængigt af metode (fx Westergren vs. automatiserede metoder) og referencepopulation. Den endeligt anvendte grænse bør afstemmes med det/de laboratorier Aevia bruger.
- **Uspecifik markør:** SR er en uspecifik inflammationsmarkør og fortolkes typisk sammen med hs-CRP. Værd at overveje om Aevia-rapporten skal samtolke SR og CRP frem for at flagge SR isoleret.
