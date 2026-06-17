# Prolaktin — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `prolaktin` · **Enhed:** mIU/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 80 | 580 |
| Aevia optimal-zone | 80 | 320 |
| Motorens udledte ref. (±25%, erstattes) | 60 | 400 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Prolactin), bekræftet af Region Sjælland Laboratorievejledning (LMV)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/prolactin/
- **Verbatim citat:** "Kvinder >18 år: 90 – 580 x 10⁻³ int.enh./L; Mænd >18 år: 80 – 460 x 10⁻³ int.enh./L (Prolaktin Monomer: kvinder 59 - 304 x 10⁻³ IU/L, mænd 69 - 266 x 10⁻³ IU/L)"
- **Bekræftet ved gen-fetch:** Ja. WebFetch af kilden bekræftede præcist de samme værdier for total-prolaktin: kvinder >18 år 90–580 ×10⁻³ int.enh./L og mænd >18 år 80–460 ×10⁻³ int.enh./L, samt monomer-prolaktin kvinder 59–304 og mænd 69–266 ×10⁻³ IU/L. Siden angiver desuden aldersopdelte intervaller for børn (fx kvinder 16 dage–3 år: 126–1343; 4–10 år: 62–402; 11–17 år: 69–480), som ikke er relevante for Aevias voksne målgruppe. Enheden ×10⁻³ int.enh./L (= ×10⁻³ IU/L) er identisk med mIU/L — ingen konvertering nødvendig.
- **Confidence:** high — Primærkilden (sundhed.dk Lægehåndbogen) er gen-fetchet og bekræfter citatet ordret, enheden matcher mIU/L 1:1, og værdierne er klinisk plausible for en voksen dansk befolkning. Bekræftet på tværs af flere danske hospitalslaboratorier (Region Sjælland LMV, OUH).

## Køns-/alders-specifikt
Kønsspecifikt. Total prolaktin (>18 år): kvinder 90–580 mIU/L, mænd 80–460 mIU/L (×10⁻³ IE/L = mIU/L). Det foreslåede kombinerede tosidede interval (begge køn) spænder fra mændenes nedre grænse (80) til kvindernes øvre grænse (580) = **80–580 mIU/L**.

Monomer-prolaktin (afgørende for om patienten reelt har forhøjet prolaktin, dvs. efter eksklusion af macroprolaktin): kvinder 59–304 mIU/L, mænd 69–266 mIU/L.

Aldersopdelte intervaller findes for børn, men Aevias målgruppe er voksne (>18 år), så kun >18-intervallet er anvendt.

## Noter & forbehold til Judit
- **Enhed:** ×10⁻³ int.enh./L (×10⁻³ IU/L) er identisk med mIU/L — ingen konvertering nødvendig (unitMatches=true).
- **Total vs. monomer:** Tallene 80–580 er total-prolaktin fra sundhed.dk Lægehåndbogen, som er den standard-initialmåling danske laboratorier rapporterer. Hvis Aevia ønsker det snævrere, mere kliniske interval bør monomer-baseret 59–304 mIU/L (macroprolaktin ekskluderet) overvejes. Beslutning kræver klinisk stillingtagen.
- **Laboratorie-variation:** Referenceintervallet afhænger af analyseudstyr/metode på den lokale klinisk-biokemiske afdeling, så små variationer mellem laboratorier forekommer. Region Sjælland LMV (Abbott Alinity, NPU18247) angiver kvinder 64–560, mænd 64–420 ×10⁻³ IU/L (http://lmv.regionsjaelland.dk/KB/dokument.asp?DokID=266676), og OUH angiver ~0–530 mIU/L (kvinder) / ~0–424 (mænd). Det foreslåede 80–580 er konsistent med disse, blot lidt bredere i den øvre ende.
- **Sammenligning med motoren:** Aevias nuværende udledte reference (60–400) ligger lavt i den øvre ende sammenlignet med total-prolaktin-intervallet — øvre grænse 400 vil fejlagtigt flagge mange normale kvinder (op til 580) som forhøjede. Den foreslåede øvre grænse på 580 retter dette.
- **Optimal-zone:** Aevias optimal-zone (80–320) ligger inden for referenceintervallet og er klinisk rimelig (mid-normalt område, tæt på monomer-øvre-grænse), men bør bekræftes af Judit som en sundheds-optimal (ikke blot reference-) zone.
