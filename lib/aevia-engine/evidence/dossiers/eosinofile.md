# Eosinofile — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `eosinofile` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 0.5 |
| Aevia optimal-zone | 0 | 0.4 |
| Motorens udledte ref. (±25%, erstattes) | åben | 0.5 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk Biokemi, blodprøver: Eosinofile leukocytter) — primær. Sekundært bekræftet ved Bornholms Hospital Laboratorievejledning (Eosinofilocytter (mikr.);B).
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/eosinofile-leukocytter/
- **Verbatim citat:** "Voksne og unge over 15 år: < 0,5 x 10⁹/L" (sundhed.dk Lægehåndbogen). Bornholms Hospital (sekundær): "18-125 år: 0,01 - 0,5 ×10⁹/L".
- **Bekræftet ved gen-fetch:** Ja. Begge kilder blev gen-fetchet. Lægehåndbogen angiver ordret "Voksne og unge over 15 år: < 0,5 x 10⁹/L" og noterer, at eosinofile typisk udgør 2-3 % af de samlede leukocytter, samt at referenceintervaller kan variere lidt mellem laboratorier. Bornholms Hospital angiver ordret voksenintervallet "0,01 - 0,5" ×10⁹/L (18-125 år) samt en finere aldersinddeling (0-2 mdr: 0,01-0,9; 2-6 mdr: 0,01-0,5; 6 mdr-14 år: 0,05-0,7; 14-18 år: 0,03-0,6). Enheden (×10⁹/L) matcher markørens enhed direkte — ingen konvertering.
- **Confidence:** high — Den klinisk afgørende øvre grænse (< 0,5 ×10⁹/L) står ordret på primærkilden (kilde-hierarki niveau 1) og bekræftes uafhængigt af et hospitalslaboratorium (Bornholms Hospital). Enheden matcher uden konvertering, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Ingen kønsspecifikke forskelle angives i kilderne — samme øvre grænse (< 0,5 ×10⁹/L) for mænd og kvinder over 15 år.

Aldersafhængighed (fra kilderne, til orientering — ikke relevant for Aevias voksenpopulation):
- **sundhed.dk:** Børn under 2 måneder har højere øvre grænse (< 0,9 ×10⁹/L); børn mellem 2 måneder og 15 år samt voksne/unge over 15 år: < 0,5 ×10⁹/L.
- **Bornholms Hospital:** finere inddeling — 0-2 mdr: 0,01-0,9; 2-6 mdr: 0,01-0,5; 6 mdr-14 år: 0,05-0,7; 14-18 år: 0,03-0,6; 18-125 år: 0,01-0,5 ×10⁹/L.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Kildernes enhed (×10⁹/L) er identisk med markørens enhed — ingen omregning. Kilderne bruger dansk decimalkomma (0,5 / 0,01).
- **Åben nedadtil (retning = lavere-er-bedre):** Primærkilden sundhed.dk angiver kun en øvre grænse (< 0,5), dvs. reelt åben i den nedre ende — eosinofile kan klinisk være nær 0 hos raske, og en lav værdi er ikke patologisk i denne longevity-kontekst. refLow er derfor sat til `null` (åben). Bornholms Hospital angiver en formel nedre grænse på 0,01 ×10⁹/L; denne er IKKE medtaget som refLow, fordi motorens retning kun lader den øvre grænse eskalere — en formel nedre grænse ville ikke ændre klassifikationen og kunne fejlagtigt udløse en "lav"-flagning. Bevares her som clinicalLow til Judits orientering.
- **Kilderne er enige:** Begge danske kilder angiver øvre grænse 0,5 ×10⁹/L for voksne — ingen uenighed at flage. Dette bekræfter også motorens nuværende udledte øvre grænse på 0,5.
- **Optimal-zone vs. reference:** Aevias optimal-zone (0-0,4) ligger inden for og er strammere end det kliniske referenceinterval (øvre 0,5) — konsistent med en longevity-orienteret "optimal er snævrere end normal"-tilgang. Bør bekræftes af Judit.
- **Laboratorievariation:** Lægehåndbogen noterer eksplicit, at referenceintervaller kan variere lidt mellem laboratorier; 0,5 ×10⁹/L er dog den fælles øvre grænse på tværs af de to citerede danske kilder og anvendes her som primær dansk reference.
