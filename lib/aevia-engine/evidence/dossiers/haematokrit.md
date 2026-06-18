# Hæmatokrit (EVF) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `haematokrit` · **Enhed:** % · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 40 | 50 |
| Aevia optimal-zone | 40 | 50 |
| Motorens udledte ref. (±25%, erstattes) | 30 | 62.5 |
| Kvinde-optimal (motor) | 36 | 46 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, blodprøver: Erytrocytter, vol.fr. (EVF))
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/erytrocytter-vol-fr-evf/
- **Verbatim citat:** "Voksne ≥18 år — Mænd: 0,40 - 0,50, Kvinder: 0,35 - 0,46" (gravide: "0,31 - 0,42")
- **Bekræftet ved gen-fetch:** Ja. Lægehåndbogen blev gen-fetchet (17-06-2026) og angiver for voksne ≥18 år: Mænd 0,40–0,50, Kvinder 0,35–0,46 og Gravide 0,31–0,42 (volumenfraktion). Siden angiver desuden børne-/aldersintervaller (navlesnorsblod 0,48–0,56; 0–2 uger 0,33–0,59; 2–4 uger 0,27–0,50; 4–8 uger 0,25–0,42; 8 uger–12 år 0,28–0,42; 12–18 år 0,32–0,47). Værdierne blev krydstjekket mod sundhed.dk Patienthåndbogen (borger-siden: https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/b-erythrocytter-volumenfraktion-haematokrit/), som angiver præcis de samme voksen-tal (Mænd 0,40–0,50; Kvinder 0,35–0,46). To uafhængige sundhed.dk-sider er enige.
- **Confidence:** high — Værdien står ordret på den citerede primærkilde (top af kilde-hierarkiet: sundhed.dk/Lægehåndbogen), enheden er entydig (volumenfraktion → % via ×100), intervallet er klinisk plausibelt for en voksen dansk befolkning, og to uafhængige sundhed.dk-sider angiver identiske tal.

## Enhedskonvertering
Kilden angiver værdierne som **volumenfraktion** (enhedsløs fraktion), fx 0,40 = 40 %. Markørens enhed er **%**. Konvertering: fraktion × 100:
- Mænd: 0,40 → 40 % og 0,50 → 50 %
- Kvinder: 0,35 → 35 % og 0,46 → 46 %
- Gravide: 0,31 → 31 % og 0,42 → 42 %

## Køns-/alders-specifikt
Referencen er **kønsspecifik**:
- **Mænd (≥18 år):** 40–50 % (0,40–0,50)
- **Kvinder (≥18 år):** 35–46 % (0,35–0,46)
- **Gravide:** 31–42 % (0,31–0,42) — fysiologisk hæmodilution sænker EVF i graviditeten.

Børne-/aldersintervaller (fra Lægehåndbogen, omregnet til %, til orientering):
- Navlesnorsblod: 48–56 %
- 0–2 uger: 33–59 %
- 2–4 uger: 27–50 %
- 4–8 uger: 25–42 %
- 8 uger–12 år: 28–42 %
- 12–18 år: 32–47 %

Den foreslåede reference (40–50 %) er **mande-intervallet**. Det matcher Aevias generelle optimal-zone (40–50 %). Hvis motoren understøtter kønsspecifik klassificering, bør kvinde-intervallet (35–46 %) anvendes separat for kvinder.

## Noter & forbehold til Judit
- **Det rapporterede forslag = mande-intervallet.** clinicalLow/clinicalHigh (40–50 %) er hentet fra mande-referencen og er sammenfaldende med Aevias optimal-zone. For kvinder er den kliniske reference 35–46 %.
- **Kvinde-optimal er marginalt snævrere i bunden:** Aevias kvinde-optimal (36–46) starter ét procentpoint over den kliniske kvinde-underkant (35). En kvinde med EVF 35 % er klinisk normal (kvinde-reference 35–46), men ville falde lige under Aevias kvinde-optimal (36). Bør afklares med Judit, om dette er tilsigtet.
- **Tosidet retning — begge ender fra det danske interval.** Da motorens retning er tosidet, sættes refLow = 40 og refHigh = 50 (mande-baseret forslag). Forslaget erstatter motorens udledte ±25%-reference (30–62,5 %), som er klinisk for bred — særligt en øvre grænse på 62,5 % ville maskere relevant erytrocytose/polycytæmi, og en nedre grænse på 30 % ville maskere anæmi.
- **Kønsspecifikt valg:** Hvis motoren kun kan håndtere ét kønsneutralt interval, maskerer 40–50 % de fleste kvinder (kvinde-reference 35–46 starter under 40). En kvinde med EVF 37 % er klinisk normal, men ville fremstå "lav" i et kønsneutralt mande-interval. Anbefaling til Judit: overvej om kønsspecifikke intervaller bør aktiveres for denne markør.
- **EVF følger hæmoglobin/erytrocytter:** Hæmatokrit er tæt korreleret med hæmoglobin og erytrocyttal. Høj EVF kan skyldes dehydrering (falsk forhøjet), rygning, søvnapnø, ophold i højde eller egentlig polycytæmi. Lav EVF ses ved anæmi, blødning og overhydrering. Bør fortolkes sammen med de øvrige blodstatus-markører.
- **Laboratorievariation:** Patienthåndbogen anfører eksplicit: "Der kan være alders- og kønsvariation og nogle gange også forskel mellem laboratoriernes analysemetoder." Lægehåndbogen bemærker tilsvarende, at der kan være (mindre) forskelle i de angivne intervaller fra laboratorium til laboratorium.
- **Kilde-enighed:** Ingen uenighed fundet mellem de to konsulterede sundhed.dk-sider; voksen-tallene er identiske.
