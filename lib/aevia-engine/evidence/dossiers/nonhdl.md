# Non-HDL-kolesterol — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `nonhdl` · **Enhed:** mmol/L · **Kategori:** hjerte · **Type:** beregnet/afledt markør
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 3.9 |
| Aevia optimal-zone | 1.5 | 3 |
| Motorens udledte ref. (±25%, erstattes) | åben | 3.75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi — Kolesterol Non-HDL)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/kolesterol-non-hdl/
- **Verbatim citat:** "Signalværdi ≥3,9 mmol/L, dvs. værdier herover er forbundet med forhøjet risiko for hjertekarsygdom. Der bruges ikke 'normalværdier', men i stedet bruges signalværdier."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede ordret signalværdien ≥3,9 mmol/L og den eksplicitte formulering om, at der "ikke bruges normalværdier, men i stedet bruges signalværdier". Enheden er mmol/L — ingen konvertering nødvendig. Kilden tilføjer to relevante nuancer: (1) signalværdien gælder primært personer over 40 år, og (2) "der er ikke specielle alarm-grænser, men i SCORE2 stiger risikoen ASCVD hver gang non-HDL stiger 1,0 mmol/L". Bekræftet sekundært af flere uafhængige danske hospitalslaboratorier, der har indført non-HDL i lipidudredningen med samme øvre reference-/signalværdi 3,9 mmol/L (AUH/Region Midtjylland, Aalborg UH, Region Syddanmark) samt Dansk Cardiologisk Selskabs forebyggelsesvejledning (cardio.dk/forebyggelse).
- **Confidence:** high — primær sundhed.dk-kilde verificeret ordret ved gen-fetch i korrekt enhed (mmol/L), og signalværdien 3,9 mmol/L bekræftes konsistent af flere uafhængige danske hospitalslaboratorier og DCS' forebyggelsesvejledning.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel for signalværdien (3,9 mmol/L gælder begge køn). Aldersbemærkning: Lægehåndbogen anfører, at signalværdien primært gælder personer over 40 år. Non-HDL kan måles i ikke-fastende prøve, hvilket er en del af baggrunden for, at non-HDL i stigende grad afløser LDL i SCORE2-baseret risikovurdering.

## Noter & forbehold til Judit
- **Signalværdi — ikke et klassisk to-endet lab-interval:** Kilden er eksplicit på, at non-HDL IKKE har klassiske "normalværdier", men en signalværdi: ≥3,9 mmol/L markerer forhøjet hjertekar-risiko. Markøren er lavere-er-bedre, så kun en øvre grænse er klinisk meningsfuld.
- **Afledt/beregnet markør:** Non-HDL = total-kolesterol minus HDL. Den har derfor ingen selvstændig analytisk reference, men afledes af de underliggende lipidmål.
- **Nedre grænse (refLow) sat til null/åben:** Lavt non-HDL er ikke et klinisk problem — der findes ingen meningsfuld nedre referencegrænse. Lavere er bedre.
- **Øvre grænse (refHigh) sat til 3,9 mmol/L:** Erstatter motorens udledte ±25 %-reference (3,75 mmol/L) med den verificerede danske signalværdi (3,9 mmol/L). Aevias optimal-zone (1,5–3 mmol/L) ligger fornuftigt under signalværdien og er konsistent med "lavere er bedre".
- **Enhed:** mmol/L i kilden, matcher motoren — ingen konvertering.
- **VIGTIG NUANCE — behandlingsmål ≠ signalværdi:** For egentlige BEHANDLINGSMÅL bruges risikostratificerede mål (SCORE2 / Dansk Cardiologisk Selskabs forebyggelsesvejledning og DSAM), hvor non-HDL-måltal afhænger af risikogruppe (lav/moderat, høj, meget høj risiko) — typisk afledt af LDL-mål +0,8 mmol/L (ESC 2019/2021). Disse risikospecifikke mål fremgår ikke direkte af Lægehåndbogen. Kilden nævner, at "i SCORE2 stiger risikoen ASCVD hver gang non-HDL stiger 1,0 mmol/L". Judit bør tage stilling til, om motoren skal bruge den generelle signalværdi (3,9 mmol/L) eller risikostratificerede behandlingsmål.
