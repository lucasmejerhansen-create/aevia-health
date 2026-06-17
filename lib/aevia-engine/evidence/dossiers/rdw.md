# RDW — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `rdw` · **Enhed:** % · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 15 |
| Aevia optimal-zone | 11.5 | 14 |
| Motorens udledte ref. (±25%, erstattes) | åben | 17.5 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Erytrocytundersøgelse, Klinisk biokemi)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/erytrocytundersoegelse/
- **Verbatim citat:** "RDW: 12 -15 %"
- **Bekræftet ved gen-fetch:** Ja. Siden blev hentet på ny. Citatet "RDW: 12 -15 %" står faktisk i teksten og gælder for voksne over 18 år. Det er den eneste numeriske RDW-reference på siden. Siden tilføjer selv forbeholdet: "Der kan være forskelle i de angivne intervaller fra laboratorium til laboratorium." Enheden er % som angivet — ingen konvertering nødvendig.
- **Confidence:** high — Primær dansk klinisk kilde (sundhed.dk Lægehåndbogen) bekræfter både værdi og enhed verbatim ved gen-fetch. Værdien er klinisk plausibel for en voksen dansk befolkning og ligger inden for det internationale/nordiske spænd (~11.5–15.4 %). Sekundære danske kilder (regionale analysefortegnelser, Lægenoter) bekræfter at RDW måles i % i Danmark, men gengav ikke konsistent én talværdi.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel angivet i kilden. Lægehåndbogen angiver ét voksen-interval (over 18 år) uden køns- eller aldersopdeling. Der er ikke angivet separate intervaller for børn eller gravide.

## Noter & forbehold til Judit
- **Variant:** Værdien er RDW-CV (volumenfordelingsbredde udtrykt som CV i % relativt til MCV) — den variant der måles i %. RDW-SD måles i fL og er ikke relevant her. Lab-analysenavn: Erc(B)-RDW.
- **Retning og JSON:** Motoren er sat til lavere-er-bedre, så kun øvre grænse eskalerer. Foreslået interval: refLow = null (åben), refHigh = 15 %. Den danske kliniske øvre grænse (15 %) er strammere end motorens udledte ±25 %-grænse (17.5 %), hvilket sænker den øvre tærskel.
- **Aevia optimal-zone (11.5–14 %)** ligger inden for det foreslåede kliniske interval — ingen konflikt.
- **Inter-laboratorie-variation:** Referenceintervaller for RDW kan variere lidt mellem laboratorier afhængigt af analyseapparat (Sysmex/Coulter). En enkelt sekundær kilde nævnte et bredere spænd (ned til ~9 % i nedre ende) og en alternativ udtryksform som ratio (>0.16). Nordiske/internationale kilder spænder typisk ~11.5–15.4 %. Den danske primærkilde-værdi (12–15 %) er konsistent med dette. Til klinisk beslutning: bør Aevia binde sig til Lægehåndbogens 12–15 %, eller indhente Aevias eget analyselaboratoriums apparatspecifikke referenceinterval?
- **Sekundære kilder:** Region Sjælland / Region Nordjylland analysefortegnelser samt Lægenoter henviser til regionale referenceintervaller, men gengav ikke én entydig talværdi i den hentede tekst — derfor vægtes Lægehåndbogen som primær.
