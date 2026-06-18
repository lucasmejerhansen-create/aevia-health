# Monocytter — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `monocytter` · **Enhed:** ×10⁹/L · **Kategori:** blodstatus · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 0.2 | 0.7 |
| Aevia optimal-zone | 0.2 | 0.8 |
| Motorens udledte ref. (±25%, erstattes) | 0.15 | 1 |


## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen (B-Leukocytter, fraktionerede)
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/b-leukocytter-fraktionerede/
- **Verbatim citat:** "Monocytter 0,20 - 0,70 mia/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-hentede siden og bekræftede ordret "0,20 - 0,70 mia/L" for Monocytter. Samme side angav konsistent de øvrige fraktionerede leukocytter (Neutrofilocytter 2,00–7,00; Lymfocytter 1,30–3,50; Eosinofilocytter <0,50; Basofilocytter <0,10 mia/L), hvilket bekræfter enheds-konteksten "mia/L" = ×10⁹/L. Ingen enhedskonvertering nødvendig.
- **Confidence:** high — Primær tier-1-kilde (sundhed.dk Patienthåndbogen) bekræftet ordret med matchende enhed; værdien er klinisk plausibel for voksne; understøttet af et dansk hospitalslaboratorium med kun mindre afvigelse på øvre grænse.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel for voksne. Bemærk dog markant alders-afhængighed hos børn: Bornholms Hospital (Laboratorievejledningen, https://www.bohlab.dk/index.php/epc00171) angiver højere intervaller tidligt i livet — 0–14 dage: 0,52–1,77; 14 dage–2 mdr: 0,28–1,38; 2–6 mdr: 0,24–1,17; 6 mdr–18 år: 0,21–0,77 ×10⁹/L — der gradvist nærmer sig voksenniveau. Det foreslåede interval gælder voksne (≥18 år).

## Noter & forbehold til Judit
- **Enhed:** "mia/L" (milliarder per liter) = ×10⁹/L. Direkte 1:1, ingen konvertering.
- **Kilde-uenighed på øvre grænse:** sundhed.dk Patienthåndbogen (tier 1) angiver 0,20–0,70, mens Bornholms Hospital (tier 3, gen-hentet og bekræftet) angiver 0,2–0,8 for voksne (18–125 år). Begge er enige om nedre grænse (0,2), men afviger på øvre grænse (0,7 vs 0,8). Jeg har valgt det konservative tier-1-tal (0,7) som foreslået øvre grænse, jf. kilde-hierarkiet. Aevias nuværende optimal-zone (0,2–0,8) matcher hospitalslaboratoriet, ikke Patienthåndbogen.
- **Beslutningspunkt til Judit:** Vælg konservativ tilgang (0,2–0,7, sundhed.dk) eller bred klinisk tilgang (0,2–0,8, hospitalslab). Den bredeste danske kliniske dækning for voksne er ca. 0,2–0,8. Forskellen på øvre grænse er klinisk lille og overlappende.
- **Retning:** tosidet — både lav (monocytopeni, fx ved knoglemarvspåvirkning/svær infektion/steroidbrug) og høj (monocytose, fx ved kronisk inflammation, infektion, myeloproliferativ sygdom) kan være klinisk relevante; derfor begge ender lukkede.
