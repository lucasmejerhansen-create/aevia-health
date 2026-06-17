# GGT — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `ggt` · **Enhed:** U/L · **Kategori:** lever · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 115 |
| Aevia optimal-zone | 10 | 40 |
| Motorens udledte ref. (±25%, erstattes) | åben | 50 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Gamma-Glutamyltransferase (GGT)), bekræftet af Bornholms Hospital Laboratorievejledning (NPU19657)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/gamma-glutamyltransferase-ggt/
- **Verbatim citat:** "Mænd: 18 - 40 år: 10–80 U/L; ≥ 40 år: 15-115 U/L. Kvinder: 18 - 40 år: 10–45 U/L; ≥ 40 år: 10-75 U/L. Børn og unge: < 6 måneder: 10-130 U/L; 6 måneder til 18 år: 10-45 U/L"
- **Bekræftet ved gen-fetch:** Ja. To uafhængige WebFetch-kald mod sundhed.dk Lægehåndbogen bekræftede ordret de samme intervaller: mænd ≥40 år "15-115 U/L", kvinder ≥40 år "10-75 U/L", samt at samtlige værdier på siden angives i U/L (ingen µkat/L). Kilden noterer selv: "Der kan være forskelle i de angivne intervaller fra laboratorium til laboratorium, især afhængigt af de anvendte målemetoder."
- **Confidence:** high — Værdien står ordret på den angivne URL i korrekt enhed (U/L = motorens enhed, ingen konvertering). To uafhængige danske kilder (sundhed.dk Lægehåndbogen og Bornholms Hospital/Region Sjælland, NPU19657) er fuldstændig enige om identiske intervaller. Klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Stærkt køns- og aldersafhængigt.
- **Mænd 18-40 år:** 10-80 U/L
- **Mænd ≥40 år:** 15-115 U/L
- **Kvinder 18-40 år:** 10-45 U/L
- **Kvinder ≥40 år:** 10-75 U/L
- **Børn/unge (ikke relevant for Aevia, voksenklinik):** <6 mdr.: 10-130 U/L; 6 mdr.-18 år: 10-45 U/L

Mænd har markant højere øvre grænse end kvinder. For motorens øvre eskaleringsgrænse (lavere-er-bedre) bør der ideelt bruges køns-/alderssegmenterede grænser; den bredeste voksne øvre grænse er 115 U/L (mænd ≥40 år), mens den laveste er 45 U/L (kvinder 18-40 år).

## Noter & forbehold til Judit
- **Sammensat interval, ikke ét enkelt:** Den foreslåede refHigh = 115 U/L er den **højeste** voksne øvre grænse (mænd ≥40 år) og repræsenterer en konservativ, ikke-falsk-positiv fast grænse, der ikke er strammere end nogen voksen klinisk reference. Bemærk dog: for en 18-40-årig kvinde er klinisk øvre grænse kun 45 U/L — en fast grænse på 115 vil ikke fange en mildt forhøjet GGT hos hende. **Anbefaling:** segmentér ideelt øvre grænse efter køn og alder (45/75/80/115 U/L).
- **Motorens nuværende udledte grænse (50 U/L) er for lav** sammenlignet med de fleste kliniske øvre grænser (75-115 U/L for de fleste voksne) — den vil over-flagge raske mænd. En fast øvre grænse bør mindst ramme det relevante kliniske niveau.
- **Aevia optimal-zone (10-40 U/L)** ligger under den kliniske nedre del af alle voksne intervaller og er strammere end klinisk reference. Rimeligt som longevity/optimal-zone, men afviger bevidst fra klinisk normalområde — bekræft med Judit at denne distinktion er ønsket.
- **Enhed:** Kilden angiver værdier direkte i U/L — ingen konvertering nødvendig (unitMatches = true).
- **Populationsforbehold:** Kilden bemærker at personer af afrikansk afstamning og svært overvægtige typisk har ca. dobbelt så høje værdier — relevant ved fortolkning af forhøjede resultater.
- **Børneværdier** medtaget i citatet for fuldstændighed, men ikke brugt i refLow/refHigh, da Aevia er en voksenklinik.
