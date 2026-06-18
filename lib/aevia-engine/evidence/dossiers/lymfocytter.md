# Lymfocytter — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `lymfocytter` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 1.3 | 3.5 |
| Aevia optimal-zone | 1 | 3.5 |
| Motorens udledte ref. (±25%, erstattes) | 0.75 | 4.375 |


## Evidens
- **Kilde:** Region Sjælland Laboratoriemedicinske Vejledninger (Klinisk Biokemi) — "Leukocyttype; antalk.(liste);B", baseret på DSKB's referenceintervaller
- **URL:** http://dok.regionsjaelland.dk/view.aspx?DokID=229741
- **Verbatim citat:** "Lymfocytter > 18 år 1,3-3,5 X 10^9/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af URL'en bekræftede citatet ordret: voksenintervallet (>18 år) står som 1,3-3,5 X 10⁹/L. Også de aldersstratificerede børneintervaller blev bekræftet ordret (0-<2 mdr 1,8-9,1; 2-<6 mdr 2,1-9,0; 6 mdr-<6 år 1,8-7,9; 6-<13 år 1,3-4,1; 13-<19 år 1,2-3,6 ×10⁹/L). Enheden er ×10⁹/L direkte i kilden — ingen konvertering nødvendig.
- **Confidence:** high — Værdien er bekræftet verbatim ved gen-fetch fra en dansk hospitalslaboratorie-vejledning forankret i DSKB's referenceintervaller, enheden matcher direkte, og intervallet er klinisk plausibelt og understøttet af et stort dansk populationsstudie.

## Køns-/alders-specifikt
Ingen kønsforskel angivet for voksne. Aldersafhængige intervaller for børn (fra DSKB's Børnereferenceintervaller, gengivet i samme kilde):
- 0-<2 mdr: 1,8-9,1 ×10⁹/L
- 2 mdr-<6 mdr: 2,1-9,0 ×10⁹/L
- 6 mdr-<6 år: 1,8-7,9 ×10⁹/L
- 6-<13 år: 1,3-4,1 ×10⁹/L
- 13-<19 år: 1,2-3,6 ×10⁹/L

Voksenintervallet (>18 år) er 1,3-3,5 ×10⁹/L. Aevia-motoren retter sig mod en voksen population, så det foreslåede interval bruger voksenværdierne.

## Noter & forbehold til Judit
- **Enhed:** Matcher direkte (×10⁹/L) — ingen konvertering nødvendig.
- **Kildeforankring:** Region Sjælland Klinisk Biokemi baserer eksplicit børneintervallerne på DSKB's Børnereferenceintervaller, dvs. forankret i danske/DSKB-standarder.
- **Krydsvalidering:** Voksenintervallet 1,3-3,5 ×10⁹/L understøttes indirekte af et stort dansk populationsstudie (Copenhagen General Population Study / lymfopeni-studiet, n≈98.344), der angiver et lignende interval (~1,1-3,7 ×10⁹/L). Ingen klinisk relevant uenighed mellem kilder.
- **Stramning af reference:** Det foreslåede 1,3-3,5 er klart strammere end motorens nuværende udledte reference (0,75-4,375 ×10⁹/L, ±25%) og bør erstatte den.
- **Sammenfald med optimal-zone:** Aevias nuværende optimal-zone (1-3,5) ligger meget tæt på det kliniske referenceinterval; bemærk at den foreslåede nedre referencegrænse (1,3) er en smule strammere end optimal-zonens nedre grænse (1,0). Judit bør overveje, om optimal-zonens nedre grænse skal justeres for konsistens.
- **Andre kilder forsøgt:** sundhed.dk Lægehåndbogen (Hæmatologiske kvantiteter), analysefortegnelsen.dk (AUH, NPU02636) og RH Labportal blev forsøgt, men disse sider indlæser værdierne dynamisk og returnerede ingen tal via WebFetch. Region Sjælland-vejledningen gav det fulde interval verbatim og blev derfor anvendt som primær kilde.
