# Cystatin C — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `cystatinc` · **Enhed:** mg/L · **Kategori:** nyrer · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 1.16 |
| Aevia optimal-zone | 0.6 | 1 |
| Motorens udledte ref. (±25%, erstattes) | åben | 1.25 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Cystatin C, klinisk biokemi)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/cystatin-c/
- **Verbatim citat:** "Over 18 år: 0,61-1,16 mg/L"
- **Bekræftet ved gen-fetch:** Ja. Værdien blev verificeret ordret ved gen-fetch af kilden. Hele aldersopdelte tabel blev bekræftet i mg/L: 0-1 måned 1,49-2,85; 1-5 mdr. 1,01-1,92; 5 mdr-1 år 0,75-1,53; 1-2 år 0,74-1,22; 2-3 år 0,67-1,10; 3-10 år 0,64-1,10; Kvinder 10-18 år 0,61-1,16; Mænd 10-18 år 0,66-1,24; Over 18 år (begge køn) 0,61-1,16. Enheden er mg/L gennemgående — ingen konvertering nødvendig.
- **Confidence:** high — Kilden er på øverste niveau i kilde-hierarkiet (dansk klinisk biokemi). Intervallet stammer iflg. kilden fra høringsudgaven 2024 af rapporten om kronisk nyresygdom udarbejdet af Dansk Nefrologisk Selskab, Dansk Pædiatrisk Selskab og Dansk Selskab for Klinisk Biokemi (DSKB). Enhed matcher direkte. Voksenintervallet 0,61-1,16 mg/L er bredt accepteret i danske laboratorier.

## Køns-/alders-specifikt
For voksne (over 18 år) gælder ét fælles interval for begge køn: 0,61-1,16 mg/L. Der er ingen kønsspecifik forskel angivet for voksne. Intervallet er stærkt aldersafhængigt hos børn (spædbørn 0-1 måned: 1,49-2,85 mg/L), faldende med alderen. I aldersgruppen 10-18 år ses en mindre kønsforskel (kvinder 0,61-1,16; mænd 0,66-1,24 mg/L), men denne forsvinder i voksenintervallet.

## Noter & forbehold til Judit
- **Retning og JSON:** Markøren er lavere-er-bedre i motoren, så kun øvre grænse eskalerer. JSON-forslaget er derfor refLow = null (åben) og refHigh = 1.16. Den danske nedre grænse (0,61) er primært relevant som referencegrænse, ikke som eskaleringsgrænse, og udelades bevidst af det åbne nedre forslag.
- **Justering nedad:** Motorens nuværende udledte øvre grænse (1.25) ligger over den kliniske øvre grænse på 1,16. Forslaget strammer derfor øvre grænse til 1,16, hvilket flugter med den danske kliniske kilde. Aevias optimal-zone (0,6-1) ligger inden for/lidt under denne grænse og er konsistent.
- **Inter-kilde-variation (mindre uenighed):** En web-søgning fremviste enkeltvis en ældre/metode-specifik værdi på ca. 0,51-1,02 mg/L. Dette stammer ikke fra den autoritative aktuelle kilde og afspejler sandsynligvis en anden assay-kalibrering eller en tidligere rapportversion. Den autoritative Lægehåndbog-/2024-kilde giver konsistent 0,61-1,16 for voksne, og det er denne værdi forslaget bygger på. Cystatin C-værdier kan variere mellem assays/kalibratorer — Judit bør bekræfte, at intervallet matcher det/de laboratorier, Aevia anvender.
- **Klinisk plausibilitet:** Intervallet 0,61-1,16 mg/L er klinisk plausibelt for en voksen dansk befolkning og i overensstemmelse med internationale standardiserede (IFCC-kalibrerede) cystatin C-intervaller.
