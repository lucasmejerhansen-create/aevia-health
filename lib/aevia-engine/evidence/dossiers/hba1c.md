# HbA1c — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `hba1c` · **Enhed:** mmol/mol · **Kategori:** blodsukker · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 44 |
| Aevia optimal-zone | 28 | 35 |
| Motorens udledte ref. (±25%, erstattes) | åben | 43.75 |


## Evidens
- **Kilde:** sundhed.dk — Lægehåndbogen, Klinisk biokemi, Blodprøver: Hæmoglobin A1c (HbA1c)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/haemoglobin-a1c-hba1c/
- **Verbatim citat:** "Referenceinterval: 31 - 44 mmol/mol."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af kilden bekræftede ordret "Referenceinterval: 31 - 44 mmol/mol" i enheden mmol/mol — ingen konvertering nødvendig. Samtidig bekræftedes de diagnostiske tærskler (prædiabetes 42-47 mmol/mol; type 2 diabetes ≥48 mmol/mol, kræver konfirmation) samt at gravide ofte har lavere værdier i 2.-3. trimester (typisk 20-31 mmol/mol). Web-søgning på tværs af danske kilder (DSKB/hospitalslab/befolkningsstudier) viste konsistente diagnostiske grænser og ingen modstridende referenceinterval-værdier.
- **Confidence:** high — Kilden er øverst i det danske kliniske kilde-hierarki (Lægehåndbogen, klinisk biokemi), enheden matcher direkte, citatet er bekræftet ordret ved gen-fetch, og begge ender af intervallet er meningsfulde og angivet.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel for det generelle referenceinterval. **Aldersbemærkning:** ældre kan have fysiologisk lidt højere HbA1c, og litteraturen diskuterer aldersjusterede referenceintervaller for at undgå overdiagnostik hos ældre. **Graviditet:** gravide har ofte lavere værdier i 2.-3. trimester (typisk 20-31 mmol/mol) jf. samme kilde — det generelle interval gælder ikke for gravide.

## Noter & forbehold til Judit
- **Enhed matcher** (mmol/mol) — ingen konvertering nødvendig.
- **Diagnostiske tærskler vs. referencegrænse:** Det rapporterede referenceinterval er 31-44 mmol/mol, men de klinisk afgørende beslutningsgrænser ligger over referenceintervallets top: prædiabetes defineres ved HbA1c 42-47 mmol/mol, og ≥48 mmol/mol (målt to gange / konfirmeret) er diagnostisk for type 2 diabetes. Den foreslåede øvre grænse (44) er sat = referenceintervallets øvre grænse, hvilket reelt er sammenfaldende med motorens nuværende udledte 43.75. **Til overvejelse:** om motorens eskalering bør knyttes til de diagnostiske tærskler (42 prædiabetes / 48 diabetes) frem for til den øvre referencegrænse (44). Dette er en klinisk/produkt-beslutning til Judit.
- **Optimal-zone konsistens:** Aevias optimal-zone (28-35) ligger lavt-normalt og er strammere end det kliniske interval, hvilket er konsistent med "lavere-er-bedre"-retningen. Bemærk dog at zonen ligger fuldt inden for det normale 31-44 interval i øvre ende, men strækker sig ned til 28 (lige under referenceintervallets nedre grænse på 31) — ekstremt lave HbA1c-værdier er sjældent et selvstændigt klinisk problem hos ikke-diabetikere, men kan i sjældne tilfælde indikere fx anæmi/hæmolyse/forhøjet erytrocyt-omsætning, der påvirker analysen. Værd at vurdere om nedre del af optimal-zonen skal have en note.
- **Subpopulationer der invaliderer HbA1c:** Hæmoglobinopatier, jernmangel, nylig blodtransfusion, hæmolyse og forhold med ændret erytrocyt-levetid kan give misvisende HbA1c — relevant fortolkningsforbehold som Aevia-rapporten evt. bør flagge.
