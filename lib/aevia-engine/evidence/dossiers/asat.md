# ASAT (AST) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `asat` · **Enhed:** U/L · **Kategori:** lever · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 45 |
| Aevia optimal-zone | 10 | 35 |
| Motorens udledte ref. (±25%, erstattes) | åben | 43.75 |


## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (klinisk biokemi, blodprøver: ASAT)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/asat/
- **Verbatim citat:** "Kvinder over 18 år: 15-35 U/L, Mænd over 18 år: 15-45 U/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk Lægehåndbogen bekræfter de voksne intervaller ordret i enheden U/L (kvinder over 18 år: 15-35 U/L; mænd over 18 år: 15-45 U/L). Samme side angiver aldersspecifikke børneintervaller (0 d-1 måned: 20-100 U/L; 1 måned-1 år: 15-65 U/L; 1-12 år: 10-60 U/L; piger 12-18 år: 10-60 U/L; drenge 12-18 år: 15-45 U/L) samt at gravide ses 10-15 % højere værdier i 3. trimester og op til ca. 110 U/L omkring fødslen. Sekundær dansk hospitalskilde (Region Sjælland, Klinisk Biokemi, lmv.regionsjaelland.dk) bekræfter uafhængigt de helt samme voksne værdier: kvinder 15-35 U/L, mænd 15-45 U/L.
- **Confidence:** high — Entydig primær dansk kilde øverst i hierarkiet (sundhed.dk Lægehåndbogen), citatet er bekræftet ordret, enheden matcher (U/L, ingen konvertering), og en uafhængig dansk hospitalslaboratorie-kilde (Region Sjælland) angiver de identiske intervaller. Værdierne er klinisk plausible for en voksen dansk population.

## Køns-/alders-specifikt
Køns- og aldersspecifikt. Voksne kvinder (over 18 år): 15-35 U/L. Voksne mænd (over 18 år): 15-45 U/L — dvs. den øvre grænse er højere hos mænd. Børn/unge har generelt højere intervaller: 0 d-1 måned: 20-100 U/L; 1 måned-1 år: 15-65 U/L; 1-12 år: 10-60 U/L; piger 12-18 år: 10-60 U/L; drenge 12-18 år: 15-45 U/L. Gravide: 10-15 % højere værdier i 3. trimester, op til ca. 110 U/L omkring fødslen.

## Noter & forbehold til Judit
- **Køns-split på øvre grænse — vigtigste forbehold:** Kilden angiver to forskellige voksne øvre grænser: 35 U/L for kvinder og 45 U/L for mænd. Den foreslåede refHigh = 45 U/L er sat til den bredeste voksne øvre grænse (mænd) for at undgå falsk-positive flag hos mænd. Hvis motoren understøtter kønsopdelte grænser, bør den kliniske øvre reference være 35 U/L for kvinder og 45 U/L for mænd. Med én fælles kønsneutral grænse på 45 vil kvinder med ASAT 36-45 U/L (over deres egen kønsspecifikke øvre grænse) ikke blive flaget — dette er en bevidst afvejning, der bør valideres.
- **Retning:** Markøren er lavere-er-bedre, så refLow sættes til null (åben) og kun den øvre grænse eskalerer. refHigh = 45 (eller kønsopdelt 35/45).
- **Forhold til Aevia optimal-zone:** Aevias nuværende optimal-zone (10-35 U/L) svarer netop til kvinders øvre grænse (35). Mange danske labs sætter et kønsneutralt klinisk loft ved ~40 U/L, og sundhed.dk sætter mændenes grænse ved 45. Optimal-zonen (≤35) er altså strammere end den foreslåede kliniske referencegrænse — det er konsistent med 'lavere-er-bedre' og med, at lavere ASAT er gunstigt.
- **Enhed:** U/L — matcher Aevias enhed, ingen konvertering nødvendig.
- **Sekundær verifikation:** Region Sjællands kliniske biokemi-dokument bekræfter de identiske voksne værdier (kvinder 15-35, mænd 15-45 U/L). Forsøg på verifikation via Region Nordjylland (pri.rn.dk/Sider/10307.aspx) i researcherens fund returnerede kun 'Loading...' og kunne ikke bekræftes — men dette opvejes af den uafhængige bekræftelse fra Region Sjælland.
- **Bemærk:** ASAT-nedre grænse (15) er ens for begge køn hos voksne, men er ikke klinisk relevant i denne markørs retning (lav ASAT er ikke en bekymring).
