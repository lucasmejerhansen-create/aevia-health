# Trombocytter — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `trombocytter` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 145 | 390 |
| Aevia optimal-zone | 150 | 350 |
| Motorens udledte ref. (±25%, erstattes) | 112.5 | 437.5 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, blodprøver: Trombocytter)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/trombocytter/
- **Verbatim citat:** "Voksne ≥ 18 år: Mænd: 145 - 350 x 10⁹/L; Kvinder: 165 - 390 x 10⁹/L"
- **Bekræftet ved gen-fetch:** Ja. Lægehåndbogen blev gen-fetchet og angiver voksen-intervallerne (≥18 år) mænd 145–350 ×10⁹/L og kvinder 165–390 ×10⁹/L. Tallene blev krydstjekket mod sundhed.dk Patienthåndbogen (borger-siden, B-Trombocytter/blodplader, opdateret 19-02-2024), som angiver mænd 145–350 og kvinder 165–400 mia/L. De to sider er enige om mændenes interval (145–350) og om kvindernes nedre grænse (165); de er let uenige om kvindernes øvre grænse (Lægehåndbogen 390 vs. Patienthåndbogen 400).
- **Confidence:** high — Værdien står ordret på den citerede primærkilde (Lægehåndbogen), enheden matcher markørens enhed (×10⁹/L) uden konvertering, intervallet er klinisk plausibelt for en voksen dansk befolkning, og to uafhængige sundhed.dk-sider er enige om mændenes interval samt kvindernes nedre grænse. Den lille uenighed gælder kun kvindernes øvre grænse (390 vs. 400) og ændrer ikke størrelsesordenen.

## Køns-/alders-specifikt
Referencen er kønsspecifik (voksne ≥18 år):
- **Mænd:** 145–350 ×10⁹/L
- **Kvinder:** 165–390 ×10⁹/L (Lægehåndbogen) / 165–400 ×10⁹/L (Patienthåndbogen)

Det foreslåede samlede voksen-interval (145–390) er konstrueret som union på tværs af køn: nedre ende = mande-nedre (145), øvre ende = kvinde-øvre iflg. Lægehåndbogen (390). Hvis det bredeste kvinde-interval ønskes, kan øvre ende sættes til 400 (Patienthåndbogen).

Børne-/ungeintervaller (til orientering) er langt bredere end voksen-intervallet — fx op til 135–620 ×10⁹/L for aldersgruppen 1 md.–2 år. Aevias voksen-reference bør ikke anvendes på pædiatriske prøver.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Kildens enhed (×10⁹/L) er identisk med markørens enhed. Patienthåndbogen bruger betegnelsen "mia/L" (milliarder pr. liter), som talmæssigt er identisk med ×10⁹/L — ingen omregning foretaget.
- **Uenige kilder (kvindernes øvre grænse):** Lægehåndbogen angiver kvinder 165–390, mens Patienthåndbogen angiver 165–400. Det foreslåede øvre punkt (390) følger den citerede primærkilde (Lægehåndbogen). Judit bør beslutte, om øvre grænse skal være 390 (Lægehåndbogen) eller 400 (Patienthåndbogen) — eller om der ønskes en kønsspecifik klassificering.
- **Kønsspecifik reference vs. samlet interval:** Det foreslåede JSON-interval (145–390) er det samlede voksen-interval på tværs af køn. Hvis motoren understøtter kønsspecifik klassificering, bør mande-intervallet (145–350) og kvinde-intervallet (165–390/400) overvejes separat. Et samlet interval kan fejlklassificere: fx er en kvinde med 150 ×10⁹/L under kvinde-nedre (165), men ligger inden for det samlede interval; og en mand med 380 ×10⁹/L er over mande-øvre (350), men inden for det samlede interval.
- **Optimal-zone vs. reference:** Aevias nuværende optimal-zone (150–350) ligger inden for det danske referenceinterval (145–390) og er klinisk rimelig. Optimal-zonens øvre grænse (350) svarer til mande-øvre referencegrænse; bør gennemgås for kønsbevidsthed.
- **Motorens ±25%-reference er upræcis:** Den udledte reference (112,5–437,5) er for bred i bunden (under den danske nedre grænse 145) og for høj i toppen (over den danske øvre grænse 390/400) ift. det faktiske kliniske interval og bør erstattes.
- **Pædiatri:** Børne-/ungeintervaller er markant bredere; voksen-referencen må ikke anvendes på pædiatriske prøver.
