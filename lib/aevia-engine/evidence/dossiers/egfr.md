# eGFR — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `egfr` · **Enhed:** mL/min · **Kategori:** nyrer · **Type:** laboratorie-analyt
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 90 | åben |
| Aevia optimal-zone | 90 | 130 |
| Motorens udledte ref. (±25%, erstattes) | 67.5 | åben |

## Evidens
- **Kilde:** pro.medicin.dk (Nedsat nyrefunktion, GFR < 60 ml/min/1,73 m²) — bekræftet af sundhed.dk Lægehåndbogen (Glomerulær filtrationshastighed, eGFR) og Dansk Nefrologisk Selskab / DSKB-rekommandationer (KDIGO-stadieinddeling)
- **URL:** https://pro.medicin.dk/specielleemner/emner/300
- **Verbatim citat:** "Bemærk, at GFR i intervallet 60-89 ml/min/1,73 m² (stadium G2) beskrives som let nedsat, mens GFR > 90 ml/min/1,73 m² beskrives som normal nyrefunktion."
- **Bekræftet ved gen-fetch:** Ja. Siden blev hentet på ny og bekræftede KDIGO-stadieinddelingen verbatim: G1 (≥90, normal eller høj), G2 (60-89, let nedsat), G3a (45-59), G3b (30-44), G4 (15-29), G5 (<15). Enheden er gennemgående **ml/min/1,73 m²** (kropsoverflade-normaliseret). Kilden angiver desuden den kliniske handlingsgrænse: "I daglig klinisk praksis er der ikke behov for dosisreduktion af lægemidler ved GFR > 60 ml/min/1,73 m²." sundhed.dk Lægehåndbogen blev hentet selvstændigt og bekræftede enheden mL/min/1,73 m² samt at der ikke angives en numerisk øvre referencegrænse (kun stadieinddeling) — i tråd med at laboratorier rapporterer ">90".
- **Confidence:** high — Primærkilden (pro.medicin.dk) er bekræftet ved gen-fetch og understøttet af to uafhængige danske niveau-1/2-kilder (sundhed.dk Lægehåndbogen og DNS/KDIGO) med identisk grænse. Værdien (nedre grænse 90 for normal nyrefunktion) er entydig og klinisk plausibel for en voksen dansk befolkning. Enheds-notationen matcher ikke 1:1 (se forbehold), men talværdierne er identiske, så confidence forbliver high.

## Køns-/alders-specifikt
Ingen kønsspecifik grænse i den danske KDIGO-baserede stadieinddeling — kønsforskelle i kreatinin er allerede indregnet i eGFR-formlen (CKD-EPI). **Aldersbemærkning til Judit:** eGFR falder fysiologisk med alderen (~0,5-1 mL/min/1,73 m² pr. år efter 40-års alderen), og en fast nedre grænse på 90 vil derfor klassificere mange raske ældre som "let nedsat" (G2). Nogle nyere europæiske arbejder (fx alders-tilpassede eGFR-tærskler) foreslår lavere normalgrænser hos ældre. KDIGO opererer dog fortsat med en aldersuafhængig grænse på 90, hvilket er det danske kliniske standpunkt.

## Noter & forbehold til Judit
- **Intet klassisk to-sidet referenceinterval.** eGFR har i dansk praksis ikke et to-sidet lab-interval, men en KDIGO-baseret stadieinddeling med kliniske handlingsgrænser. Normal nyrefunktion (G1) = eGFR ≥90; let nedsat (G2) = 60-89; klinisk vigtig handlingsgrænse = <60 mL/min/1,73 m². Derfor: nedre grænse = 90, øvre grænse = åben (null).
- **ENHEDSBEMÆRKNING (unitMatches=false):** Markørenheden er angivet som "mL/min", men alle danske kilder bruger "mL/min/1,73 m²" (kropsoverflade-normaliseret). Talværdierne er identiske — eGFR er pr. definition BSA-normaliseret — så **ingen numerisk konvertering kræves**. Mismatchet er rent notationelt. Anbefaling: ret markørenheden til "mL/min/1,73 m²" for korrekthed.
- **Øvre grænse er åben med vilje.** Danske laboratorier (DNS/DSKB 2015-rekommandation) rapporterer eGFR som talværdi når <90 og som ">90" (eller "≥90") derover — dvs. der angives reelt ingen øvre talgrænse. refHigh = null er derfor korrekt for en højere-er-bedre-markør.
- **Aevias optimal-zone 90-130:** Nedre grænse (90) er klinisk forankret og konsistent med forslaget. Den **øvre grænse 130 er IKKE klinisk forankret** — laboratorier rapporterer blot ">90", og der findes ingen evidensbaseret "for høj" eGFR-grænse i normalområdet. Bemærk dog: meget høje eGFR-værdier kan i nogle sammenhænge afspejle hyperfiltration (fx tidlig diabetisk nyrepåvirkning) eller lav muskelmasse, men dette er ikke en standard reference-grænse. Overvej om optimal-zonens øvre ende (130) skal fjernes eller markeres som ikke-klinisk.
- **Motorens udledte ±25%-reference (67,5-åben)** har for lav nedre grænse (67,5 falder midt i G2 "let nedsat") og erstattes med den kliniske grænse 90.
- **Konsistens på tværs af kilder:** Grænserne er identiske i sundhed.dk Lægehåndbogen, pro.medicin.dk og Dansk Nefrologisk Selskab — ingen kilde-uenighed konstateret.
