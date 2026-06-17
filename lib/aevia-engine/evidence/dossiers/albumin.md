# Albumin — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `albumin` · **Enhed:** g/L · **Kategori:** lever · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 34 | 48 |
| Aevia optimal-zone | 40 | 48 |
| Motorens udledte ref. (±25%, erstattes) | 30 | 60 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Blodprøver, Albumin)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/albumin/
- **Verbatim citat:** "18-39 år: 36-48 g/L | 40-69 år: 36-45 g/L | > 70 år: 34-45 g/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af kilde-URL'en bekræfter de tre aldersopdelte intervaller ordret (18-39 år: 36-48 g/L; 40-69 år: 36-45 g/L; >70 år: 34-45 g/L), i enheden g/L. Kilden angiver desuden ingen kønsforskel, men advarer om laboratorie-til-laboratorie-variation og oplyser SI-omregning g/L × 15,05 = µmol/L. Uafhængigt cross-check mod hospitalslaboratorium (Bornholms Hospital, bohlab.dk, NPU19673) gav nøjagtig samme intervaller (18-39 år: 36-48; 40-69 år: 36-45; 70-125 år: 34-45 g/L) — ingen uenighed mellem kilderne.
- **Confidence:** high — Primær dansk autoritativ kilde (sundhed.dk Lægehåndbogen) bekræftet ordret ved gen-fetch, enheden er allerede g/L (ingen konvertering), og et uafhængigt dansk hospitalslaboratorium bekræfter samme værdier.

## Køns-/alders-specifikt
Lægehåndbogen angiver INGEN kønsopdeling for voksne. Der er derimod aldersopdeling:
- 18-39 år: 36-48 g/L
- 40-69 år: 36-45 g/L
- >70 år: 34-45 g/L

Det foreslåede interval 34-48 g/L er den samlede ydergrænse på tværs af voksne aldersgrupper: nederste grænse 34 g/L (>70 år) og øverste grænse 48 g/L (18-39 år). For den typiske aktive voksne (18-39 år) er intervallet snævrere: 36-48 g/L — overvej alders-justering i motoren.

Øvrige aldersgrupper (til orientering): Nyfødte ligger 10-20% lavere end voksne; børn op til 14 år ligger 10-20% højere end voksne; unge 14-20 år har samme værdier som voksne.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering nødvendig:** kilden angiver direkte g/L (unitMatches=true). SI-omregning hvis nødvendigt: g/L × 15,05 = µmol/L (og µmol/L / 15,05 = g/L).
- **Laboratorie-variation:** kilden advarer eksplicit — "Der kan være betydelige forskelle i de angivne intervaller fra laboratorium til laboratorium" afhængigt af målemetode. Det endelige interval bør afstemmes med det laboratorium Aevia faktisk anvender.
- **Aldersafhængighed:** intervallet snævrer ind og forskydes nedad med alderen. Det foreslåede 34-48 g/L er en konservativ ydergrænse-sammenslutning; en alders-stratificeret model ville være mere præcis.
- **Optimal-zone:** Aevias nuværende optimal-zone 40-48 g/L ligger i den øvre del af det kliniske referenceinterval og er konsistent med kilden.
- **Cross-check:** Bekræftet mod et uafhængigt dansk hospitalslaboratorium (Bornholms Hospital, bohlab.dk NPU19673) med nøjagtig samme værdier. Ingen kildekonflikt fundet.
- **Tosidet markør:** lave albuminværdier kan indikere lever-/nyresygdom, malnutrition eller inflammation; meget høje værdier ses typisk ved dehydrering — begge ender er klinisk relevante, så referencen har begge grænser.
