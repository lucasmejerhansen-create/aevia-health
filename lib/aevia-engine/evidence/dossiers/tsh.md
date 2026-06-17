# TSH — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `tsh` · **Enhed:** mIU/L · **Kategori:** thyroidea · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 4.5 |
| Aevia optimal-zone | 0.5 | 2.5 |
| Motorens udledte ref. (±25%, erstattes) | åben | 3.125 |


## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen — Thyrotropin (TSH), klinisk biokemi/blodprøver
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/thyrotropin-tsh/
- **Verbatim citat:** ">18 år: 0,300 - 4,5 mIU/L"
- **Bekræftet ved gen-fetch:** Ja. Siden blev gen-hentet to gange. Voksen-intervallet (>18 år) "0,300 - 4,5 mIU/L" står ordret på siden og er allerede angivet i mIU/L — ingen enhedskonvertering nødvendig (kun decimalkomma → decimalpunktum). Den fulde aldersinddelte tabel blev også bekræftet: 0-6 dage 0,70-20,0; 6 dage-3 mdr 0,70-12,7; 3 mdr-1 år 0,70-8,9; 1-18 år 0,600-4,50; >18 år 0,300-4,5 mIU/L.
- **Confidence:** high — Primær dansk klinisk kilde (sundhed.dk Lægehåndbogen), korrekt enhed, værdi verificeret ordret ved gen-fetch, og intervallet er klinisk plausibelt og i overensstemmelse med danske hospitalslaboratoriers typiske referenceintervaller (nedre 0,3-0,4; øvre 4,0-4,5 mIU/L).

## Køns-/alders-specifikt
Ingen kønsspecifikke forskelle angivet i kilden. Intervallet er derimod stærkt aldersafhængigt:
- **0-6 dage:** 0,70-20,0 mIU/L (neonatal — markant højere øvre grænse)
- **6 dage-3 mdr:** 0,70-12,7 mIU/L
- **3 mdr-1 år:** 0,70-8,9 mIU/L
- **1-18 år:** 0,600-4,50 mIU/L
- **>18 år (voksen — anvendt her):** 0,300-4,5 mIU/L

**Graviditet:** Afvigende. 1. trimester kan ligge så lavt som 0,02 mIU/L; diagnostisk tærskel P-TSH ≤ 2,5 mIU/L (1. trimester) og ≤ 3,0 mIU/L (2.-3. trimester). Gravide bør IKKE vurderes mod det generelle voksen-interval.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Kilden er allerede i mIU/L; kun decimalkomma konverteret til decimalpunktum (0,3-4,5 → 0.3-4.5). unitMatches = true.
- **Motorens udledte øvre grænse (3,125) erstattes** af den kliniske øvre grænse **4,5 mIU/L** fra Lægehåndbogen. Den motor-udledte værdi var for snæver i forhold til det validerede kliniske referenceinterval.
- **Retning lavere-er-bedre → refLow = null (åben), refHigh = 4,5.** Den nedre kliniske grænse (0,300) er bevidst ikke sat som refLow, da motoren kun lader øvre grænse eskalere. Bemærk dog klinisk: meget lave TSH-værdier (under ca. 0,3) kan indikere hyperthyreose/tyreotoksikose — overvej om motoren bør have en sikkerhedsflag for ekstremt lave værdier, selvom retningen er lavere-er-bedre. Anbefal Judit at vurdere dette.
- **Aevia optimal-zone (0,5-2,5)** ligger snævrere end det fulde kliniske referenceinterval (0,3-4,5), hvilket er konsistent med en longevity-optimal tilgang. Den foreslåede reference og optimal-zonen er to forskellige ting og skal ikke forveksles.
- **Diurnal variation:** Øvre referencegrænse falder fra ca. 4,8 mIU/L kl. 8 til ca. 4,0-4,2 mIU/L midt på dagen (ca. 20-30% fald). Nogle laboratorier har tidsafhængige intervaller. Prøvetagningstidspunkt kan påvirke fortolkning nær den øvre grænse.
- **Vejledende interval:** Lægehåndbogen understreger eksplicit at "De anførte referenceintervaller er kun vejledende" og "Brug derfor altid det lokale laboratoriums referenceinterval". Danske hospitalslaboratorier ligger typisk i området 0,3-0,4 (nedre) til 4,0-4,5 (øvre) mIU/L — den foreslåede øvre grænse 4,5 ligger i toppen af dette spænd.
