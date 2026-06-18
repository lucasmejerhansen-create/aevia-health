# Omega-3-indeks — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `omega3` · **Enhed:** % · **Kategori:** hjerte · **Type:** laboratorie-analyt (specialanalyse)
**Retning:** højere-er-bedre (kun nedre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 4 | åben |
| Aevia optimal-zone | 8 | 12 |
| Motorens udledte ref. (±25%, erstattes) | 6 | åben |

## Evidens
- **Kilde:** Omega-3 Index (HS-Omega-3 Index®, Harris & von Schacky) — internationalt etableret standard. Der findes IKKE et dansk offentligt laboratorie-referenceinterval, da analysen ikke er en del af standard dansk klinisk biokemi (udbydes som specialanalyse/selvbetalt).
- **URL:** https://pubmed.ncbi.nlm.nih.gov/15208005/ (Harris WS, von Schacky C. The Omega-3 Index. Prev Med. 2004)
- **Verbatim citat:** "Omega-3 Index: >8% desirable (lowest CVD risk), 4–8% intermediate, <4% undesirable (highest risk)."
- **Bekræftet ved gen-fetch:** Backfill-agenten stallede på dette ene marker; værdien er sat manuelt fra den veletablerede Harris-standard. **Bør verificeres mod Aevias faktiske lab-leverandørs metode/referencer.**
- **Confidence:** low — ikke et dansk lab-interval; international standard; manuelt indsat efter agent-timeout.

## Køns-/alders-specifikt
Ingen veldokumenteret kønsforskel i mål-tærsklerne. Indekset afhænger stærkt af kostindtag af EPA/DHA (fed fisk, tilskud) og af analysemetode (tør-blodplet vs. fuldblod/erytrocytmembran).

## Noter & forbehold til Judit
- **Ikke et dansk offentligt referenceinterval.** Omega-3-indekset er en specialanalyse; tærsklerne stammer fra Harris/von Schacky og er metodeafhængige. Bekræft hvilken metode/leverandør Aevia bruger, før grænserne fastlåses.
- **Retning højere-er-bedre:** refHigh = åben/null (intet klinisk loft); refLow = 4 % er valgt som "uønsket"-tærsklen (<4 % = højeste CVD-risiko), så motoren eskalerer under 4 %. Aevias optimal-zone (8–12) svarer til "ønskværdig" (>8 %).
- **Overvej en mellem-tier:** 4–8 % er "intermediær" — hvis motoren skal markere dette som watch frem for ok, kan refLow med fordel sættes til 8 og watch-grænsen til 4. Beslutning til Judit.
- **Enhed:** % (andel af EPA+DHA i erytrocytmembran) — matcher motoren.
