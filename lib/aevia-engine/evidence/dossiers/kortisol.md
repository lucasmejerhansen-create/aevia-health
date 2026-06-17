# Kortisol (morgen) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `kortisol` · **Enhed:** nmol/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 133 | 537 |
| Aevia optimal-zone | 250 | 550 |
| Motorens udledte ref. (±25%, erstattes) | 187.5 | 687.5 |

## Evidens
- **Kilde:** Sygehus Sønderjylland, Blodprøver, Biokemi og Immunologi – analysefortegnelse for P-Cortisol (Kortisol;P, NPU01787)
- **URL:** https://sygehussonderjylland.dk/media/22sno1xw/cortisol-stofk-p.pdf
- **Verbatim citat:** "Referenceinterval: 133-537 nmol/L for prøver taget mellem Kl. 6 og 10 om morgenen; 68-327 nmol/L for prøver taget mellem Kl. 16 og 20 om eftermiddagen/aften"
- **Bekræftet ved gen-fetch:** Ja. PDF'en blev hentet og teksten ekstraheret direkte (pypdf). Analysebladet bekræfter ordret: Analysenavn "P—Cortisol; stofk.", IUPAC-kode "NPU01787", Prøvemateriale "1 mL plasma", og under "Referenceinterval": "133-537 nmol/L for prøver taget mellem Kl. 6 og 10 om morgenen" samt "68-327 nmol/L for prøver taget mellem Kl. 16 og 20 om eftermiddagen/aften". Analyseusikkerhed 15 %. Enheden er nmol/L — ingen konvertering nødvendig. Seneste ændring: 23.06.2016.
- **Confidence:** high — Citatet står ordret i den officielle kilde, enheden matcher, og morgenintervallet (133–537 nmol/L) bekræftes på tværs af danske/nordiske Roche-baserede laboratorier samt sundhed.dk/Lægehåndbogen.

## Køns-/alders-specifikt
Ingen separate referenceintervaller for køn eller alder i kilden; samme morgeninterval (133–537 nmol/L) anvendes for voksne mænd og kvinder. Intervallet gælder dog IKKE for gravide/ammende, kvinder i p-piller eller patienter i kortison-/kortisolbehandling — disse har forhøjede totale kortisolværdier pga. øget CBG (cortisol-binding globulin) eller eksogent tilskud. For disse grupper bør resultatet tolkes med forbehold (evt. frit kortisol/anden test).

## Noter & forbehold til Judit
- **Enhed:** Matcher (nmol/L) — ingen konvertering.
- **Tidsafhængighed (døgnrytme):** Værdierne er kraftigt tidsafhængige. Det foreslåede interval gælder KUN morgenprøver (kl. 6–10). Motorens "morgen"-zone bør tolkes for morgenprøver. Eftermiddagsinterval (kl. 16–20) er 68–327 nmol/L og ligger udenfor dette dossiers scope. En tilfældigt udtaget prøve har iflg. kilden kun begrænset diagnostisk værdi.
- **Kildegrundlag:** Sygehus Sønderjyllands officielle analyseblad (IUPAC/NPU01787). Morgenintervallet bekræftes på tværs af danske hospitalslaboratorier (BCC/Region Syddanmark) og stemmer med nordiske Roche-baserede metoder (Region Norrbotten 101–536; Södra Älvsborg 102–535).
- **Klinisk tolkning (Lægehåndbogen/sundhed.dk):** Angiver IKKE ét fast morgeninterval, men metodeafhængige beslutningsgrænser: morgenkortisol <100 nmol/L taler stærkt for binyrebarkinsufficiens; >350–400 nmol/L taler imod. Diagnosen hviler i sidste ende på Synacthen-test. Disse grænser bør indgå i den kliniske tolkning.
- **Forhold til Aevia optimal-zone:** Aevias nuværende optimal-zone 250–550 nmol/L ligger i den øvre/midterste del af det kliniske morgeninterval og er strammere i bunden end den kliniske nedre grænse på 133. Til overvejelse for Judit: om optimal-zonen skal lægges tættere på den kliniske nedre grænse, eller om den bevidste indsnævring i bunden ønskes bevaret (longevity-perspektiv).
- **Metodeforbehold:** Kortisol-referenceintervaller er metode-/assay-afhængige. Det foreslåede interval afspejler en Roche-baseret immunoassay-metode. Hvis Aevias laboratorium bruger en anden platform, bør intervallet revalideres mod dén metodes referenceinterval.
