# Lipoprotein(a) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `lpa` · **Enhed:** nmol/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 85 |
| Aevia optimal-zone | 0 | 75 |
| Motorens udledte ref. (±25%, erstattes) | åben | 93.75 |


## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Plasma lipoprotein(a), klinisk biokemi)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/plasma-lipoprotein-a/
- **Verbatim citat:** "Det gennemsnitlige niveau af plasma lipoprotein(a) i den danske befolkning ligger omkring 20 nmol/L. [...] 85-104 nmol/L: Diskret forhøjet [...] Niveauer >105 nmol/L betragtes som værende en risikofaktor for hjerte-kar-sygdom."
- **Bekræftet ved gen-fetch:** Ja. Siden blev gen-hentet 2026-06-17. Enheden er nmol/L (ingen konvertering nødvendig). Det danske gennemsnit (~20 nmol/L) er bekræftet ordret. Hele risikokategori-trappen blev bekræftet: 85-104 nmol/L = "Diskret forhøjet"; 105-199 = "Let til moderat forhøjet" (RR 1,3-1,7×); 200-299 = "Moderat forhøjet" (RR 1,8-2,2×); 300-399 = "Betydeligt forhøjet" (RR 2,3-2,8×); >400 = "Svært forhøjet"; >650 = ekstremt forhøjet (RR 4-6×). Citatet ">105 nmol/L betragtes som værende en risikofaktor for hjerte-kar-sygdom" er bekræftet ordret. Yderligere handlepunkter på siden: >300 nmol/L → forebyggende behandling overvejes; >400 nmol/L → henvisning til lipidklinik og familiescreening.
- **Confidence:** medium — Kilden er en primær dansk klinisk reference (Lægehåndbogen) og er fuldt bekræftet ved gen-fetch i korrekt enhed. Confidence holdes dog på medium (ikke high), fordi Lp(a) IKKE har et formelt referenceinterval med nedre/øvre normalgrænse; kilden angiver kun risiko-baserede beslutningsgrænser. Valget af 85 nmol/L som "øvre normalgrænse" er derfor en fortolkning ("normal vs. forhøjet"), idet den laveste forhøjet-kategori starter ved 85. Den sekundære lab-kilde (Sygehus Sønderjylland PDF) kunne ikke parses (binær/korrupt) til verbatim-bekræftelse, men den primære kilde er tilstrækkelig.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel i de danske beslutningsgrænser. Lp(a) er overvejende genetisk bestemt og ændrer sig stort set ikke med alder eller livsstil; de danske grænser (85/105 nmol/L mv.) anvendes ens for begge køn og for voksne generelt.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Både kilde og motor bruger nmol/L. (Bemærk: i litteraturen ses ofte mg/dL — der findes ingen eksakt, universel omregningsfaktor mellem nmol/L og mg/dL, så bland aldrig enhederne. ESC/EAS' tommelfingertal ~75 nmol/L ≈ 30 mg/dL og ~125 nmol/L ≈ 50 mg/dL er omtrentlige.)
- **Lp(a) har ikke et klassisk lab-referenceinterval:** Lægehåndbogen opererer med risiko-baserede beslutningsgrænser, ikke en normalfordelt nedre/øvre normalgrænse. Derfor er `clinicalLow`/refLow sat til null (åben): lavere Lp(a) er bedre, og der findes ingen klinisk meningsfuld nedre grænse (dansk gennemsnit ~20 nmol/L).
- **To relevante beslutningsgrænser i kilden:** (a) 85 nmol/L = start på "Diskret forhøjet" — valgt her som foreslået øvre normalgrænse (refHigh), så værdier under 85 ikke flagges som forhøjede; og (b) >105 nmol/L = egentlig risikofaktor for hjerte-kar-sygdom.
- **Aevias optimal-zone (0-75) er bevidst strammere end den danske flag-grænse (85):** ESC/EAS angiver et risikokontinuum, hvor risikoen stiger fra ~75 nmol/L (30 mg/dL) og kraftigt over ~125 nmol/L (50 mg/dL). Dette understøtter et optimalt mål på 0-75 nmol/L som strammere end den danske kliniske flag-grænse på 85. Motorens kliniske logik (src/clinical.ts) flagger desuden Lp(a) >75 som arvelig risikofaktor og bruger >125 som skærpende kriterium — konsistent med ESC/EAS-kontinuummet.
- **Til beslutning:** Judit bør tage stilling til, om den offentligt viste "referencegrænse" skal være 85 (dansk flag-grænse, "normal vs. forhøjet") eller 75 (Aevias strammere optimale mål), så patientkommunikation og flag-logik er konsistente.
