# Hæmoglobin — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `haemoglobin` · **Enhed:** mmol/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 7.3 | 10.5 |
| Aevia optimal-zone | 8.5 | 10.5 |
| Motorens udledte ref. (±25%, erstattes) | 6.375 | 13.125 |
| Kvinde-optimal (motor) | 7.3 | 9.5 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Hæmoglobin)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/haemoglobin/
- **Verbatim citat:** "Voksne ≥ 18 år — Kvinder: 7,3-9,5 mmol/L — Mand: 8,3-10,5 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk-URL'en (17-06-2026) bekræftede de eksakte værdier for voksne ≥18 år: Kvinder 7,3–9,5 mmol/L og Mænd 8,3–10,5 mmol/L. Alle værdier er angivet i mmol/L direkte på siden — ingen enhedskonvertering nødvendig. Selvstændig web-søgning bekræftede de identiske intervaller hos en sekundær dansk kilde (Netdoktor / patient­håndbogen samt klinisk vejledning), som eksplicit bemærker at intervaller kan variere afhængigt af det lokale laboratoriums analysemetode. Kilderne er indbyrdes enige.
- **Confidence:** high — Primær autoritativ dansk kilde (sundhed.dk Lægehåndbogen) gen-bekræftet ord-for-ord, korrekt enhed (mmol/L) som matcher markøren, sekundær dansk kilde i overensstemmelse, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Referencen er kønsspecifik:
- **Kvinder (≥18 år):** 7,3–9,5 mmol/L
- **Mænd (≥18 år):** 8,3–10,5 mmol/L

Den lavere reference for kvinder skyldes primært menstruation/graviditet i den fertile alder; forskellen aftager efter menopausen. Gravide har normalt let lavere niveau (ca. 7,0–9,1 mmol/L) pga. fysiologisk hæmodilution.

Den kønsneutrale foreslåede reference (7,3–10,5 mmol/L) er konstrueret som den samlede kliniske spændvidde på tværs af køn: laveste nedre grænse (kvinder: 7,3) til højeste øvre grænse (mænd: 10,5). Hvis motoren understøtter kønsspecifikke intervaller, bør mand-/kvinde-værdierne anvendes separat i stedet (kvinder 7,3–9,5; mænd 8,3–10,5).

## Noter & forbehold til Judit
- **Enhed matcher — ingen konvertering.** Markøren og kilden er begge i mmol/L. (Til orientering: internationale kilder angiver ofte hæmoglobin i g/dL; 1 mmol/L ≈ 1,61 g/dL. Dette er ikke relevant for det foreslåede interval, men nævnes hvis EN-/eksterne data sammenholdes.)
- **Tosidet retning — begge ender fra det danske interval.** Da motorens retning er tosidet, sættes refLow = 7,3 og refHigh = 10,5. Den foreslåede reference erstatter motorens nuværende udledte ±25%-reference (6,375–13,125 mmol/L), som er klinisk for bred — særligt en øvre grænse på 13,125 mmol/L ville maskere relevant erytrocytose/polycytæmi.
- **Kønsspecifikt valg:** Hvis motoren kun kan håndtere ét kønsneutralt interval, kan 7,3–10,5 mmol/L bruges. Det maskerer dog den kliniske kønsforskel — en mand på 7,5 mmol/L er anæmisk (under mande­underkanten 8,3), men ville fremstå "normal" i et kønsneutralt interval. Anbefaling til Judit: overvej om kønsspecifikke intervaller bør aktiveres for denne markør.
- **Aevia optimal-zoner vs. klinisk reference:** Aevias kvinde-optimal (7,3–9,5) er identisk med kvindereferencen. Mande-optimal-zonen (8,5–10,5) ligger tæt på, men starter lidt højere end den kliniske mande­underkant (8,3) — en mand mellem 8,3 og 8,5 vil være klinisk normal, men under Aevias optimal-zone. Bør afklares med Judit, om dette er tilsigtet.
- **Lav hæmoglobin (anæmi)** er klinisk den vigtigste afvigelse i en longevity-kontekst og bør altid følges op (jernstatus, ferritin, B12/folat). Høj hæmoglobin kan skyldes dehydrering, rygning, søvnapnø eller egentlig polycytæmi.
- **Laboratorievariation:** sundhed.dk / kilderne anfører eksplicit at referenceintervaller kan variere marginalt mellem laboratorier afhængigt af analysemetode og referencepopulation.
