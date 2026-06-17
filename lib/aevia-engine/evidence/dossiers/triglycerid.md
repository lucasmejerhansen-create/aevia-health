# Triglycerider — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `triglycerid` · **Enhed:** mmol/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 2.6 |
| Aevia optimal-zone | 0.4 | 1 |
| Motorens udledte ref. (±25%, erstattes) | åben | 1.25 |


## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, blodprøver: Triglycerid) — primær dansk kilde, kilde-hierarki nr. 1
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/triglycerid/
- **Verbatim citat:** "P(fPt) Triglycerid: 0,45 – 2,6 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede ordret referenceintervallet "P(fPt) Triglycerid: 0,45 – 2,6 mmol/L" samt signalværdien "Alle voksne: Under 2,0 mmol/L". Enheden er mmol/L direkte (unitMatches=true, ingen konvertering). En uafhængig dansk kilde (Patienthåndbogen / Netdoktor via websøgning) corroborer 0,45–2,6 mmol/L for fastende voksne. Ingen uenighed mellem kilder fundet.
- **Confidence:** high — værdi og enhed bekræftet ordret i primær dansk kilde, corroboreret af sekundær dansk kilde, klinisk plausibelt for voksen dansk befolkning.

## Køns-/alders-specifikt
Ingen kønsopdeling angivet for voksne i Lægehåndbogen. Hos gravide stiger niveauet fysiologisk gennem graviditeten, og værdier over 4 mmol/L er ikke usædvanlige i 3. trimester — dette er et separat fysiologisk forhold og indgår ikke i det almindelige referenceinterval for ikke-gravide voksne.

## Noter & forbehold til Judit
- **Referenceinterval vs. signal-/aktionsværdi:** Lægehåndbogen angiver et statistisk referenceinterval på **0,45–2,6 mmol/L** OG et separat kardiovaskulært behandlingsmål/signalværdi **"Alle voksne: Under 2,0 mmol/L"**. Det foreslåede JSON-interval bruger referenceintervallets øvre grænse **2,6 mmol/L**. Overvej alternativt at sætte øvre grænse til **2,0 mmol/L**, hvis Aevia ønsker at klassificere efter den kardiovaskulære signalværdi frem for det rene statistiske normalområde. Dette er en bevidst klinisk beslutning, som Judit skal træffe.
- **Enhed:** Værdien er angivet direkte i mmol/L — ingen konvertering foretaget (unitMatches=true).
- **Fastende vs. ikke-fastende:** DSKB/dansk praksis anbefaler ikke-fastende lipidmåling som standard; ved triglycerid >4 mmol/L bør prøven gentages fastende. Referenceintervallet (P(fPt)) er knyttet til fastende måling.
- **Motorens udledte øvre grænse (1,25 mmol/L) er for stram:** Den ligger væsentligt under både referenceintervallets øvre ende (2,6) og signalværdien (2,0). Erstattes derfor af 2,6 mmol/L (eller 2,0 efter Judits valg).
- **Aevia optimal-zone (0,4–1 mmol/L)** ligger inden for og strammere end det kliniske referenceinterval — rimeligt for en longevity-optimal-zone, men er IKKE det kliniske referenceinterval og bør ikke forveksles med det.
- **Retning (lavere-er-bedre):** Kun øvre grænse eskalerer → refLow = null (åben), refHigh = 2,6 mmol/L.
