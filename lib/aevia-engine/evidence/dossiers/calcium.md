# Calcium — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `calcium` · **Enhed:** mmol/L · **Kategori:** vitaminer · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 2.20 | 2.55 |
| Aevia optimal-zone | 2.2 | 2.5 |
| Motorens udledte ref. (±25%, erstattes) | 1.65 | 3.125 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen — Calcium, total
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/calcium-total/
- **Verbatim citat:** "Voksne over 18 år: 2,20 - 2,55 mmol/L"
- **Bekræftet ved gen-fetch:** Ja — siden blev hentet på ny. Vokseninterval (>18 år) står ordret som "2,20 - 2,55 mmol/L" i enheden mmol/L (enheden matcher, ingen konvertering nødvendig). Siden angiver desuden aldersopdelte intervaller for børn/unge (fx piger 15-19 år: 1,95–2,58; drenge 15-19 år: 2,10–2,58 mmol/L) samt at gravide har "lidt lavere værdier". Siden bemærker selv: "Der kan være (mindre) forskelle i referenceintervallerne mellem laboratorier".
- **Confidence:** high — primær dansk topkilde (sundhed.dk Lægehåndbogen) bekræfter både værdi og enhed verbatim; intervallet er klinisk plausibelt og i tråd med standard total-calcium referenceområde for voksne.

## Køns-/alders-specifikt
Ingen kønsforskel for voksne (>18 år); intervallet 2,20–2,55 mmol/L gælder begge køn. Kønsforskelle ses kun hos børn/unge (fx 15-19 år: piger 1,95–2,58 mmol/L; drenge 2,10–2,58 mmol/L) og er ikke relevante for voksen-målgruppen. Gravide har let lavere værdier (intet specifikt interval angivet på kilden).

## Noter & forbehold til Judit
- **Enhed:** Total P-Calcium (NPU01443), mmol/L — ingen konvertering nødvendig (unitMatches=true).
- **Motorens nuværende reference er klinisk forkert:** den udledte ±25%-reference (1,65–3,125) bør erstattes med det danske kliniske interval 2,20–2,55 mmol/L. Aevias nuværende optimal-zone (2,2–2,5) ligger inden for det kliniske interval.
- **Uenighed mellem kilder (mindre):** Sekundær dansk kilde (Bornholms Hospital klinisk-biokemisk laboratorium, bohlab.dk) angiver et lidt smallere vokseninterval på 2,15–2,51 mmol/L (18-125 år). Referenceintervaller varierer let mellem laboratorier afhængigt af metode og referencepopulation; sundhed.dk anerkender selv dette. Vi foreslår at følge sundhed.dk-toppen (2,20–2,55) som primær, men beder Judit tage stilling til om Aevia skal bruge laboratoriets specifikke interval for de(t) anvendte analyselaboratorie(r).
- **Bemærk:** Aldersopdelte intervaller findes for børn/unge, men da Aevias målgruppe er voksne, anvendes vokseninterval.
