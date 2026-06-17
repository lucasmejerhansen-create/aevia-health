# Fibrinogen — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `fibrinogen` · **Enhed:** g/L · **Kategori:** inflammation · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 3.5 |
| Aevia optimal-zone | 1.8 | 3 |
| Motorens udledte ref. (±25%, erstattes) | åben | 3.75 |

## Evidens
- **Kilde:** Bornholms Hospital Laboratorievejledning (Klinisk Biokemi), Fibrinogen (koag.);P, NPU02050
- **URL:** https://www.bohlab.dk/index.php/npu02050
- **Verbatim citat:** "Referenceinterval: 5,3-10,3" (Enhed: µmol/L)
- **Bekræftet ved gen-fetch:** Ja. Siden blev hentet to gange. Begge gange angiver den Enhed: µmol/L og Referenceinterval: 5,3-10,3. Værdien står IKKE i g/L i kilden — den er angivet i den danske SI-standardenhed µmol/L. Markørens enhed i Aevia er g/L, så der er foretaget enhedskonvertering (unitMatches=false).
- **Confidence:** medium — Kilden er bekræftet og citatet står ordret, men (1) der kræves enhedskonvertering fra µmol/L til g/L via fibrinogens molekylvægt (~340.000 g/mol), og (2) den eneste fundne danske kilde med konkret talværdi er ét enkelt hospitalslaboratorium (Bornholm). Det konverterede interval stemmer dog godt overens med internationale referencer (typisk 2-4 g/L; nogle laboratorier 1,5-4,0 eller 1,0-4,0 g/L) og med Aevias nuværende optimal-zone (1,8-3 g/L), hvilket understøtter plausibiliteten.

### Enhedskonvertering (µmol/L → g/L)
Formel: g/L = µmol/L × molekylvægt / 1.000.000, hvor MW(fibrinogen) ≈ 340.000 g/mol (340 kDa).
- 5,3 µmol/L × 340.000 / 1.000.000 = 1,802 g/L ≈ **1,8 g/L**
- 10,3 µmol/L × 340.000 / 1.000.000 = 3,502 g/L ≈ **3,5 g/L**

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel angivet i kilden. Bemærk dog generelt: fibrinogen stiger fysiologisk under graviditet og med alderen, og er en akut-fase-reaktant (forhøjes ved inflammation/infektion). Bornholm-intervallet angiver ikke separate køns- eller aldersgrænser.

## Noter & forbehold til Judit
- **Enhedskonvertering påkrævet:** Den danske kilde angiver intervallet i µmol/L (5,3-10,3), ikke i g/L. Det foreslåede g/L-interval (1,8-3,5) er udledt ved konvertering med MW ≈ 340 kDa. Vær opmærksom på, at fibrinogens molekylvægt varierer i litteraturen (typisk 340-340.000 g/mol; nogle kilder bruger 330-350 kDa), hvilket giver en lille usikkerhed i de konverterede tal (±~0,05 g/L).
- **Retning i motoren (lavere-er-bedre):** Kun den øvre grænse eskalerer. Derfor er refLow sat til null (åben) og refHigh = 3,5 g/L. Klinisk er en lav nedre grænse også meningsfuld (hypofibrinogenæmi øger blødningsrisiko), så hvis Judit ønsker tosidet vurdering, kan en nedre grænse på ~1,8 g/L tilføjes — men det strider mod motorens nuværende lavere-er-bedre-retning.
- **Akut-fase-reaktant:** Forhøjede værdier ses ved inflammation, infektion, traume og graviditet og afspejler ikke nødvendigvis kronisk kardiovaskulær risiko. Tolk altid i klinisk kontekst.
- **Kildegrundlag:** Kun ét dansk hospitalslaboratorium (Bornholm) gav en konkret talværdi. Sundhed.dk/Lægehåndbogen har sider om koagulation/D-dimer, men ingen dedikeret fibrinogen-side med dansk talværdi blev fundet (sundhed.dk-fibrinogen-URL gav HTTP 404). Region Midtjyllands KVG-håndbog (analysefortegnelsen.rm.dk) kunne ikke maskinlæses. Det anbefales at bekræfte mod Aevias primære partner-laboratoriums egne referenceintervaller før endelig validering.
