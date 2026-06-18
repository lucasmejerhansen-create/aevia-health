# Taljemål — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `taljemaal` · **Enhed:** cm · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 94 |
| Aevia optimal-zone | 80 | 94 |
| Motorens udledte ref. (±25%, erstattes) | åben | 117.5 |
| Kvinde-optimal (motor) | 65 | 80 |

Da motorens retning er lavere-er-bedre, er kun den øvre grænse relevant for klassifikationen. refLow sættes til null (åben) — der findes ingen klinisk meningsfuld "for lav talje"-tærskel i retningslinjerne. refHigh sættes til 94 cm, den evidensbaserede danske/europæiske (IDF/ESC) tærskel for bugfedme/forhøjet kardiometabolisk risiko hos mænd. Dette erstatter motorens for høje udledte reference på 117.5 cm (±25%).

**VIGTIGT — kønsspecifik tærskel:** 94 cm er mande-tærsklen. For kvinder er den korrekte øvre tærskel **80 cm**. Aevias kvinde-optimal-zone (65–80) er allerede på linje med dette. Hvis motoren kan køre kønsspecifikt, bør kvinders refHigh sættes til 80, ikke 94.

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Metabolisk syndrom) — baseret på IDF/ESC/Sundhedsstyrelsen. Sekundært bekræftet via sundhed.dk Patienthåndbogen samt uafhængig web-søgning.
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/hjerte-kar/tilstande-og-sygdomme/metaboliske-og-elektrolytforstyrrelser/metabolisk-syndrom/
- **Verbatim citat:** "Bugfedme (livvidde for mænd >94 cm, for kvinder >80 cm, eller BMI >30)"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af URL'en bekræftede citatet ordret, i enheden cm. Samme side angiver desuden de amerikanske ATP III-kriterier i en separat tabel: "Taljeomkreds: >102 cm (mænd) >88 cm (kvinder)" — et højere risikotrin. Den af researcheren angivne Patienthåndbog-URL gav HTTP 404; den korrekte Patienthåndbog-side er https://www.sundhed.dk/borger/patienthaandbogen/hjerte-og-blodkar/sygdomme/oevrige-tilstande/metabolisk-syndrom/. Uafhængig web-søgning bekræfter samme tal (mænd >94 cm, kvinder >80 cm) på tværs af danske kilder.
- **Confidence:** high — Den øvre, eskalerende tærskel (94 cm for mænd / 80 cm for kvinder) er bekræftet ordret i en autoritativ dansk kilde, i korrekt enhed (cm), og er klinisk konsensus (IDF/ESC). Den nedre grænse er bevidst åben (ingen citeret evidens for en nedre normalgrænse), hvilket er korrekt for en lavere-er-bedre-markør.

## Køns-/alders-specifikt
Referencen er udpræget kønsspecifik. Danske/europæiske (IDF/ESC) tærskler for forhøjet risiko: **mænd >94 cm, kvinder >80 cm**. Yderligere (væsentligt øget) risikotrin via amerikanske ATP III-kriterier: **mænd >102 cm, kvinder >88 cm**.

- For en mandlig standard er den øvre optimal-tærskel **94 cm**.
- For kvinder er den øvre tærskel **80 cm** — og Aevias kvinde-optimal 65–80 passer godt med dette.
- 94 cm (mænd) / 80 cm (kvinder) markerer "let øget risiko"; 102 cm (mænd) / 88 cm (kvinder) markerer "væsentligt øget risiko".

Ingen kendt alders-justering af tærsklen i de danske retningslinjer for voksne.

## Noter & forbehold til Judit
- **Dette er IKKE et laboratorie-referenceinterval**, men et fysiologisk/klinisk mål. Der findes derfor ikke et klassisk to-sidet DSKB-/hospitalslab-interval; kilderne angiver kun en ØVRE risikotærskel, i overensstemmelse med markørens lavere-er-bedre-retning.
- **Enhed:** matcher (cm). Ingen enhedskonvertering nødvendig.
- **NEDRE GRÆNSE:** Ikke klinisk meningsfuld — der er ingen "for lav talje"-tærskel i retningslinjerne. clinicalLow = null (åben).
- **ØVRE GRÆNSE er kønsafhængig:** Forslaget refHigh = 94 cm gælder mænd. For kvinder bør refHigh = 80 cm. Hvis motoren kun kører én fælles tærskel, vil 94 cm være for slap for kvinder (kvinder med talje 81–94 cm vil fejlagtigt klassificeres som "normal", selv om de er over kvinde-tærsklen). Judit bør beslutte, om markøren skal køres kønsspecifikt (anbefales).
- **Erstatter motorens udledte reference:** Motorens ±25%-afledte øvre grænse (117.5 cm) er for høj og ikke evidensbaseret; den bør erstattes af 94 cm (mænd) / 80 cm (kvinder).
- **Kilde-uenighed (forventet, ikke konflikt):** IDF/ESC (94/80) vs. ATP III (102/88) er ikke modstridende, men to risikotrin. Aevia bruger den strammere IDF/ESC-tærskel som optimal-grænse, hvilket er konsistent med en forebyggende/longevity-profil.
- **Researcher-URL-fejl:** Den oplyste Patienthåndbog-URL var ugyldig (404). Den korrekte er noteret ovenfor; selve værdierne (94/80 cm) er uændret bekræftet.
