# Basofile — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `basofile` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 0.1 |
| Aevia optimal-zone | 0 | 0.1 |
| Motorens udledte ref. (±25%, erstattes) | åben | 0.125 |


## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen (B-Leukocytter, fraktionerede) — bekræftet af Bornholms Hospital Laboratorievejledning (analysefortegnelse, NPU/EPC00170)
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/b-leukocytter-fraktionerede/
- **Verbatim citat:** "Basofilocytter <0,10 mia/L"
- **Bekræftet ved gen-fetch:** Ja. sundhed.dk blev hentet og bekræftede under "Hvad er normalt?" den verbatim værdi "Basofilocytter <0,10 mia/L" (åben nedadtil, øvre grænse 0,10). Bornholms Hospital Laboratorievejledning (EPC00170) blev hentet uafhængigt og bekræftede for voksne "18 år - 125 år: 0,01 - 0,1" med enhed "× 10^9/L". To uafhængige danske kilder er enige om den kliniske øvre grænse 0,1 ×10⁹/L for voksne.
- **Confidence:** high — To uafhængige danske kilder (sundhed.dk Patienthåndbogen + hospitalslaboratorium) er enige om den øvre referencegrænse 0,1 ×10⁹/L. Enheden matcher markørens (×10⁹/L = mia/L), ingen konvertering. Værdien er klinisk plausibel for en voksen dansk befolkning og matcher Aevias nuværende optimal-zone (0–0,1).

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel — samme øvre grænse for både mænd og kvinder.

Alders-stratificeret iflg. hospitalslaboratorium (Bornholms Hospital, EPC00170), ×10⁹/L:
| Aldersgruppe | Interval |
|---|---|
| 0 d – 14 d | 0,01 – 0,5 |
| 14 d – 6 mdr | 0,01 – 0,3 |
| 6 mdr – 18 år | 0,01 – 0,1 |
| 18 – 125 år (voksne) | 0,01 – 0,1 |

Voksenværdien anvendes her.

## Noter & forbehold til Judit
- **Enhed:** Matcher markørens (×10⁹/L). Kilden bruger "mia/L" = ×10⁹/L — ingen konvertering nødvendig.
- **Åben nedre grænse (retning lavere-er-bedre):** sundhed.dk angiver intervallet som åbent nedadtil ("Basofilocytter <0,10 mia/L"), dvs. reelt åben–0,10. Bornholms Hospital angiver en nedre grænse på 0,01 ×10⁹/L; denne afspejler praktisk detektions-/tællegrænse snarere end en klinisk nedre alarmgrænse. Da basofile er "lavere-er-bedre", er clinicalLow sat til den effektive/åbne nedre grænse (refLow = null/åben) jf. sundhed.dk. Lave/ikke-målbare basofile er klinisk uden bekymring.
- **Øvre grænse:** clinicalHigh 0,1 ×10⁹/L er den robuste danske øvre referencegrænse, bekræftet af begge kilder, og matcher Aevias optimal-zone (0–0,1).
- **Motor-reference erstattes:** Aevias nuværende motor-reference (åben–0,125) er den brede ±25%-udledning fra optimal-zonen og er IKKE et klinisk referenceinterval. Anbefalet motor-reference: åben–0,1 ×10⁹/L (erstatter den udledte åben–0,125).
- **Sekundær kilde (URL):** Bornholms Hospital Laboratorievejledning — https://bohlab.dk/index.php/epc00170 (NPU/EPC00170, EDTA-blod, enhed "× 10^9/L").
- **Lavere-er-bedre retning:** Kun øvre ende udfyldes (refHigh=0.1); nedre ende er åben (refLow=null).
