# Erytrocytter — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `erytrocytter` · **Enhed:** ×10¹²/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 3.9 | 5.7 |
| Aevia optimal-zone | 4.5 | 5.7 |
| Motorens udledte ref. (±25%, erstattes) | 3.375 | 7.125 |
| Kvinde-optimal (motor) | 3.9 | 5.2 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk Biokemi, blodprøver: Erytrocytter)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/erytrocytter/
- **Verbatim citat:** "Kvinder: 3,9 - 5,2 x 10¹²/L; Mænd: 4,3 - 5,7 x 10¹²/L"
- **Bekræftet ved gen-fetch:** Ja. Lægehåndbogen blev gen-fetchet og angiver voksen-intervallerne kvinder 3,9–5,2 og mænd 4,3–5,7 ×10¹²/L, samt alders-/børneintervaller (0–14 dage: 3,1–5,5; 14–30 dage: 2,3–5,0; 1–2 mdr: 2,9–4,7; 2 mdr–18 år: 3,3–6,0 ×10¹²/L). Værdierne blev desuden krydstjekket mod sundhed.dk Patienthåndbogen (borger-siden), som angiver præcis de samme voksen-tal (kvinder 3,9–5,2; mænd 4,3–5,7 ×10¹²/L). To uafhængige sundhed.dk-sider er enige.
- **Confidence:** high — Værdien står ordret på den citerede primærkilde, enheden matcher markørens enhed (×10¹²/L) uden konvertering, intervallet er klinisk plausibelt for en voksen dansk befolkning, og to uafhængige sundhed.dk-sider angiver identiske tal.

## Køns-/alders-specifikt
Referencen er kønsspecifik:
- **Kvinder:** 3,9–5,2 ×10¹²/L
- **Mænd:** 4,3–5,7 ×10¹²/L

Det foreslåede samlede voksen-interval (3,9–5,7) er konstrueret som union på tværs af køn: nedre ende = kvinde-nedre (3,9), øvre ende = mande-øvre (5,7).

Alders-/børneintervaller (fra Lægehåndbogen, til orientering):
- 0–14 dage: 3,1–5,5 ×10¹²/L
- 14–30 dage: 2,3–5,0 ×10¹²/L
- 1–2 måneder: 2,9–4,7 ×10¹²/L
- 2 måneder–18 år: 3,3–6,0 ×10¹²/L

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Kildens enhed (×10¹²/L) er identisk med markørens enhed — ingen omregning foretaget.
- **Kønsspecifik reference vs. samlet interval:** Det foreslåede JSON-interval (3,9–5,7) er det samlede voksen-interval på tværs af køn. Hvis motoren understøtter kønsspecifik klassificering, bør kvinde-intervallet (3,9–5,2) og mande-intervallet (4,3–5,7) overvejes separat, da et samlet interval kan underklassificere fx en mand i den lave ende (4,0 er normalt for kvinder, men under mande-nedre 4,3) og omvendt.
- **Optimal-zone vs. reference:** Aevias nuværende generelle optimal-zone (4,5–5,7) ligger i den øvre/mandlige del af referencen, mens kvinde-optimal (3,9–5,2) er identisk med kvinde-referenceintervallet. Bør gennemgås så optimal-zonerne er kønsbevidste.
- **Motorens ±25%-reference er for bred:** Den udledte reference (3,375–7,125) er for bred i begge ender ift. det faktiske danske referenceinterval (3,9–5,7) og bør erstattes.
- **Kilde-enighed:** Ingen uenighed fundet mellem de to konsulterede sundhed.dk-sider; tallene er identiske.
