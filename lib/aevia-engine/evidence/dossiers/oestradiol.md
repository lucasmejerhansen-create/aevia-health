# Østradiol — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `oestradiol` · **Enhed:** pmol/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 40 | 2400 |
| Aevia optimal-zone | 60 | 150 |
| Motorens udledte ref. (±25%, erstattes) | 45 | 187.5 |
| Kvinde-optimal (motor) | 100 | 600 |

> Det foreslåede tosidede interval (40–2400 pmol/L) dækker hele det fertile kvinde-spænd og er klinisk misvisende, hvis det bruges alene. Se "Køns-/alders-specifikt" og "Noter & forbehold". Det bør i praksis erstattes af kønsopdelte (og for kvinder cyklusopdelte) intervaller.

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Estradiol/Østradiol) — Statens Serum Institut-metode; korroboreret af Region Sjælland LMV (DokID=214772) og Aalborg UH / Aarhus UH
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/estradiol-oestradiol/
- **Verbatim citat:** "Kvinder: Postmenstruelt: < 0,04 - 0,4 nmol/L; Midtcyklus: 0,24 - 2,4 nmol/L; Luteralfase: 0,25 - 1,2 nmol/L; Efter menopausen: < 0,04 - 0,08 nmol/L. Mænd: 20 - 70 år: 0,048 - 0,17 nmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk bekræfter S-Estradiol total: Kvinder postmenstruelt <0,04–0,4 nmol/L, midtcyklus 0,24–2,4 nmol/L, lutealfase 0,25–1,2 nmol/L, efter menopausen <0,04–0,08 nmol/L; Mænd 20–70 år 0,048–0,17 nmol/L. Børn er også angivet (piger 8–11 år <0,04–0,25; piger 11–13 år <0,04–1,4 nmol/L; drenge 8–11 år <0,04–0,088; drenge 11–13 år <0,04–0,13 nmol/L). Værdierne står i **nmol/L**, IKKE pmol/L → enhedskonvertering ×1000 er nødvendig (unitMatches=false bekræftet). Korroboration: Aalborg UH ændrede pr. 2023 enhed fra nmol/L til pmol/L og angiver (søgeresultat) kvinder fertil follikulær ca. 50–850, midtcyklus ca. 150–1450, luteal ca. 80–1250 pmol/L samt postmenopausalt <75 pmol/L — samme størrelsesorden som den konverterede sundhed.dk-værdi.
- **Confidence:** medium — Primærkilden (sundhed.dk/SSI) er bekræftet verbatim ved gen-fetch, og flere danske kilder er enige om størrelsesordenen. MEN: (1) enheden i kilden er nmol/L og kræver ×1000-konvertering til markørens pmol/L; (2) de eksakte grænser varierer mellem laboratorier (metodeafhængigt — Region Sjælland og Aalborg UH afviger fra SSI i de præcise tal); (3) ét tosidet interval kan ikke fange den køns- og cyklusspecifikke virkelighed. Derfor ikke "high".

## Køns-/alders-specifikt
Referencen er **stærkt kønsspecifik** og — for kvinder i fertil alder — **cyklusafhængig**. Værdier nedenfor er omregnet fra kildens nmol/L ved ×1000.

**Kvinder, fertil alder (cyklusafhængigt):**
- Follikulær / postmenstruel: <40 – 400 pmol/L
- Midtcyklus (ovulatorisk peak): 240 – 2400 pmol/L
- Lutealfase: 250 – 1200 pmol/L
- Samlet fertilt spænd ≈ 40 – 2400 pmol/L (højest midtcyklus). Region Sjælland LMV angiver lidt højere nedre grænser (follikulær ~90–900, midtcyklus ~100–2400, luteal ~90–<1200 pmol/L).

**Kvinder efter menopause (uden hormonbehandling):** <40 – 80 pmol/L (Region Sjælland: <100 pmol/L; med hormonbehandling <500 pmol/L).

**Mænd 20–70 år:** 48 – 170 pmol/L.

**Piger, prepubertet:** <200 pmol/L (Region Sjælland: <0,2 nmol/L = <200 pmol/L). Sundhed.dk angiver desuden pubertetsafhængige intervaller for piger 8–13 år (op til ~1400 pmol/L ved 11–13 år).

## Noter & forbehold til Judit
- **ENHEDSKONVERTERING (kritisk):** Kilden angiver alle værdier i **nmol/L**; markørens enhed er **pmol/L**. 1 nmol/L = 1000 pmol/L → alle grænser er multipliceret med 1000. unitMatches=false. Kontrollér konverteringen før godkendelse.
- **Ét tosidet interval er klinisk misvisende for denne analyt.** clinicalLow/clinicalHigh (40–2400 pmol/L) er sat til det fulde kliniske spænd for kvinder i fertil alder, fordi det er det dominerende referencevindue, men referencen er både køns- og cyklusspecifik. Anbefaling: erstat den nuværende generelle optimal-zone (60–150 pmol/L) og den udledte ±25%-reference (45–187,5 pmol/L) med kønsopdelte intervaller: mænd 48–170 pmol/L; kvinder fertil 40–2400 pmol/L (cyklusafhængigt); postmenopausalt <80–100 pmol/L.
- **Aevias kvinde-optimal (100–600 pmol/L)** er rimeligt forankret i fertil follikulær-/lutealfase, men fanger ikke midtcyklus-peak (op til 2400) eller postmenopausalt niveau (<80–100). Bør betragtes som faseafhængig, ikke som ét fast vindue.
- **Uenighed mellem kilder (forventet, metodeafhængig):** SSI (sundhed.dk), Region Sjælland LMV og Aalborg UH/Aarhus UH er enige om størrelsesordenen, men de eksakte grænser afviger (fx postmenopausal øvre grænse <75–100 pmol/L; nedre fertile grænser 40 vs. 90 pmol/L). Vælg ét laboratoriums sæt for konsistens, eller dokumentér metoden.
- **Kilder:** (1) sundhed.dk Lægehåndbogen (SSI-metode, primær, bekræftet verbatim). (2) Region Sjælland LMV (lmv.regionsjaelland.dk, DokID=214772). (3) Aalborg UH faginfo 2023 (enhedsskift nmol/L→pmol/L, ensretning med Aarhus UH).
- **Status:** Forslag — kræver Judits kliniske validering, særligt mht. (a) valg af enkelt vs. kønsopdelt repræsentation i motoren, (b) håndtering af cyklusafhængighed, og (c) hvilket laboratoriums grænser der skal være kanoniske.
