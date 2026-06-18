# Blodtryk (diastolisk) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `blodtrykdia` · **Enhed:** mmHg · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 90 |
| Aevia optimal-zone | 65 | 80 |
| Motorens udledte ref. (±25%, erstattes) | åben | 100 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Hypertension) + Patienthåndbogen (Forhøjet blodtryk), baseret på ESC og Dansk Cardiologisk Selskabs NBV
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/hjerte-kar/tilstande-og-sygdomme/oevrige-sygdomme/hypertension/
- **Verbatim citat:** "Hypertension foreligger når hjemme- eller dagtidsdelen af døgnblodtrykket er på eller over 135 mmHg systolisk og/eller 85 mmHg diastolisk." · Hjemmeblodtryk: "Højt normalt hjemmeblodtryk DBT 80-84", "Grad 1 hypertension: Diastolisk hjemmeblodtryk 85-94 mmHg", "Grad 2: 95-104 mmHg", "Grad 3: 105 mmHg eller derover". · Patienthåndbogen: "Blodtrykket er forhøjet, når det ved gentagne målinger hos lægen er 140/90 eller derover. Hvis man måler blodtrykket derhjemme, er det forhøjet, når det ved gentagne målinger ligger på 135/85 eller derover."
- **Bekræftet ved gen-fetch:** Ja. WebFetch af Lægehåndbogen-URL'en bekræftede den diastoliske klassifikation i mmHg: højt-normalt hjemmeblodtryk 80-84, grad 1 hypertension 85-94, grad 2 95-104, grad 3 ≥105, samt diagnosegrænsen ≥85 mmHg diastolisk ved hjemme-/dagtidsmåling. WebSearch på Patienthåndbogen bekræftede konsultationsgrænsen 140/90 (hjemme 135/85). Enheden er mmHg overalt — ingen konvertering.
- **Confidence:** high — Værdierne står verbatim i to uafhængige danske sundhed.dk-kilder (faglig + borger), begge i mmHg, og stemmer overens med ESC/DCS-retningslinjer. Den eneste nuance er valg af øvre grænse (85 vs. 90, se noter).

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel i diagnosegrænserne — samme blodtryksklassifikation gælder voksne mænd og kvinder. Alder: hos meget gamle/skrøbelige patienter accepteres klinisk ofte lidt højere mål, men det er en behandlingsmæssig vurdering, ikke en ændret normalgrænse. Hos børn bruges helt andre, percentil-baserede grænser (ikke relevant for Aevias voksne målgruppe).

## Noter & forbehold til Judit
- **Dette er IKKE et lab-referenceinterval**, men en klinisk/fysiologisk blodtryksklassifikation. Der findes derfor ikke et klassisk DSKB/hospitalslab-interval — grænserne er diagnostiske tærskler, ikke et 2,5–97,5-percentil-referenceinterval.
- **Valg af refHigh (90 vs. 85):** Jeg har sat refHigh = 90 mmHg = konsultationsgrænsen (140/90) som matcher researcherens forslag og er den mest genkendelige grænse for brugere. BEMÆRK dog: hjemme-/døgnmåling har en lavere grænse (≥85 mmHg = hypertension). Da Aevias måling i klinik typisk er en konsultationsmåling, er 90 mmHg forsvarligt. Hvis Aevia bruger hjemme-/24-timers-data eller vil være mere konservativ, bør refHigh strammes til **85 mmHg**. Judit bør tage stilling til, hvilken måletype Aevia rapporterer på.
- **Motorens nuværende øvre grænse (100 mmHg) er for høj** ift. både hjemme- (85) og konsultationsgrænsen (90) — 100 mmHg svarer til grad 2 hypertension og bør erstattes. Forslaget (90) retter dette.
- **Nedre ende (refLow = åben):** Retningen er lavere-er-bedre, så nedre grænse eskalerer ikke i motoren. Klinisk regnes diastolisk <60 mmHg ofte som lav/hypotension, men der findes ingen skarp dansk nedre lab-grænse — enden er reelt blød/næsten åben. Hvis Aevia ønsker en hypotensions-advarsel separat, kan ~60 mmHg bruges som blød nedre flag, men det hører ikke til den eskalerende referencegrænse.
- **Aevias optimal-zone (65–80 mmHg)** ligger godt inden for "normalt/optimalt" (<80 mmHg) og er klinisk konservativ og fornuftig. Den underbygger overgangen til "højt-normalt" ved 80.
