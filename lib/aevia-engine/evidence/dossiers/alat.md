# ALAT (ALT) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `alat` · **Enhed:** U/L · **Kategori:** lever · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 70 |
| Aevia optimal-zone | 10 | 35 |
| Motorens udledte ref. (±25%, erstattes) | åben | 43.75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (klinisk biokemi, blodprøver: ALAT)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/alat/
- **Verbatim citat:** "Mænd 16 år og ældre: 10 - 70 U/L
Kvinder 16 år og ældre: 10 - 45 U/L"
- **Bekræftet ved gen-fetch:** Ja. Jeg gen-hentede kilden og bekræftede ordret: "Mænd 16 år og ældre: 10 - 70 U/L" og "Kvinder 16 år og ældre: 10 - 45 U/L". Hele tabellen er i U/L — ingen enhedskonvertering nødvendig (unitMatches=true). Yderligere alders-/graviditetsintervaller blev også bekræftet (se nedenfor).
- **Confidence:** high — Værdierne står ordret i den øverste danske kilde (Lægehåndbogen), enheden matcher motorens U/L, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Kønsspecifikt referenceinterval for voksne (≥16 år): **Mænd 10–70 U/L, Kvinder 10–45 U/L.** Den foreslåede refHigh (70) er sat til mændenes øvre grænse (den bredeste øvre). Bemærk at kvinders kliniske øvre normalgrænse er væsentligt lavere (45 U/L) — overvej en kønsdifferentieret tærskel i motoren.

Verificerede alders- og graviditetsintervaller fra samme kilde (alle i U/L):
- 0–1 måned: < 40 U/L
- 1 måned – 16 år: 5 – 45 U/L
- Gravide 3.–12. uge: < 30 U/L
- Gravide 13.–34. uge: 8 – 36 U/L
- Gravide 35.–41. uge / Partus / P+1 dag: 5 – 42 U/L
- P+2 dage: 8 – 58 U/L

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Kilden angiver værdierne direkte i U/L, som matcher motorens enhed.
- **Retning og kun-øvre-eskalering:** Da motorens retning er lavere-er-bedre, sættes refLow = null (åben) og refHigh = den danske kliniske øvre grænse. refHigh = 70 afspejler mændenes fulde kliniske øvre grænse. Lav ALAT er ikke klinisk bekymrende, så den nedre kliniske grænse (10) udelades bevidst fra det eskalerende interval.
- **Kønsforskel — beslutningspunkt:** Kvinders øvre normalgrænse er 45 U/L vs. mænds 70 U/L. Det nuværende forslag bruger den brede mande-grænse (70) for begge køn. Overvej at indføre en kønsdifferentieret tærskel, så kvinder vurderes mod 45 U/L. **Judit beslutter.**
- **Longevity-stramning:** Aevias optimal-zone (10–35) er strammere end det kliniske referenceinterval (op til 70/45). Dette er i tråd med en longevity-tilgang, hvor lavere transaminaser ses som gunstigt. Klassificering mellem 35 og 70 vil falde i "over optimal, men inden for klinisk reference".
- **Tosidet i kilden, ensidet i motoren:** Referenceintervallet er reelt tosidet i kilden (10 som nedre grænse), men motorens lavere-er-bedre-retning gør kun den øvre grænse relevant for eskalering.
