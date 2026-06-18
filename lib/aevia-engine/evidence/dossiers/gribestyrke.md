# Gribestyrke — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `gribestyrke` · **Enhed:** kg · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 27 | åben |
| Aevia optimal-zone | 42 | 60 |
| Motorens udledte ref. (±25%, erstattes) | 31.5 | åben |
| Kvinde-optimal (motor) | 26 | 42 |

## Evidens
- **Kilde:** Ugeskrift for Læger (Ugeskriftet.dk) — "Systematisk måling af fysisk funktion hos voksne patienter på tværs af diagnoser". Refererer den europæiske sarkopeni-algoritme (EWGSOP2, Cruz-Jentoft et al., Age and Ageing 2019) samt danske dekade-referenceværdier (18–90+ år) udledt af tre danske befolkningsstudier/referencematerialer (i alt 29.617 personer). Bekræftet uafhængigt af Sundhedsstyrelsen og dansk fysioterapeutisk praksis (fysio.dk / Dansk Selskab for Fysioterapi i Gerontologi og Geriatri).
- **URL:** https://ugeskriftet.dk/videnskab/systematisk-maling-af-fysisk-funktion-hos-voksne-patienter-pa-tvaers-af-diagnoser
- **Verbatim citat:** "27 kg for mænd og 16 kg for kvinder"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Ugeskriftet-artiklen bekræftede citatet ORDRET ("27 kg for mænd og 16 kg for kvinder") og enheden er kg (ingen konvertering nødvendig, unitMatches=true). Artiklen bekræfter desuden, at den udvikler danske referenceværdier for hver dekade fra 18- til 90+-årige baseret på 29.617 personer. Bemærk: artiklen citerer "den europæiske algoritme" men nævner ikke navnet EWGSOP2 eksplicit i fritekst. Den kønsspecifikke cut-off (27/16 kg) blev derudover bekræftet uafhængigt via flere kilder, der eksplicit tilskriver værdierne EWGSOP2 (Cruz-Jentoft et al. 2019, sat til 2,5 SD under britisk normativt gennemsnit) og bekræfter, at de anvendes i dansk klinisk praksis.
- **Confidence:** medium — den kønsspecifikke nedre cut-off (27 kg mænd / 16 kg kvinder) er bekræftet ordret i den primære danske kilde, corroboreret af flere uafhængige kilder, og enheden matcher (kg). Confidence er IKKE high fordi: (1) dette er en international tærskel (EWGSOP2/britisk normmateriale) anvendt i Danmark, ikke et oprindeligt dansk lab-referenceinterval; (2) det er en sarkopeni-/patologi-tærskel for ældre/geriatri, ikke et alment voksen-normalområde; (3) de eksakte danske dekade-specifikke tal står kun i figur i artiklen, ikke i fritekst og kunne derfor ikke verbatim-verificeres.

## Køns-/alders-specifikt
Referencen er udpræget kønsspecifik. Den kliniske nedre tærskel (cut-off for nedsat muskelstyrke/probabel sarkopeni, EWGSOP2) er **27 kg for mænd og 16 kg for kvinder**. Aevias motor bruger 42–60 kg (mænd) / 26–42 kg (kvinder) som optimal-zone — disse ligger LANGT over sarkopeni-grænsen og afspejler "rask voksen-gennemsnit" snarere end den kliniske patologi-grænse. To danske studier antyder normalgennemsnit omkring 42,7 kg (mænd) og 27,2 kg (kvinder), hvilket understøtter optimal-zonen. Bemærk uoverensstemmelse: kvinde-zonens nedre ende (26 kg) ligger tæt på det MANDLIGE normalgennemsnit, ikke den kvindelige kliniske grænse (16 kg) — kvinde-zonen er altså sat ambitiøst/atletisk. Gribestyrke er desuden stærkt aldersafhængig (falder fra ca. 30–40-års alderen); danske dekade-specifikke referenceværdier findes for 18–90+ år med farvekodning (grøn = gns. ±1 SD = normal, gul = nedsat, rød = <–2 SD = stærkt nedsat).

## Noter & forbehold til Judit
- **Dette er IKKE et lab-referenceinterval, men en klinisk/funktionel tærskel.** Gribestyrke (håndgrebsstyrke, målt med dynamometer i kg) har ikke et klassisk statistisk lab-referenceinterval. Den foreslåede nedre værdi (27 kg) er sarkopeni-cut-off'en fra EWGSOP2, dvs. en diagnostisk patologi-grænse — primært udviklet til geriatri/ældre, ikke til screening af raske midaldrende. Vurdér om denne grænse overhovedet er den rette eskaleringsgrænse for Aevias målgruppe.
- **Retning (højere-er-bedre):** Lavere = patologisk (nedsat muskelstyrke/sarkopeni), højere = bedre. Der findes ingen klinisk meningsfuld ØVRE grænse → refHigh = null (åben). Den foreslåede refLow = 27 kg.
- **VIGTIGT — kønsvalg af nedre grænse:** Den foreslåede refLow = 27 kg er den MANDLIGE cut-off. For kvinder er den kliniske cut-off 16 kg. Hvis motoren anvender ét køns-uafhængigt tal, vil 27 kg overflage mange raske kvinder som "for lav" (kvinder ligger normalt 16–27+ kg). **Anbefaling: behold kønsspecifik tilgang** — nedre eskaleringsgrænse 27 kg (mænd) / 16 kg (kvinder).
- **Optimal-zone vs. patologi-grænse — stort spring:** Motorens udledte ref. (31,5 kg) ligger mellem den kvindelige cut-off (16) og den mandlige cut-off (27) og er hverken fugl eller fisk. Den erstattes af den kliniske cut-off. Bemærk det store spring mellem patologi-grænsen (27/16 kg) og optimal-zonen (42/26 kg): værdier i 27–42 kg-intervallet er IKKE sarkopene, men ligger under Aevias optimal-mål. Overvej en tre-trins logik: rød <27/16 (klinisk nedsat), gul 27–42 / 16–26 (under optimal), grøn ≥42/26 (optimal). Brug 42/27 kg som "optimal/normal"-mål, IKKE som eskaleringsgrænse.
- **Enhed:** kg — ingen konvertering foretaget (unitMatches=true). Forudsætter standard-dynamometer (typisk Jamar) og højeste af flere forsøg, dominant hånd — målemetoden bør standardiseres for at tallene er sammenlignelige.
- **Alders-/måleforbehold (fortolkning):** Gribestyrke falder med alderen; en enkelt værdi bør fortolkes mod dekade- og kønsspecifik norm (danske referenceværdier 18–90+ år findes i artiklens figur, men de eksakte tal kunne ikke verbatim-verificeres her — anbefal at Judit indhenter figuren/testmanualen fra fysio.dk/BFH for de fulde dekade-tabeller, hvis aldersjusteret klassifikation ønskes).
