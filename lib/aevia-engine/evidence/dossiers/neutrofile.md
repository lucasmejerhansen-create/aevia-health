# Neutrofile — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `neutrofile` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 2.0 | 8.8 |
| Aevia optimal-zone | 2 | 6 |
| Motorens udledte ref. (±25%, erstattes) | 1.5 | 7.5 |


## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Neutrofile leukocytter)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/neutrofile-leukocytter/
- **Verbatim citat:** "Voksne mænd og kvinder over 18 år: 2,0 - 8,8 x 10⁹/L"
- **Bekræftet ved gen-fetch:** Ja. Siden blev hentet to gange uafhængigt. Begge fetches bekræftede voksen-intervallet 2,0–8,8 ×10⁹/L (18+ år, ingen kønsforskel). Anden fetch bekræftede desuden den alders-stratificerede tabel for børn/unge samt laboratorie-forbeholdet ("Der kan være forskelle i de angivne intervaller fra laboratorium til laboratorium").
- **Confidence:** high — Højest prioriterede danske kilde (sundhed.dk Lægehåndbogen, klinisk biokemi). Enheden matcher markørens (×10⁹/L), ingen konvertering nødvendig. Værdien er klinisk plausibel for en voksen dansk befolkning og bekræftet ved to separate fetches.

## Køns-/alders-specifikt
Ingen kønsforskel for voksne — samme interval 2,0–8,8 ×10⁹/L for både mænd og kvinder (18+ år).

Alders-stratificeret (børn/unge), ×10⁹/L:
| Aldersgruppe | Interval |
|---|---|
| 1–14 dage | 1,60 – 6,75 |
| 15 dage – <1 måned | 1,18 – 5,45 |
| 1–2 måneder | 0,83 – 4,68 |
| 2–6 måneder | 0,97 – 7,20 |
| 6 måneder – <15 år | 1,60 – 6,70 |
| 15–19 år | 2,00 – 9,60 |

Graviditet/fødsel (forhøjede intervaller), ×10⁹/L:
- Under svangerskabet: 3,9 – 11,8
- Under fødslen: 4,8 – 23,4
- 1–2 dage efter fødslen: 5,3 – 18,1

## Noter & forbehold til Judit
- **Enhed:** Matcher markørens (×10⁹/L) — ingen konvertering nødvendig.
- **Kilde-forbehold (fra sundhed.dk selv):** "Der kan være forskelle i de angivne intervaller fra laboratorium til laboratorium." Danske hospitalslaboratorier kan derfor have lidt afvigende grænser (typisk omkring 2–7,5 til 2–8,8). Det foreslåede 2,0–8,8 er Lægehåndbogens angivelse.
- **Motor-reference erstattes:** Aevias nuværende motor-reference (1,5–7,5) er den brede ±25%-udledning fra optimal-zonen og er IKKE et klinisk referenceinterval. Det egentlige danske kliniske referenceinterval for voksne er 2,0–8,8 ×10⁹/L og bør erstatte den udledte værdi.
- **Optimal-zone vs. reference:** Aevias optimal-zone (2–6) er smallere end det kliniske referenceinterval (2,0–8,8); dette er forventeligt (optimal ≠ blot "normalt"). Bekræft at den smallere optimal-zone er klinisk tilsigtet.
- **Tosidet retning:** Begge ender er udfyldt fra det danske interval (refLow=2.0, refHigh=8.8).
