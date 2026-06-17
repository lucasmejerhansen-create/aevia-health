# C-peptid — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `cpeptid` · **Enhed:** pmol/L · **Kategori:** blodsukker · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 1630 |
| Aevia optimal-zone | 300 | 700 |
| Motorens udledte ref. (±25%, erstattes) | åben | 875 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, C-peptid)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/c-peptid/
- **Verbatim citat:** "379 - 1630 pmol/L (er hyppigt anvendt og er baseret på et dansk studie)"
- **Bekræftet ved gen-fetch:** Ja. Værdien "379 - 1630 pmol/L" fremgår ordret af kilden i korrekt enhed (pmol/L) og er beskrevet som hyppigt anvendt voksenreference baseret på et dansk studie. Kilden viser desuden separate fastende-intervaller fra Oslo Universitetshospital (voksne ≥18 år: 375-1480 pmol/L) samt alders- og kønsspecifikke intervaller for børn 6-17 år. En sekundær dansk hospitalskilde (Region Sjælland LMV, Proinsulin C-peptid; P) blev bekræftet at angive samme størrelsesorden (bredere interval ca. 260-1730 pmol/L).
- **Confidence:** high — Top-kilde i hierarkiet (sundhed.dk Lægehåndbogen), citat bekræftet ordret ved gen-fetch, enhed matcher (pmol/L, ingen konvertering nødvendig), og sekundær dansk hospitalskilde understøtter samme størrelsesorden.

## Køns-/alders-specifikt
Ingen klinisk relevant kønsforskel for voksne. Kønsspecifikke intervaller findes kun for børn 6-17 år (drenge generelt let lavere øvre grænse end piger). Aldersafhængighed: børn har lavere intervaller; koncentrationen er højere hos gravide i 2. og 3. trimester. Voksenintervallet 379-1630 pmol/L gælder fastende voksne.

## Noter & forbehold til Judit
- **Ingen enhedskonvertering:** Værdien er allerede i pmol/L (unitMatches=true).
- **Fastende-værdier:** Intervallet er fastende-værdier baseret på et dansk studie. Ikke-fastende prøver vil afvige.
- **Uenighed mellem kilder / laboratorievariation:** Lægehåndbogen understreger eksplicit betydelig variation mellem laboratorier afhængigt af målemetode og referencepopulation. Sekundær dansk kilde (Region Sjælland LMV) angiver et bredere interval ~260-1730 pmol/L — samme størrelsesorden, men lavere nedre og højere øvre grænse. Oslo Universitetshospital (citeret i samme kilde): voksne 375-1480 pmol/L.
- **Relevans for motoren (vigtig beslutning):** Det kliniske referenceinterval (øvre grænse ~1630-1730 pmol/L) ligger markant højere end Aevias nuværende optimal-zone (300-700) og den udledte øvre reference (875). Det kliniske normalområde er bredt og repræsenterer befolkningsfordeling — ikke en longevity-optimal zone. Judit bør afgøre om motorens øvre eskaleringsgrænse skal flugte med klinisk øvre (~1630, som foreslået her) eller bevares lavere (fx tættere på 875) af longevity-hensyn. Det foreslåede refHigh=1630 er det rene kliniske referenceinterval; den endelige eskaleringsgrænse er en klinisk-strategisk beslutning.
