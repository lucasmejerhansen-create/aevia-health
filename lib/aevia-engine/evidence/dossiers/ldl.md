# LDL-kolesterol — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `ldl` · **Enhed:** mmol/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 5.3 |
| Aevia optimal-zone | 1 | 2.6 |
| Motorens udledte ref. (±25%, erstattes) | åben | 3.25 |

## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen (Kolesterol, LDL) + Lægehåndbogen (LDL-kolesterol)
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/kolesterol-ldl/
- **Verbatim citat:** "18 - < 30 år: 1,2 - 4,3 mmol/L; 30 - < 50 år 1,4 - 4,7 mmol/L; 50 år og ældre: 2,0 - 5,3 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Patienthåndbogen bekræftede de aldersopdelte laboratorie-referenceintervaller ordret: 18-<30 år 1,2-4,3 mmol/L; 30-<50 år 1,4-4,7 mmol/L; 50+ år 2,0-5,3 mmol/L. Enheden er mmol/L — ingen konvertering. Samme side angiver desuden behandlingsmål: generel befolkning "LDL kolesterol mindre end 3,0 mmol/L", patienter med hjertekarsygdom <1,8 mmol/L, diabetes lav/moderat risiko <2,6 mmol/L, diabetes høj risiko <1,8 mmol/L. Sekundær bekræftelse via Lægehåndbogen (https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/ldl-kolesterol/), som angiver behandlingsmål baseret på Dansk Cardiologisk Selskab (NBV): høj/moderat risiko <2,6 mmol/L, ekstra risikofaktorer/iskæmisk hjertekarsygdom <1,4-1,8 mmol/L, diabetes uden kardiovaskulær sygdom <2,6 mmol/L, diabetes meget høj risiko <1,8 mmol/L.
- **Confidence:** high — to uafhængige sundhed.dk-kilder (Patient- og Lægehåndbogen) i korrekt enhed (mmol/L); det aldersopdelte lab-interval er verificeret ordret ved gen-fetch, og behandlingsmålene er bekræftet på tværs af begge kilder.

## Køns-/alders-specifikt
Kilden angiver IKKE separate intervaller for køn, men bemærker udtrykkeligt: "Der kan være alders- og kønsvariation og nogle gange også forskel mellem laboratoriernes analysemetoder". Lab-referenceintervallet er derimod tydeligt **aldersopdelt** og stiger med alderen: 18-<30 år 1,2-4,3 mmol/L; 30-<50 år 1,4-4,7 mmol/L; 50+ år 2,0-5,3 mmol/L. Den foreslåede øvre grænse (5,3) er hentet fra den ældste aldersgruppe (50+), dvs. den bredest mulige populations-statistiske øvre grænse. Bemærk at dette aldersdrev afspejler population (90-95% percentiler), ikke sundhedsmæssigt ønske — kardiologiske behandlingsmål er aldersuafhængige og betydeligt lavere.

## Noter & forbehold til Judit
- **TO TYPER TAL — vigtigt at skelne:** (1) Det aldersopdelte LABORATORIE-referenceinterval (populations-statistisk, 90-95% percentiler) fra Patienthåndbogen, som spænder 1,2-5,3 mmol/L på tværs af alle aldersgrupper. (2) BEHANDLINGSMÅL fra Dansk Cardiologisk Selskab, som er langt mere relevante klinisk og longevity-mæssigt: raske/lav-risiko <2,6 mmol/L, generel grænse <3,0 mmol/L, iskæmisk hjertekarsygdom <1,4 mmol/L (nyeste ESC/DCS) hhv. <1,8 mmol/L (ældre mål), diabetes <2,6 (lav/moderat) eller <1,8 (høj risiko).
- **Lab-intervallet er IKKE et sundhedsmål:** Mange "normale" lab-værdier op til 4-5 mmol/L anses kardiologisk for forhøjede. Det aldersbaserede interval beskriver hvad populationen HAR, ikke hvad der er optimalt. For Aevias lavere-er-bedre-motor anbefales det stærkt at den styrende øvre grænse fastsættes ud fra behandlingsmål, ikke ud fra det øvre lab-percentil (5,3).
- **Valg af refHigh — beslutning til Judit:** Jeg har sat refHigh = 5,3 mmol/L for at respektere den verificerede kilde (øvre lab-grænse, ældste aldersgruppe) og researcherens foreslåede interval. MEN dette er klinisk konservativt/højt. Overvej i stedet at sætte refHigh til behandlingsmålet <3,0 mmol/L (generel grænse) eller <2,6 mmol/L (raske voksne, DCS), hvilket bedre matcher Aevias longevity-profil og motorens udledte 3,25. Aevias nuværende optimal-zone (1-2,6) ligger allerede på linje med DCS' mål for raske voksne (<2,6).
- **Forhold til motorens udledte 3,25:** Den motor-udledte øvre grænse (3,25) svarer omtrent til det generelle behandlingsmål <3,0 mmol/L og er klinisk mere meningsfuld end lab-percentilen 5,3. Hvis 3,25/3,0 vælges som refHigh i stedet for 5,3, vil motoren eskalere ved værdier, som kardiologisk faktisk regnes for forhøjede.
- **Mindre kilde-uenighed om iskæmisk-mål:** Patienthåndbogen viste <1,8 mmol/L for hjertekarsygdom (ældre DCS-mål); researcheren og nyeste ESC/DCS angiver <1,4 mmol/L. Begge er korrekte afhængigt af guideline-årgang. Dette vedrører behandlingsmål, ikke lab-referenceintervallet, og påvirker ikke refHigh-valget for raske.
- **Beregnet vs. målt LDL:** LDL kan beregnes (Friedewald) eller måles direkte; referenceintervaller varierer mellem laboratorier og analysemetoder (kilden bemærker dette eksplicit). Friedewald er upålidelig ved triglycerid >4-5 mmol/L og ved meget lavt LDL.
- **Enhed:** mmol/L i kilden, matcher motoren — ingen konvertering.
- **Nedre grænse (refLow) sat til åben/null:** Lavt LDL flagges ikke som patologisk i dansk klinik (lavere-er-bedre). Der findes derfor ikke en meningsfuld nedre referencegrænse i motorens retning.
