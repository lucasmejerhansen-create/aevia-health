# HOMA-IR — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `homair` · **Enhed:** indeks · **Kategori:** blodsukker · **Type:** beregnet/afledt markør
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 2.5 |
| Aevia optimal-zone | 0.5 | 1.5 |
| Motorens udledte ref. (±25%, erstattes) | åben | 1.875 |


## Evidens
- **Kilde:** Beregner.org (dansk HOMA-IR-lommeregner, sekundær kilde) for den graderede danske tolkning + NHANES ≥2,5 / EGIR >2,0 som international klinisk cut-off. Danske primærkilder (sundhed.dk Patienthåndbogen + Lægehåndbogen, Ugeskriftet "Insulinresistens") publicerer IKKE en fast numerisk cut-off.
- **URL:** https://beregner.org/homa-ir-lommeregner/
- **Verbatim citat:** "Mindre end 1.0: Normal insulinfølsomhed" ... "1.0 til 1.9: Tidlig insulinresistens" ... "2.0 til 2.9: Moderat insulinresistens" ... "3.0 eller højere: Alvorlig insulinresistens" ... "En HOMA-IR score > 2,9 antyder potentiel insulinresistens"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Beregner.org bekræftede citatet ordret (de fire graderingsbånd <1,0 / 1,0–1,9 / 2,0–2,9 / ≥3,0 samt sætningen "En HOMA-IR score > 2,9 antyder potentiel insulinresistens"). Siden angiver værdien som et dimensionsløst indeks ("enheder" / numerisk indeksværdi) — enheden matcher markørens enhed (unitMatches=true). Siden tilføjer selv forbeholdet "Referenceområder kan variere lidt mellem forskellige populationer og laboratorier". Den internationale cut-off ≥2,5 (NHANES) bekræftet via websøgning som den mest udbredte tærskel for voksne; NHANES III-data: median ~2,2, middel ~2,8. Danske primærkilder bekræftet: sundhed.dk Patienthåndbogen skriver eksplicit "Der findes ingen enkel prøve, som kan sige, at du har insulinresistens", og Lægehåndbogen (Insulin) angiver ingen fast HOMA-IR-cut-off.
- **Confidence:** low — Ingen dansk primærkilde (sundhed.dk, DSKB, hospitalslab) angiver en numerisk cut-off; den eneste konkrete dansksprogede gradering kommer fra en sekundær lommeregner-kilde. Kilderne er desuden ikke fuldt enige: dansk gradering peger på >2,9 som klinisk tærskel, mens den internationale standard er ≥2,5 (NHANES) / >2,0 (EGIR). Den foreslåede 2,5 er et konservativt litteratur-/tærskelvalg, ikke et lab-valideret referenceinterval.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel i de anvendte kilder. Bemærk dog generelt: HOMA-IR påvirkes af insulin-assay, etnicitet og population (lavere cut-offs rapporteres i asiatiske populationer, typisk 1,4–2,5), så den absolutte tærskel er assay- og populationsafhængig.

## Noter & forbehold til Judit
- **Afledt/beregnet mål — ikke et klassisk lab-interval.** HOMA-IR = faste-insulin × faste-glukose / 22,5. Der findes ikke et formelt lab-referenceinterval; tærskler er litteratur-/konsensusbaserede.
- **Danske primærkilder giver ingen fast cut-off.** sundhed.dk Patienthåndbogen: "Der findes ingen enkel prøve, som kan sige, at du har insulinresistens." Lægehåndbogen (Insulin) henviser til det lokale laboratoriums referenceinterval. Ugeskriftet ("Insulinresistens") omtaler HOMA2 og henviser til "Grænseværdierne for normal insulinsensitivitet i et dansk materiale ses i Figur 1", men de eksakte tal står kun i figuren (kunne ikke ekstraheres som tekst).
- **Uenige kilder:** dansk sekundær gradering ≥2,9 (potentiel IR) vs. international ≥2,5 (NHANES) / >2,0 (EGIR). Foreslået 2,5 ligger konservativt mellem dansk "tidlig" (1,0–1,9) og "moderat" (2,0–2,9) og matcher den hyppigste internationale cut-off.
- **Forhold til motoren:** lavere-er-bedre → refLow=null (ingen meningsfuld nedre patologisk grænse; lavere = bedre insulinfølsomhed). Aevias optimal-zone 0,5–1,5 og motorens udledte øvre 1,875 ligger i "normal/tidlig"-båndet; en revideret øvre eskaleringsgrænse i intervallet 2,0–2,5 vurderes klinisk mere korrekt end 1,875. Foreslået 2,5.
- **Assay-afhængighed:** tærsklen afhænger af insulin-assay, etnicitet og population — bør kalibreres mod det udførende laboratoriums metode.
- **Kræver Judits kliniske validering** før brug i produktion.
