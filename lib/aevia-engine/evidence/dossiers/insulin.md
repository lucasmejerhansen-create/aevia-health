# Fasteinsulin — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `insulin` · **Enhed:** pmol/L · **Kategori:** blodsukker · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 83 |
| Aevia optimal-zone | 20 | 60 |
| Motorens udledte ref. (erstattes) | åben | 75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi / Blodprøver, Insulin)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/insulin/
- **Verbatim citat:** "Under 83 pmol/L [Unilabs Danmark] … 5-69 pmol/L [Steno Diabetes Center] … Der kan være betydelige forskelle i de angivne intervaller fra laboratorium til laboratorium, både afhængigt af de anvendte målemetoder og referencepopulationen"
- **Bekræftet ved gen-fetch:** Ja. To uafhængige fetches af kilden bekræfter begge danske laboratorie-intervaller ordret i korrekt enhed (pmol/L, ingen konvertering nødvendig): Unilabs Danmark "Under 83 pmol/L" (kun øvre grænse — ingen nedre grænse angivet) og Steno Diabetes Center "5-69 pmol/L". Lægehåndbogen anfører desuden eksplicit, at der kan være betydelige forskelle mellem laboratorier afhængigt af målemetode og referencepopulation.
- **Confidence:** high — Top-kilde i hierarkiet (sundhed.dk Lægehåndbogen), begge citater bekræftet ordret ved gen-fetch, enhed matcher (pmol/L, unitMatches=true).

## Køns-/alders-specifikt
Lægehåndbogen angiver ingen kønsspecifikke referenceintervaller for fasteinsulin; de to anførte intervaller (Unilabs og Steno Diabetes Center) gælder for begge køn. Kilden bemærker dog, at koncentrationen stiger hos gravide og er højere hos kvinder, der får p-piller eller østrogenbehandling — en tilstands-/medicin-afhængighed, ikke et selvstændigt kønsspecifikt referenceinterval. Ingen alderssspecifikke voksenintervaller angivet.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Værdien er allerede i pmol/L (unitMatches=true).
- **Valg af øvre grænse (vigtig beslutning):** Kilden anfører to forskellige danske laboratorie-referenceintervaller. Da markøren er lavere-er-bedre og kun øvre grænse eskalerer, er foreslået `refHigh` sat til den mest konservative (højeste) øvre grænse, 83 pmol/L (Unilabs Danmark). Steno Diabetes Centers øvre grænse er strammere (69 pmol/L). Judit kan vælge den strammere Steno-grænse (69), hvis et mere konservativt eskaleringspunkt foretrækkes af longevity-/metaboliske hensyn.
- **Nedre grænse / åben side:** `refLow=null` (åben), jf. lavere-er-bedre. Unilabs angiver ingen nedre grænse; Steno-intervallets nedre grænse er 5 pmol/L. Værdien 5 indgår ikke i eskalering, men kan dokumenteres som "ekstremt lav insulin" hvis Judit ønsker en nedre informativ tærskel.
- **Uenighed mellem kilder / laboratorievariation:** Lægehåndbogen understreger eksplicit betydelig variation mellem laboratorier afhængigt af målemetode og referencepopulation. De to anførte intervaller (≤83 vs. 5-69) illustrerer dette direkte.
- **Optimal-zone:** Aevias optimal-zone 20-60 pmol/L ligger inden for begge danske referenceintervaller (under begge øvre grænser).
- **Tolkningsforbehold:** Fasteinsulin skal altid tolkes sammen med C-peptid og glukose, da insulin-sekretionen er pulsatil og kraftigt påvirkes af fødeindtag/fastestatus. Prøven kræver reel faste.
- **Ikke-hentbar støttekilde:** En relevant dansk populationsstudie findes (Clin Chim Acta / ScienceDirect S0009912016302284: "Reference intervals for C-peptide and insulin derived from a general adult Danish population"), men kunne ikke hentes verbatim (HTTP 403) og indgår derfor ikke i citatet.
