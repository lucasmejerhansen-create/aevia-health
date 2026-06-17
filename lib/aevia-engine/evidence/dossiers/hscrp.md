# hs-CRP — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `hscrp` · **Enhed:** mg/L · **Kategori:** inflammation · **Type:** laboratorie-analyt
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 3 |
| Aevia optimal-zone | 0 | 1 |
| Motorens udledte ref. (±25%, erstattes) | åben | 1.25 |


## Evidens
- **Kilde:** Ugeskrift for Læger (Ugeskriftet) — sekundærpublikation "C-reaktivt protein og risiko for iskæmisk hjerte- og cerebrovaskulær sygdom", dansk videnskabelig publikation; understøttet af sundhed.dk Lægehåndbogen (Klinisk biokemi, blodprøver: C-reaktivt protein (CRP))
- **URL:** https://ugeskriftet.dk/videnskab/c-reaktivt-protein-og-risiko-iskaemisk-hjerte-og-cerebrovaskulaer-sygdom
- **Verbatim citat:** "CRP-niveauet blev klassificeret som lavt (< 1,0 mg/l), middel (1,0 til 3,0 mg/l) eller højt (> 3,0 mg/l)."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Ugeskriftet bekræftede citatet ORDRET med tærsklerne lav <1,0 mg/l, middel 1,0–3,0 mg/l, høj >3,0 mg/l, og enheden er mg/l (= mg/L, samme enhed; ingen konvertering nødvendig, unitMatches=true). Ingen køns- eller aldersopdeling angivet i artiklen. Sekundærkilden sundhed.dk Lægehåndbogen bekræfter desuden uafhængigt: normal plasma-CRP "under 1 mg/L"; at variation i det lave område "mellem fx 0,5 og 5 mg/L er stærkt associeret med risiko for udvikling af cancer og aterosklerotisk betinget hjertekarsygdom"; at kvantitering i det lave område kræver høj-sensitive metoder (hsCRP); og eksplicit at "De fleste danske laboratorier anvender disse tærskelværdier, uafhængigt af køn og alder". Ingen uenighed mellem kilderne.
- **Confidence:** high — citat og tærskler bekræftet ordret i primær dansk kilde, corroboreret af sekundær dansk kilde (Lægehåndbogen), enheden matcher (mg/L = mg/l), og stratificeringen er klinisk plausibel for voksen dansk befolkning og sammenfaldende med international AHA/CDC-konsensus (lav <1, middel 1–3, høj >3 mg/L).

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel. Begge kilder bekræfter at tærskelværdierne anvendes uafhængigt af køn og alder ("uafhængigt af køn og alder", sundhed.dk Lægehåndbogen). Ingen køns- eller aldersafhængig opdeling i Ugeskriftet.

## Noter & forbehold til Judit
- **Risiko-stratificering, ikke klassisk populations-referenceinterval:** hs-CRP har ikke et klassisk statistisk normalområde, men en kardiovaskulær/inflammatorisk RISIKO-stratificering, som er dansk klinisk standard: lav risiko <1,0 mg/L, middel 1,0–3,0 mg/L, høj >3,0 mg/L (svarer til AHA/CDC). Det er denne stratificering der ligger til grund for det foreslåede interval.
- **Øvre grænse = eskaleringsgrænse (3,0 mg/L):** For en lavere-er-bedre markør er nedre grænse reelt åben/0 (ingen inflammation er optimalt) → refLow = null. refHigh er sat til 3,0 mg/L = grænsen til "høj risiko", dvs. punktet hvor markøren bør eskalere.
- **Optimal-zone vs. referencegrænse:** Aevias optimal-zone 0–1 mg/L er korrekt sammenfaldende med "lav risiko" (<1,0 mg/L) — den optimale zone. 1,0 mg/L markerer slut på optimal-zonen; 3,0 mg/L markerer overgangen til høj risiko. Disse to grænser bør ikke forveksles.
- **Motorens udledte øvre ref. (1,25 mg/L) er for stram:** Den undervurderer den kliniske eskaleringsgrænse. Den klinisk relevante øvre grænse for forhøjet kardiovaskulær risiko er 3,0 mg/L. Erstattes derfor af 3,0 mg/L.
- **Enhed:** mg/L (dansk notation mg/l, samme enhed) — ingen konvertering foretaget (unitMatches=true).
- **Akut-fase-forbehold (vigtigt for fortolkning):** Akut CRP-forhøjelse (infektion/inflammation) gør hs-CRP-risikovurdering uanvendelig. Værdier >10 mg/L bør gentages efter ca. 2 uger før kardiovaskulær risiko vurderes. Det fulde hs-CRP måleområde er ca. 0,1–10 mg/L. Dette er et fortolknings-forbehold, ikke en del af selve referenceintervallet — overvej om motoren/rapporten skal flagge værdier >10 mg/L som "muligt akut-fase, gentag" snarere end blot "høj risiko".
- **Laboratorie-variation:** Lægehåndbogen bemærker at danske laboratorier anvender varierende tærskler for almindelig (ikke-hs) CRP (<5, <8 eller <10 mg/L) afhængigt af metode. Den hs-CRP-baserede risiko-stratificering (<1 / 1–3 / >3) er adskilt fra disse og forudsætter høj-sensitiv målemetode.
