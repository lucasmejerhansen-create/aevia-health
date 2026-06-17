# D-vitamin (25-OH-D) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `vitd` · **Enhed:** nmol/L · **Kategori:** vitaminer · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 50 | 160 |
| Aevia optimal-zone | 75 | 120 |
| Motorens udledte ref. (±25%, erstattes) | 56.25 | 150 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk Biokemisk Afdeling, Aarhus Universitetshospital)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/vitamin-d/
- **Verbatim citat:** "Referenceinterval: 50 - 160 nmol/L (Klinisk Biokemisk Afdeling, Aarhus Universitetshospital)"
- **Bekræftet ved gen-fetch:** Ja. WebFetch af URL'en (17-06-2026) returnerede citatet ordret, i enheden nmol/L, med korrekt laboratorie-attribution (Klinisk Biokemisk Afdeling, Aarhus Universitetshospital). De kliniske grænseværdier blev ligeledes bekræftet ordret: svær mangel <12 nmol/L, mangel 12-25 nmol/L, insufficiens 25-50 nmol/L, tilstrækkeligt niveau >50 nmol/L, optimalt niveau (osteoporose/nyresygdom) 75-150 nmol/L, toksisk >200 nmol/L.
- **Confidence:** high — Øverste kilde i hierarkiet (Lægehåndbogen på sundhed.dk), enheden matcher uden konvertering, citatet er bekræftet ordret ved gen-fetch, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel i referenceintervallet. Kilden angiver ikke køns- eller aldersspecifikke intervaller. Værdier er dog stærkt sæsonafhængige (se forbehold).

## Noter & forbehold til Judit
- **Sæsonafhængighed (vigtigt):** Det statistiske referenceinterval (50-160 nmol/L) er bestemt om sensommeren, hvor værdierne er højest efter sol-eksponering. Væsentligt lavere værdier ses efter vinter (særligt marts/april). Det rene statistiske referenceinterval er derfor sæsonafhængigt og bør tolkes med forsigtighed uden for sensommeren.
- **Klinisk grænseværdi vs. statistisk reference:** Lægehåndbogen angiver KLINISKE grænseværdier, som ofte er mere relevante for vurdering end det rene statistiske referenceinterval. Den nedre klinisk meningsfulde grænse er reelt 50 nmol/L (sufficiens — "tilstrækkeligt niveau for de fleste >50 nmol/L"), hvilket falder sammen med den foreslåede nedre referencegrænse. Den øvre grænse på 160 nmol/L er den statistiske referencegrænse fra Aarhus; toksicitet indtræder først >200 nmol/L.
- **Kliniske trin (til orientering):** svær mangel (mulig osteomalaci/rakitis) <12; mangel 12-25; insufficiens 25-50; tilstrækkeligt >50; optimalt (ved osteoporose/nyresygdom) 75-150; toksisk >200 (nmol/L).
- **Aevia optimal-zone:** Aevias nuværende optimal-zone (75-120 nmol/L) ligger godt inden for det klinisk anbefalede optimum-spænd (75-150 nmol/L). Ingen ændring foreslået her.
- **Enhed:** nmol/L matcher motorens enhed — ingen konvertering nødvendig (bemærk dog at internationale kilder ofte bruger ng/mL; 1 ng/mL ≈ 2,5 nmol/L).
- **Beslutning til Judit:** Foreslået JSON-interval = 50-160 nmol/L (tosidet, fra Aarhus-referencen). Overvej om motoren i stedet bør bruge den kliniske sufficiens-grænse (50) som nedre og evt. en lavere øvre "advarsels"-grænse end den rent statistiske 160, givet at det optimale spænd kun går til 150 og toksicitet først indtræder >200.
