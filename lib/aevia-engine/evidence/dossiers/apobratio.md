# ApoB/ApoA1-ratio — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `apobratio` · **Enhed:** ratio · **Kategori:** hjerte · **Type:** beregnet/afledt markør
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 0.9 |
| Aevia optimal-zone | 0.3 | 0.6 |
| Motorens udledte ref. (±25%, erstattes) | åben | 0.75 |


## Evidens
- **Kilde:** AMORIS-kohorten (svensk, PLOS Medicine 2021) — risikobånd; suppleret med FINRISK 2007 (finsk, Clin Chim Acta 2011) — kønsspecifikke referenceintervaller. INGEN dansk kilde fundet.
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC8635349/
- **Verbatim citat:** "Three tentive levels of risk associated with the apoB/apoA-1 ratio are shown: low risk, 0.2–0.6 (green); medium risk, 0.61–0.9 (yellow); and high risk, 0.91–5.0 (red)."
- **Bekræftet ved gen-fetch:** Ja. Gen-hentet 2026-06-17. AMORIS-artiklen ("Long-term risk of a major cardiovascular event by apoB, apoA-1, and the apoB/apoA-1 ratio—Experience from the Swedish AMORIS cohort", PLoS Medicine 2021) bekræfter ordret risikobåndene: lav risiko 0,2–0,6 (grøn), moderat risiko 0,61–0,9 (gul), høj risiko 0,91–5,0 (rød). Enheden er dimensionsløs ratio (apoB g/L ÷ apoA-1 g/L). FINRISK 2007 (ScienceDirect/PubMed 21419755) blev gen-bekræftet: "The reference intervals for apoB/apoA-I ratio were 0.3-1.0 for men and 0.3-0.8 for women" (referencesample n=2828; tilhørende apoA-I 1,1–2,0 g/L mænd / 1,2–2,3 g/L kvinder, apoB 0,6–1,5 g/L mænd / 0,6–1,3 g/L kvinder). Dansk gen-fetch: sundhed.dk Lægehåndbogen (dyslipidæmi-artiklen) omtaler IKKE apoB/apoA1-ratioen og angiver ingen numeriske referenceintervaller for apoB/apoA1 — bekræfter at der ikke findes en dansk kilde.
- **Confidence:** low — Ingen dansk primærkilde findes; sundhed.dk/Lægehåndbogen, DSKB og danske hospitalslaboratorier (RH, AUH, OUH, Hvidovre, Aalborg) publicerer ikke et referenceinterval for den afledte ratio (kun apoB og apoA1 hver for sig). Kilde-hierarkiet falder derfor ned på nordisk/europæisk litteratur. Kilderne er desuden ikke helt enige: FINRISK angiver et statistisk referenceinterval (befolkningsfordeling), mens AMORIS/INTERHEART angiver risiko-cut-offs. Begge er dog bekræftet ordret og i korrekt enhed (dimensionsløs ratio, ingen konvertering).

## Køns-/alders-specifikt
FINRISK 2007 angiver kønsspecifikke referenceintervaller: **0,3–1,0 for mænd** og **0,3–0,8 for kvinder** (verbatim: "The reference intervals for apoB/apoA-I ratio were 0.3-1.0 for men and 0.3-0.8 for women"). De almindeligt citerede høj-risiko cut-offs i litteraturen (AMORIS/INTERHEART) er ca. **0,9 for mænd** og **0,8 for kvinder**. AMORIS' risikobånd (0,2–0,6 / 0,61–0,9 / 0,91–5,0) er derimod kønsuafhængige. Den foreslåede refHigh på 0,9 svarer til den kønsneutrale AMORIS-grænse (start på høj risiko) og til mænds cut-off; for kvinder er en strammere grænse (~0,8) klinisk mere passende. Judit bør tage stilling til, om markøren skal køns-differentieres (0,9 mænd / 0,8 kvinder).

## Noter & forbehold til Judit
- **Afledt mål, ikke et klassisk lab-interval:** ApoB/ApoA1-ratioen er en beregnet markør (apoB ÷ apoA1). For en lavere-er-bedre afledt markør er det relevante en mål-/tærskelværdi, ikke et tosidet normalfordelt lab-interval. Derfor er refLow sat til null (åben) — lavere ratio er bedre, og der findes ingen klinisk meningsfuld nedre grænse (FINRISK' nedre 0,3 er blot den nedre ende af befolkningsfordelingen, ikke en "for lav"-grænse).
- **Ingen enhedskonvertering:** Ratioen er dimensionsløs i alle kilder (apoB g/L ÷ apoA1 g/L). unitMatches = true.
- **Uenige kilder / ingen dansk kilde:** AMORIS' lav-risiko/optimal-bånd 0,2–0,6 bekræfter direkte Aevias optimal-zone 0,3–0,6. Motorens nuværende udledte øvre reference (0,75) ligger fornuftigt mellem optimal (0,6) og høj-risiko (0,9), men en litteraturbaseret eskalering bør hellere bruge ~0,9 som høj-risiko-tærskel (AMORIS: moderat 0,61–0,9; høj ≥0,91). Vær opmærksom på spændet mellem FINRISK' statistiske referenceinterval og AMORIS/INTERHEART' risiko-cut-offs — de besvarer to forskellige spørgsmål ("hvad er normalt i befolkningen" vs. "hvornår stiger risikoen").
- **Forslag til beslutning:** (a) refHigh = 0,9 (kønsneutral, AMORIS høj-risiko-tærskel) som her, eller (b) køns-differentieret 0,9 mænd / 0,8 kvinder (FINRISK/AMORIS). Optimal-zonens øvre grænse (0,6) er solidt understøttet af AMORIS' grønne bånd og bør beholdes uanset valg af eskaleringsgrænse.
- **Confidence = low** grundet manglende dansk kilde og kildernes forskellige metodik. Bør valideres klinisk af Judit før offentlig visning.
