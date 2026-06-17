# Urat (urinsyre) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `urat` · **Enhed:** mmol/L · **Kategori:** nyrer · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 0.48 |
| Aevia optimal-zone | 0.2 | 0.4 |
| Motorens udledte ref. (±25%, erstattes) | åben | 0.5 |
| Kvinde-optimal (motor) | 0.15 | 0.34 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Urat)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/urat/
- **Verbatim citat:** "Kvinder 18-49 år: 0,16-0,35 mmol/L; Kvinder 50+ år: 0,16-0,40 mmol/L; Mænd 18+ år: 0,23-0,48 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede de voksne intervaller præcist: Kvinder 18–49: 0,16–0,35; Kvinder 50+: 0,16–0,40; Mænd 18+: 0,23–0,48 mmol/L. Siden angiver desuden barne-/unge-intervaller (0–4 år: 0,12–0,32; piger 5–13: 0,14–0,33; piger 14–17: 0,16–0,38; drenge 5–10: 0,13–0,31; drenge 11–13: 0,13–0,40; drenge 14–17: 0,22–0,46) samt graviditets-/post-partum-værdier (omkr. uge 20: 0,12–0,27; sen graviditet: 0,15–0,40; under/lige efter fødsel: 0,17–0,46). Alt i mmol/L — ingen enhedskonvertering nødvendig.
- **Confidence:** high — Top-kilde (Lægehåndbogen) bekræfter de eksakte tal ved gen-fetch, enheden matcher, og en uafhængig dansk hospitalslab (Sygehus Sønderjylland, urat-stofk-p.pdf) angiver identiske voksne intervaller. De kliniske beslutningsgrænser (krystallisation/behandlingsmål) er desuden bekræftet via Sundhedsstyrelsen / Rationel Farmakoterapi.

## Køns-/alders-specifikt
Referencen er kønsspecifik. Mænd 18+ år: 0,23–0,48 mmol/L. Kvinder 18–49 år: 0,16–0,35 mmol/L; kvinder 50+ år: 0,16–0,40 mmol/L (øvre grænse stiger efter menopause). Børn/unge har lavere intervaller (ca. 0,12–0,46 mmol/L afhængigt af alder/køn). Den samlede voksne reference spænder fra 0,16 (nedre, kvinder) til 0,48 mmol/L (øvre, mænd).

For motorens "lavere-er-bedre"-retning bruges den højeste øvre voksengrænse (mænd, 0,48 mmol/L) som refHigh, så raske mænd ikke fejl-eskaleres. Bemærk dog at den kønsneutrale krystallisations-/behandlings-logik (se nedenfor) ligger lavere end 0,48 — Aevias optimal-zoner afspejler dette og er bevidst strammere end den øvre referencegrænse.

## Noter & forbehold til Judit
- **Enhed matcher** (mmol/L) — ingen konvertering nødvendig.
- **NPU-kode:** NPU03688.
- **To danske kilder enige:** (1) sundhed.dk Lægehåndbogen (top-kilde, gen-fetchet) og (2) Sygehus Sønderjyllands laboratorieanalysefortegnelse (urat-stofk-p.pdf) — identiske voksne tal. Ingen uenighed mellem kilder.
- **Klinisk kontekst for retning (lavere-er-bedre):** Krystallisationsgrænsen for urat ligger ved ca. 0,40 mmol/L uanset køn (Lægehåndbogen). Behandlingsmål ved artritis urica er P-urat <0,36 mmol/L (ukompliceret) og <0,30 mmol/L (toføs gigt) iflg. Sundhedsstyrelsen / Rationel Farmakoterapi (bekræftet ved søgning, sst.dk/Rationel-Farmakoterapi-9-2018). Indikation for uratsænkende behandling ved klinisk artritis urica nævnes typisk ved P-urat >0,41 mmol/L.
- **Konsekvens for refHigh-valg:** Den foreslåede refHigh = 0,48 er den øvre *populations*-referencegrænse (mænd). Den ligger OVER krystallisations-/behandlingsmålene. Aevias optimal-zone (0,2–0,4) og kvinde-optimal (0,15–0,34) er bevidst konsistente med de kliniske mål og dermed strammere end populationsreferencen. Judit bør beslutte, om motorens eskaleringsgrænse skal være populationsreferencen (0,48) eller en mere klinisk/risiko-orienteret grænse (fx 0,40 = krystallisation, eller 0,41 = behandlingsindikation). Aktuelt forslag følger instruktionens regel "den danske øvre grænse" = 0,48, men dette flag fremhæver spændet til de lavere kliniske grænser.
- **Kønsforskel ikke modelleret i refHigh:** Da motoren bruger én øvre grænse, dækker 0,48 mænd. For kvinder er den fysiologiske øvre normalgrænse lavere (0,35 før / 0,40 efter menopause); kvinder med urat 0,41–0,48 ville være over deres egen kønsreference men inden for den fælles refHigh. Kvinde-optimal-zonen (0,15–0,34) afbøder dette delvist.
