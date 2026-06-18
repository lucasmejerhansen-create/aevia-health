# ApoA1 — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `apoa1` · **Enhed:** g/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 1.0 | åben |
| Aevia optimal-zone | 1.4 | 2 |
| Motorens udledte ref. (±25%, erstattes) | 1.05 | åben |

For højere-er-bedre-retningen er den øvre ende åben (refHigh = null), og refLow sættes til den mest inkluderende voksne nedre grænse på tværs af køn fra kilden: **1,0 g/L** (mænds nedre grænse, metodebok.no/Rikshospitalet). Bemærk at kvinders nedre grænse er ~0,1 g/L højere (1,1 g/L). At vælge den laveste (mænds) nedre grænse undgår at falsk-flage raske mænd; Judit bør beslutte, om der i stedet ønskes en kønsopdelt eskaleringsgrænse.

## Evidens
- **Kilde:** Brukerhåndbok i medisinsk biokjemi (metodebok.no), Oslo universitetssykehus — Rikshospitalet/Ullevål (Avdeling for medisinsk biokjemi). Korroboreret af Region Norrbotten Klinisk Kemi (SE).
- **URL:** https://metodebok.no/index.php?action=topic&item=Q5RwQMBK
- **Verbatim citat:** "Referanseområde — Kvinner: 1,1 - 2,3 g/L · Menn: 1,0 - 2,0 g/L" (metodebok.no, Apolipoprotein A1 (Apo A-1), Rikshospitalet/OUS, oppdatert 21.05.2026). Region Norrbotten (S-Apolipoprotein A1): "Kvinnor: 1,2-2,3 g/L / Män: 1,1-2,0 g/L".
- **Bekræftet ved gen-fetch:** Ja. WebFetch returnerede HTTP 403, men siden blev hentet direkte (curl med browser-user-agent, HTTP 200). I den hentede HTML står referenceområdet ordret: "Referanseområde Kvinner: 1,1 - 2,3 g/L Menn: 1,0 - 2,0 g/L", i enheden g/L — ingen konvertering nødvendig (unitMatches=true). Siden bekræfter også markøren (ApoA1 = vigtigste apolipoprotein i HDL; lav p-apoA1 indikerer øget risiko). Den svenske korroboration (Region Norrbotten) kunne ikke gen-hentes direkte (vardgivarwebben: 404 på den fundne URL; nllplus.se: timeout), men uafhængigt websøgeresultat bekræfter samme størrelsesorden og enhed (ønskeniveau >1,25 g/L kvinder / >1,15 g/L mænd; generelt normalområde ~0,76–2,14 g/L).
- **Confidence:** low — den primære numeriske kilde er nordisk (NO), ikke dansk. Intet primært dansk numerisk referenceinterval kunne verificeres: sundhed.dk/Lægehåndbogen omtaler kun apo A-I kvalitativt i HDL-/kolesterol-artiklerne uden talinterval, og den autoritative danske KVG-håndbog (referenceintervaller.dk / itsundhed.dk's "Den Sande Database") var ikke tilgængelig fra dette miljø (ECONNREFUSED). De to nordiske g/L-kilder (NO + SE) er dog enige inden for ~0,1 g/L, er IFCC/immunturbidimetri-baserede og i samme enhed (g/L), hvilket understøtter klinisk plausibilitet for en voksen dansk befolkning.

## Køns-/alders-specifikt
Kønsspecifikt. metodebok.no (NO): Kvinder 1,1–2,3 g/L; Mænd 1,0–2,0 g/L. Region Norrbotten (SE): Kvinder 1,2–2,3 g/L; Mænd 1,1–2,0 g/L. Kvinder ligger ca. 0,1 g/L højere end mænd i begge ender i begge kilder. Det rapporterede samlede interval 1,0–2,3 g/L spænder over begge køn (nedre = mænds nedre, øvre = kvinders øvre). For en højere-er-bedre-markør er det den nedre grænse, der eskalerer — derfor er refLow sat til den laveste (mænds) nedre grænse, 1,0 g/L, for at undgå falsk-flag af raske mænd.

## Noter & forbehold til Judit
- **Enhed:** g/L — matcher motoren direkte, ingen konvertering. (Internationale kilder bruger ofte mg/dL; 1 g/L ≈ 100 mg/dL.)
- **Ingen verificeret dansk primærkilde:** Intet primært dansk numerisk referenceinterval kunne findes/verificeres. sundhed.dk/Lægehåndbogen nævner kun apo A-I kvalitativt ("Der er en meget høj korrelation mellem plasmakoncentrationerne af HDL-kolesterol og apo A-I") uden talinterval. Den danske KVG-håndbog (referenceintervaller.dk / itsundhed.dk) er den autoritative danske kilde, men kunne ikke tilgås (ECONNREFUSED; PDF-håndbogen indeholder kun metode, ikke analyselisten). Derfor er nordiske g/L-kilder (NO metodebok.no + SE Region Norrbotten) anvendt — samme enhed, IFCC-baseret, enige inden for ~0,1 g/L. Confidence sat til low af denne grund. Judit bør, om muligt, slå apoA1 op i den danske KVG-/Den Sande Database og erstatte med dansk værdi.
- **Risiko-/signalgrænser ≠ referenceinterval:** DSKB-signalværdier (Ugeskriftet, plasmalipider hos ikke-fastende) angiver et klinisk handlings-/signalniveau: ApoA1 ≤1,25 g/L flages som forhøjet risiko. EAS/EFLM anbefaler kommentering ved ApoA1 ≤1,2 g/L (mænd) / ≤1,4 g/L (kvinder). Dette er risiko-/kommenteringsgrænser, IKKE befolkningsbaserede referenceintervaller. Bemærk at det foreslåede refLow på 1,0 g/L (populationsnormal) ligger UNDER disse risikogrænser — for en longevity-klinik kan Judit overveje en strammere eskaleringsgrænse (fx ≥1,2–1,25 g/L) frem for populationsnormalen.
- **Konsistens med Aevia-zonen:** Aevias optimal-zone 1,4–2 g/L ligger inden for og i den øvre/gunstige del af referenceintervallet, konsistent med "højere-er-bedre". Den øvre zonegrænse (2 g/L) svarer til mændenes øvre referencegrænse; kvinders øvre er 2,3 g/L.
- **Akutfaseprotein:** ApoA1 falder ved akut sygdom. Kilden anbefaler at vente 3 uger efter let sygdom og 3 måneder efter alvorlig sygdom (fx hjerteinfarkt) før måling. Relevant for tolkning af lave værdier.
