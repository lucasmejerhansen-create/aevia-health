# SHBG — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `shbg` · **Enhed:** nmol/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 13 | 150 |
| Aevia optimal-zone | 20 | 55 |
| Motorens udledte ref. (±25%, erstattes) | 15 | 68.75 |
| Kvinde-optimal (motor) | 40 | 110 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk Biokemi — Seksualhormonbindende globulin (SHBG))
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/seksualhormonbindende-globulin-shbg/
- **Verbatim citat:** "Kvinder: 20 år - 40 år: 20 – 150 nmol/L; 40 år – 80 år: 15 – 120 nmol/L. Mænd: 20 år – 30 år: 13 - 54 nmol/L; 30 år – 40 år: 13 - 58 nmol/L; 40 år – 50 år: 15 – 66 nmol/L; 50 år – 60 år: 18 – 76 nmol/L; 60 år – 70 år: 22 – 88 nmol/L; 70 år – 80 år: 27 – 100 nmol/L; >80 år: 33 – 116 nmol/L. Referenceintervallet er afhængigt af analyseudstyr/analysemetode på den lokale biokemiske afdeling."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk-URL'en (17-06-2026) bekræftede de eksakte køns- og aldersopdelte værdier ord-for-ord. KVINDER: 20–40 år 20–150 nmol/L, 40–80 år 15–120 nmol/L. MÆND: 20–30 år 13–54, 30–40 år 13–58, 40–50 år 15–66, 50–60 år 18–76, 60–70 år 22–88, 70–80 år 27–100, >80 år 33–116 nmol/L. Gen-fetchet viste desuden barn-/ungdomsintervaller (0–7 dage 7,0–50; 7 dage–4 år 10–120; 4–20 år 15–180 nmol/L for begge køn) som ikke indgår i den voksne reference. Enheden er nmol/L på alle værdier — ingen konvertering nødvendig (unitMatches=true). Kildens eksplicitte forbehold "Referenceintervallet er afhængigt af analyseudstyr/analysemetode på den lokale biokemiske afdeling" blev ligeledes bekræftet.
- **Confidence:** high — Primær autoritativ dansk kilde (sundhed.dk Lægehåndbogen, øverst i kilde-hierarkiet) gen-bekræftet ord-for-ord, korrekt enhed (nmol/L), detaljerede køns- og aldersopdelte intervaller direkte i målenheden, og klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Referencen er stærkt køns- OG aldersspecifik.

- **Kvinder (voksne):**
  - 20–40 år: 20–150 nmol/L
  - 40–80 år: 15–120 nmol/L
- **Mænd (voksne) — stiger med alderen:**
  - 20–30 år: 13–54 nmol/L
  - 30–40 år: 13–58 nmol/L
  - 40–50 år: 15–66 nmol/L
  - 50–60 år: 18–76 nmol/L
  - 60–70 år: 22–88 nmol/L
  - 70–80 år: 27–100 nmol/L
  - >80 år: 33–116 nmol/L

Kvinder ligger generelt højere end mænd, hvilket understøtter Aevias højere kvinde-optimalzone (40–110 nmol/L). Den foreslåede kønsneutrale reference (13–150 nmol/L) er konstrueret som den samlede voksne kliniske spændvidde på tværs af køn: laveste nedre grænse (unge mænd 20–30 år: 13) til højeste øvre grænse (kvinder 20–40 år: 150). Hvis motoren understøtter kønsspecifikke intervaller, bør mand-/kvinde-værdierne (og evt. aldersbånd) anvendes separat i stedet for ét fælles interval.

## Noter & forbehold til Judit
- **Intet fast nationalt interval.** Lægehåndbogen anfører eksplicit at "Referenceintervallet er afhængigt af analyseudstyr/analysemetode på den lokale biokemiske afdeling" — dvs. tallene varierer mellem laboratorier/metoder. Det foreslåede 13–150 nmol/L er derfor en indikativ samlet voksen-spændvidde, ikke en metode-uafhængig sandhed.
- **Kønsneutralt interval maskerer reel kønsforskel.** For en kønsneutral voksen reference bør motoren ideelt bruge køns-/aldersspecifikke grænser. Ét fælles 13–150 nmol/L spænder fra unge mænds nedre grænse til kvinders øvre grænse og er meget bredt. Anbefaling: overvej at aktivere kønsspecifikke (og evt. aldersopdelte) intervaller for denne markør.
- **Aevias optimal-zoner.** Aevias nuværende kønsneutrale optimal-zone (20–55 nmol/L) ligger i den lavere ende og svarer omtrent til mænd 20–40 år. Kvinde-optimal (40–110 nmol/L) passer godt med kvinders højere niveauer. Motorens udledte ±25%-reference (15–68,75 nmol/L) undervurderer den øvre grænse betydeligt — særligt for kvinder (op til 150) og ældre mænd (op til 116) — og erstattes derfor af det foreslåede interval.
- **OCR-/transskriptionsnote.** Kilden skriver flere steder "nmo/L" (åbenlys trykfejl for nmol/L); enheden er utvetydigt nmol/L.
- **Sekundær kilde ikke bekræftet.** analysefortegnelsen.dk gav "Intet fundet" og kunne ikke anvendes som bekræftende sekundær kilde. Den foreslåede reference hviler derfor på den primære kilde (sundhed.dk Lægehåndbogen) alene — fortsat høj confidence, da kilden er øverst i hierarkiet og gen-bekræftet.
- **Populations-reference ≠ longevity-optimal.** Det foreslåede interval er et populations-referenceinterval (fravær af sygdom), ikke et optimal-interval. SHBG fortolkes typisk sammen med total testosteron til beregning af fri/biotilgængelig testosteron; meget lav SHBG ses bl.a. ved insulinresistens/metabolisk syndrom, og meget høj SHBG ved fx hypertyreose, østrogenpåvirkning og leversygdom.
