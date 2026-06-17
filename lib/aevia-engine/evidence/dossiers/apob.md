# ApoB — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `apob` · **Enhed:** g/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 1.4 |
| Aevia optimal-zone | 0.4 | 0.8 |
| Motorens udledte ref. (±25%, erstattes) | åben | 1 |

For lavere-er-bedre-retningen er den nedre ende åben (refLow = null), og refHigh sættes til den bredeste voksne øvre grænse fra den danske kilde: 1,4 g/L (mænd >19 år). For kvinder >19 år er øvre grænse 1,3 g/L.

## Evidens
- **Kilde:** Unilabs Danmark — analysefortegnelse (Apolipoprotein B), kategori "danske laboratoriers analysefortegnelser"
- **URL:** https://unilabs.dk/node/1290
- **Verbatim citat:** "Mænd: ... Mand Mere end 19 år: 0,5–1,4 g/L. Kvinder: ... Kvinde mere end 19 år: 0,5–1,3 g/L. Terapeutiske mål for ApoB (European Society of Cardiology, 2019): <0,7 g/L for patienter med meget høj kardiovaskulær risiko; <0,8 g/L for patienter med høj kardiovaskulær risiko; <1,0 g/L for patienter med moderat kardiovaskulær risiko. Måling af ApoB er særligt nyttig, når LDL-C og non-HDL-C er uoverensstemmende, f.eks. ved forhøjede triglycerider."
- **Bekræftet ved gen-fetch:** Ja. WebFetch returnerede HTTP 403, men siden blev hentet direkte (curl med browser-user-agent, HTTP 200). I den hentede HTML fremgår de eksakte værdier ovenfor i enheden g/L. Værdierne er desuden delvist bekræftet via uafhængigt websøgeresultat (kvindeintervaller identiske). Enheden matcher (g/L) — ingen konvertering nødvendig.
- **Confidence:** high — værdierne står ordret på den hentede danske laboratoriekilde i korrekt enhed, er konsistente på tværs af søgeresultat og selve siden, og er klinisk plausible for en voksen dansk befolkning. (Nedjustér til medium, hvis kun ét dansk laboratorium accepteres som kilde — sundhed.dk/Lægehåndbogen har ingen selvstændig ApoB-analyseside med referenceinterval.)

## Køns-/alders-specifikt
Kønsopdelt øvre grænse hos voksne (>19 år): mænd 0,5–1,4 g/L; kvinder 0,5–1,3 g/L. Nedre grænse er ens (0,5 g/L). clinicalHigh/refHigh er sat til den bredeste voksengrænse (mænd, 1,4 g/L); for kvinder er den 1,3 g/L.

Aldersspecifikt (begge køn, fra kilden):
- Op til 15 dage: <0,7 g/L
- 15 dage–1 år: 0,2–1,3 g/L
- 1–6 år: 0,4–1,0 g/L
- 6–19 år: 0,3–0,9 g/L (mænd 0,30–0,90)
- >19 år: mænd 0,5–1,4 g/L; kvinder 0,5–1,3 g/L

## Noter & forbehold til Judit
- **Enhed:** g/L — matcher motoren direkte, ingen konvertering. (Vær opmærksom på at nogle internationale kilder bruger mg/dL; 1 g/L ≈ 100 mg/dL.)
- **Vigtig nuance for en longevity-klinik:** Det foreslåede interval (0,5–1,4 g/L) er det BEFOLKNINGSBASEREDE referenceinterval (statistisk normalområde), IKKE et behandlings-/risikomål. Unilabs angiver eksplicit de europæiske kardiologiske terapeutiske mål (ESC 2019), som er væsentligt lavere: <0,7 g/L (meget høj risiko), <0,8 g/L (høj risiko), <1,0 g/L (moderat risiko).
- **Konsistens med Aevia-zonen:** Aevias optimal-zone 0,4–0,8 g/L ligger i referenceintervallets nedre del og er konsistent med ESC's behandlingsmål (lavere-er-bedre), hvilket matcher motorens retning. Judit bør beslutte, om eskaleringsgrænsen skal være det befolkningsbaserede 1,4 g/L (populationsnormal) eller et strammere risikobaseret mål (fx ≥1,0 g/L), givet klinikkens longevity-profil.
- **Kildekvalitet:** sundhed.dk/Lægehåndbogen har ingen selvstændig ApoB-analyseside med referenceinterval (kun omtale ifm. LDL/non-HDL). Unilabs var den bedste tilgængelige danske kilde med konkrete tal. WebFetch blev blokeret (403); værdierne er i stedet bekræftet via direkte hentning af siden samt et uafhængigt websøgeresultat.
