# VO2-max — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `vo2max` · **Enhed:** ml/kg/min · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 35 | åben |
| Aevia optimal-zone | 42 | 60 |
| Motorens udledte ref. (±25%, erstattes) | 31.5 | åben |
| Kvinde-optimal (motor) | 36 | 52 |

## Evidens
- **Kilde:** Danske kondital-/VO2max-normtabeller (Per-Olof Åstrands skandinaviske normaltabeller, suppleret med danske data af Morten Zacho) — formidlet konsistent på bl.a. coachlykke.dk, fitnessbuddy.dk, motionsplan.dk og iform.dk. Mortalitetstærsklen (under 35 mænd / 28 kvinder) refererer til epidemiologiske kohortestudier.
- **URL:** https://coachlykke.dk/traening/kondital/
- **Verbatim citat:** "Man har i flere store studier set en øget risiko for tidlig død ved kondital på under 35 mL/kg/min for mænd og 28 mL/kg/min for kvinder." (gen-bekræftet via flere danske kilder, bl.a. coachlykke.dk, fitnessbuddy.dk og motionsplan.dk). Klassifikationstabel (coachlykke.dk, mænd 40-49 år): Lav <31, Middel 31-38, God 39-45, Meget god 46-53, Fremragende >53 ml/kg/min. Kvinder 40-49 år: Lav <25, Middel 25-32, God 33-39, Meget god 40-46, Fremragende >46 ml/kg/min.
- **Bekræftet ved gen-fetch:** Ja — med forbehold. Gen-fetch af coachlykke.dk bekræftede, at siden indeholder køns- OG aldersopdelte kondital-/VO2max-klassifikationstabeller i ml/kg/min (fem kategorier: Lav/Middel/God/Meget god/Fremragende). Den nøjagtige tabel-formatering afveg en smule fra researcherens citatstreng (researcheren synes at have parafraseret/syntetiseret på tværs af coachlykke.dk + fitnessbuddy.dk + iform.dk), men substansen — kategorier, kønsgab på ~6-9 ml/kg/min og mortalitetstærsklerne — er konsistent på tværs af kilderne. Selvstændig websøgning bekræftede mortalitetstærsklen (under 35 mænd / 28 kvinder ml/kg/min → øget risiko for tidlig død) næsten ordret. Enheden er ml/kg/min overalt — ingen konvertering nødvendig.
- **Confidence:** low — fordi (1) INGEN primær dansk myndigheds-/lab-kilde (Sundhedsstyrelsen, DSKB, sundhed.dk/Lægehåndbogen, hospitalslaboratorier) definerer et formelt referenceinterval; (2) kilderne er danske trænings-/sundhedssites snarere end klinisk-biokemiske referencer; (3) tærsklerne (35/28) stammer fra epidemiologiske kohortestudier (bl.a. internationale), ikke fra et dansk lab-referenceinterval. Flere danske kilder er dog indbyrdes konsistente om middel-/god-båndene og mortalitetstærsklerne, hvilket understøtter validiteten af tallene som normbefolknings-reference.

## Køns-/alders-specifikt
Referencen er stærkt KØNS- OG ALDERSAFHÆNGIG — ét enkelt voksen-interval er derfor en forenkling.

**Kønsgab:** Mænd ligger typisk ~6-9 ml/kg/min højere end kvinder.

**Aldersopdelt (verbatim, coachlykke.dk-stil — Lav / Middel / God / Meget god / Fremragende):**
- Mænd 30-39 år: <33 / 33-40 / 41-48 / 49-56 / >56
- Mænd 40-49 år: <31 / 31-38 / 39-45 / 46-53 / >53
- Kvinder 30-39 år: <27 / 27-34 / 35-42 / 43-50 / >50
- Kvinder 40-49 år: <25 / 25-32 / 33-39 / 40-46 / >46

**Mortalitetstærskel:** Kondital under ~35 (mænd) / ~28 (kvinder) ml/kg/min knyttes til øget risiko for tidlig død.

Dette understøtter Aevias kønsspecifikke optimal-zoner: mænd 42-60, kvinder 36-52 ml/kg/min. refLow = 35 er sat som den danske mortalitets-/sundhedstærskel for mænd; for kvinder ville den tilsvarende nedre tærskel være ~28 ml/kg/min. Hvis motoren kan differentiere efter køn, bør den kønsspecifikke nedre grænse anvendes (mænd 35 / kvinder 28).

## Noter & forbehold til Judit
- **IKKE et klinisk lab-referenceinterval:** VO2-max er et FYSIOLOGISK/konditionsmål, ikke en blodprøve. Det findes ikke som NPU-analyse på sundhed.dk/Lægehåndbogen, hos DSKB eller i danske hospitalslaboratoriers analysefortegnelser (Rigshospitalet, AUH, OUH, Hvidovre, Aalborg). Den autoritative danske norm er kondital-klassifikationstabellen baseret på Per-Olof Åstrands skandinaviske normaltabeller, suppleret med danske børne-/ungedata af Morten Zacho. Confidence er derfor low på trods af god kilde-konsistens.
- **refLow = 35:** Dansk mortalitets-/sundhedstærskel for MÆND. Kvinders tilsvarende tærskel er ~28 ml/kg/min — overvej kønsdifferentiering i motoren.
- **refHigh = null (åben):** Retningen er højere-er-bedre, så kun den nedre grænse skal eskalere. Den i konteksten nævnte clinicalHigh=60 svarer til "fremragende/meget god" øvre normalgrænse for raske voksne, men er ikke en øvre eskaleringsgrænse: højere VO2-max er udelukkende gunstigt. Eliteatleter ligger højere (mænd 70+, kvinder 60+) uden at det er patologisk — derfor ingen øvre referencegrænse.
- **Enhed:** ml/kg/min i alle kilder, matcher motoren — ingen konvertering nødvendig.
- **Stærk alders- OG kønsafhængighed:** Ét voksen-interval (35–åben) er en forenkling. Hvis Aevia kan tage højde for alder og køn, bør de aldersopdelte bånd ovenfor anvendes i stedet for et enkelt fast interval.
- **Kilde-type-forbehold:** Tallene er konsistente på tværs af danske trænings-/sundhedssites og epidemiologiske kohortestudier, men ingen dansk klinisk-biokemisk myndighed har formaliseret et referenceinterval. Judit bør afgøre, om dette normbefolknings-niveau er tilstrækkeligt til klinisk formidling, eller om VO2-max skal markeres som et ikke-lab/livsstils-mål med tilsvarende forsigtig kommunikation.
- **Citat-afvigelse:** Researcherens verbatim-citat afveg let fra den faktisk gen-fetchede tabel (parafrase/syntese på tværs af flere danske sites). Substansen er bekræftet, men den eksakte ordlyd i researcherens citat bør ikke citeres ordret som ét enkelt kildecitat.
