# HDL-kolesterol — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `hdl` · **Enhed:** mmol/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 1.0 | åben |
| Aevia optimal-zone | 1.2 | 2.5 |
| Motorens udledte ref. (±25%, erstattes) | 0.9 | åben |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (HDL-kolesterol) — ønskede niveauer fra Dansk Cardiologisk Selskab; harmoniseret grænse iht. C-meddelelse fra Klinisk Biokemisk Afdeling, Aalborg UH / Region Nordjylland (DSKB-anbefaling, 18. marts 2026, gældende fra 30. marts 2026)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/hdl-kolesterol/
- **Verbatim citat:** "Mænd: over 1,0 mmol/L" og "Kvinder: over 1,2 mmol/L" (Lægehåndbogen, ønskede niveauer fra Dansk Cardiologisk Selskab). | "Fremadrettet anvendes for P-Kolesterol HDL den samme grænseværdi (> 1,0 mmol/L) hos mænd og kvinder." (sundhed.dk C-meddelelse, Region Nordjylland / Aalborg UH, DSKB-anbefaling, gældende fra 30. marts 2026)
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede ordret de historiske kønsopdelte ønskeniveauer (mænd > 1,0 mmol/L, kvinder > 1,2 mmol/L) og at "Grænseværdierne skal ikke opfattes som målværdier". Selvstændig gen-fetch af den officielle sundhed.dk C-meddelelse (Region Nordjylland / Aalborg UH) bekræftede ordret harmoniseringen: tidligere mænd > 1,0 / kvinder > 1,2 mmol/L → fremadrettet samme grænse > 1,0 mmol/L for begge køn, gældende fra mandag 30. marts 2026, efter anbefaling fra Dansk Selskab for Klinisk Biokemi (DSKB) og indført samtidig i Region Nordjylland og Region Midtjylland for at ensrette med øvrige danske regioner. Enheden er mmol/L i alle kilder — ingen konvertering nødvendig.
- **Confidence:** high — to uafhængige sundhed.dk-kilder (Lægehåndbogen + officiel C-meddelelse fra hospitalslaboratorium) bekræfter henholdsvis de historiske kønsopdelte grænser og den aktuelt harmoniserede grænse (> 1,0 mmol/L, begge køn) ordret i korrekt enhed. Retningen (højere-er-bedre) understøtter, at kun den nedre beslutningsgrænse er klinisk relevant.

## Køns-/alders-specifikt
Historisk kønsopdelt nedre grænse: mænd > 1,0 mmol/L, kvinder > 1,2 mmol/L (DCS' ønskede niveauer, fortsat anført deskriptivt i sundhed.dk Lægehåndbogen/Patienthåndbogen). Fra 30. marts 2026 har Klinisk Biokemiske Afdelinger i Region Nordjylland og Region Midtjylland — efter anbefaling fra Dansk Selskab for Klinisk Biokemi (DSKB), som ensretter med øvrige danske regioner — harmoniseret grænseværdien til > 1,0 mmol/L for BÅDE mænd og kvinder. Den aktuelt gældende danske beslutningsgrænse er derfor > 1,0 mmol/L uafhængigt af køn. Den foreslåede refLow = 1,0 mmol/L afspejler denne harmoniserede, kønsuafhængige grænse.

## Noter & forbehold til Judit
- **Beslutningsgrænse, ikke klassisk to-endet lab-interval:** HDL er en "højere-er-bedre" markør. Den kliniske reference er en NEDRE ønske-/beslutningsgrænse (> 1,0 mmol/L), ikke et symmetrisk populations-referenceinterval. Motorens retning (højere-er-bedre, kun nedre ende eskalerer) passer derfor til markøren.
- **refLow = 1,0 mmol/L:** Den aktuelt DSKB-harmoniserede danske grænse, gældende for begge køn fra marts 2026. Bemærk overgangen fra den tidligere kønsopdelte praksis (kvinder 1,2; mænd 1,0). Hvis motoren stadig skulle differentiere efter køn, vil 1,0 nu være den korrekte fælles grænse.
- **refHigh = null (åben):** Høj HDL er generelt gunstig, og der findes ingen meningsfuld øvre referencegrænse i dansk klinisk praksis. Kilden nævner kun deskriptivt at "høje værdier (over 2 mmol/L) ses ofte hos fysisk aktive mennesker" og at meget høje værdier (over 4 mmol/L) kan ses ved sjælden CETP-mangel — disse er ikke referencegrænser og bør ikke eskaleres af motoren.
- **Meget lave værdier:** Værdier < 0,5 mmol/L kan tyde på arvelig sygdom (deskriptiv differentialdiagnostisk observation, ikke en reference-undergrænse).
- **Enhed:** mmol/L i alle kilder, matcher motoren — ingen konvertering.
- **Aevia optimal-zone (1,2–2,5):** Ligger over den kliniske mindstegrænse. Den nedre 1,2 svarer til den tidligere kvinde-grænse, mens dansk klinik nu bruger 1,0 som fælles nedre beslutningsgrænse. Overvej om optimal-zonens nedre ende (1,2) skal harmoniseres med den nye fælles grænse, eller bevidst holdes strammere som "optimal" vs. "acceptabel".
- **Motorens udledte ref. (0,9):** Stemmer med Patienthåndbogens formulering "skal helst være over 0,9 mmol/L", men den fagligt gældende kliniske grænse er nu 1,0 mmol/L (DSKB). Den udledte 0,9 bør derfor erstattes af 1,0.
- **Kausalitetsforbehold:** Lægehåndbogen bemærker, at lavt HDL ikke er bekræftet som en kausal risikofaktor (kun associeret) — relevant for, hvor stærkt en lav HDL-værdi bør formidles til brugeren.
