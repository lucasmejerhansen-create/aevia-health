# Fasteglukose — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `glukose` · **Enhed:** mmol/L · **Kategori:** blodsukker · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 6.3 |
| Aevia optimal-zone | 4.2 | 5.4 |
| Motorens udledte ref. (±25%, erstattes) | åben | 6.75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Glukose, klinisk biokemi)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/glukose/
- **Verbatim citat:** "Fasteværdier hos alle over 3 år: 4,2 - 6,3 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Re-fetch af kilden bekræfter citatet ordret og i enheden mmol/L. Kilden angiver desuden det lavere interval for nyfødte ("Hos nyfødte op til 3 døgn er værdierne lavere: 2,0 - 4,5 mmol/L") og henviser til diabetes-artiklerne for de diagnostiske grænseværdier. Værdien er krydstjekket via søgning og fremstår som det standard danske referenceinterval — ingen uenige kilder fundet.
- **Confidence:** high — Øverst i kilde-hierarkiet (sundhed.dk / Lægehåndbogen, klinisk biokemi), enhed matcher uden konvertering, citatet bekræftet ved gen-fetch, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel — referenceintervallet 4,2-6,3 mmol/L gælder begge køn. Aldersspecifikt: fasteintervallet 4,2-6,3 mmol/L gælder alle over 3 år; nyfødte op til 3 døgn har et lavere interval (2,0-4,5 mmol/L). Aevias voksne målgruppe er fuldt dækket af over-3-år-intervallet.

## Noter & forbehold til Judit
- **Erstatning af motorens udledte øvre grænse:** Den kliniske øvre grænse 6,3 mmol/L er lavere end motorens nuværende udledte 6,75 mmol/L og bør erstatte denne. Da retningen er lavere-er-bedre, er kun den øvre grænse relevant for eskalering; refLow sættes til åben (null).
- **Referenceinterval ≠ diagnostiske grænser:** Vær opmærksom på skellet. Det foreslåede 6,3 mmol/L er det øvre referenceinterval, ikke en diagnostisk tærskel. Diagnostisk regnes diabetes ved faste-plasmaglukose ≥ 7,0 mmol/L (bekræftet i ny prøve); en værdi < 6,1 mmol/L taler imod diabetes; prædiabetes/IFG (impaired fasting glucose) ligger i 6,1-6,9 mmol/L. En værdi i 6,3-6,9-zonen er altså inden for/over referencen men under diabetes-grænsen — relevant for, hvordan eskalering og budskab formuleres.
- **Optimal-zone vs. klinisk reference:** Aevias optimal-zone (4,2-5,4 mmol/L) ligger i den nedre del af det kliniske referenceinterval og er strammere i den øvre ende. Dette passer med longevity-/lavere-er-bedre-tilgangen, men er en redaktionel/strategisk grænse, ikke en klinisk grænse — bør valideres separat.
- **Enhed:** mmol/L matcher; ingen konvertering nødvendig.
