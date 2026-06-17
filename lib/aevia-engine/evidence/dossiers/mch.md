# MCH — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `mch` · **Enhed:** pg · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 27.4 | 33.8 |
| Aevia optimal-zone | 27 | 33 |
| Motorens udledte ref. (±25%, erstattes) | 20.25 | 41.25 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Erytrocytundersøgelse, klinisk biokemi)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/erytrocytundersoegelse/
- **Verbatim citat:** "MCH: 1,7 - 2,1 fmol"
- **Bekræftet ved gen-fetch:** Ja — men med et vigtigt forbehold om enhed. Gen-fetch af sundhed.dk-URL'en (17-06-2026) bekræftede ord-for-ord, at det danske referenceinterval for voksne >18 år er "MCH: 1,7 - 2,1 fmol". Værdien står i enheden **fmol**, IKKE i pg. Siden angiver tilsvarende MCV 85–100 fL og MCHC 19,7–22,2 mmol/L for voksne >18 år. De pg-værdier, der foreslås her (27,4–33,8 pg), står IKKE direkte på den danske kilde — de er afledt via enhedskonvertering (se Noter). En selvstændig web-søgning bekræftede konverteringsfaktoren (1 fmol = 16,11 pg; 1 pg = 0,06207 fmol) og at det internationale MCH-normalinterval er 27–33 pg ≈ 1,68–1,92 fmol/celle, hvilket er konsistent med både den danske kilde og den afledte pg-værdi.
- **Confidence:** high — Kilden er øverst i kilde-hierarkiet (sundhed.dk Lægehåndbogen), fmol-værdien er verbatim gen-bekræftet, og det konverterede pg-interval (27,4–33,8) stemmer overens med både det internationalt etablerede MCH-interval (27–33 pg) og Aevias optimal-zone (27–33 pg). Bemærk dog: pg-tallene er **afledt via omregning**, ikke direkte aflæst i den danske kilde — derfor unitMatches=false. Selve omregningen er lavpunkts-risiko (faktoren er etableret og dobbelt-tjekket), så samlet confidence fastholdes high.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel for voksne — sundhed.dk angiver ét fælles voksen-interval (>18 år) uden kønsopdeling. Til orientering bemærker kilden, at MCH er ca. 10–20 % højere hos spædbørn i de første levemåneder end hos voksne; dette er ikke relevant for Aevias voksne målgruppe.

## Noter & forbehold til Judit
- **Enheden matcher IKKE direkte (unitMatches=false).** Danske laboratorier (fx Region Sjælland, Sysmex XN-platformen) rapporterer MCH (ERC-MCH, erytrocyt middelcelle hæmoglobinindhold) i **fmol**, ikke pg. Markøren i motoren kræver pg, så det danske fmol-interval er konverteret.
- **Konvertering:** 1 fmol = 16,11 pg (1 pg = 0,06207 fmol; etableret faktor, bekræftet via UNITSLAB-konverter og international litteratur).
  - 1,7 fmol × 16,11 = 27,39 → **27,4 pg**
  - 2,1 fmol × 16,11 = 33,83 → **33,8 pg**
- **Tosidet retning — begge ender fra det (konverterede) danske interval.** refLow = 27,4 pg, refHigh = 33,8 pg. Dette erstatter motorens nuværende udledte ±25 %-reference (20,25–41,25 pg), som er klinisk for bred: en øvre grænse på 41,25 pg ville maskere relevant makrocytær/hyperkrom afvigelse, og en nedre grænse på 20,25 pg ville maskere udtalt hypokromi (jernmangel).
- **Sammenhæng med Aevia optimal-zone:** Aevias optimal-zone (27–33 pg) ligger en anelse snævrere end det foreslåede kliniske referenceinterval (27,4–33,8 pg). Forskellen er marginal og skyldes afrunding/konvertering. Afklar med Judit, om reference og optimal-zone bevidst skal være let forskudte.
- **Vigtigt forbehold:** pg-tallene er **ikke** verbatim fra en dansk kilde — de er en afledt omregning af et verbatim fmol-interval. Hvis Aevia på sigt rapporterer MCH i fmol (som danske labs faktisk gør), bør markørens enhed og interval i stedet sættes til fmol (1,7–2,1) for at undgå unødig konvertering og afrundingsstøj. Anbefaling til Judit: overvej om MCH bør køre i fmol fremfor pg for at matche dansk laboratoriepraksis.
- **Klinisk fortolkning:** Lav MCH (hypokromi) ses typisk ved jernmangelanæmi og thalassæmi; høj MCH (hyperkromi) ses ved makrocytær anæmi (B12-/folatmangel), reticulocytose eller alkohol/leverpåvirkning. MCH bør altid fortolkes sammen med MCV, hæmoglobin og evt. ferritin/B12/folat.
- **Laboratorievariation:** sundhed.dk anfører eksplicit, at referenceintervaller kan variere mellem laboratorier afhængigt af analysemetode og referencepopulation.
