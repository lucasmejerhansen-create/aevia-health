# Hvilepuls — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `hvilepuls` · **Enhed:** slag/min · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 100 |
| Aevia optimal-zone | 48 | 62 |
| Motorens udledte ref. (±25%, erstattes) | åben | 77.5 |


## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen (Akutte sygdomme · Førstehjælp · Livsvigtige tegn, overvågning). Bekræftet uafhængigt af Hjerteforeningen (autoritativ patientorganisation).
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/akutte-sygdomme/foerstehjaelp/foerstehjaelpsprincipper/livsvigtige-tegn-overvaagning/
- **Verbatim citat:** "Pulsfrekvensen hos voksne er mellem 50-100 slag per minut."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af sundhed.dk Patienthåndbogen bekræftede citatet ORDRET med voksen-normalområdet 50-100 slag per minut, og enheden er slag per minut (= slag/min, ingen konvertering nødvendig, unitMatches=true). Siden bemærker desuden at veltrænede yngre voksne ofte ligger lavere, og at pulsen kan stige ved frygt/smerte. Sekundærkilden Hjerteforeningen blev gen-fetchet (den oprindeligt foreslåede URL gav 404; korrekt side fundet via søgning) og bekræfter uafhængigt øvre grænse: "Puls, der stiger til over 100 slag per minut i hvile" defineres som takykardi, og <50 som bradykardi. Hjerteforeningen oplyser desuden vejledende køns-gennemsnit (mænd ca. 60-80, kvinder ca. 70-90 slag/min). Ingen indholdsmæssig uenighed mellem kilderne om grænserne 50 og 100.
- **Confidence:** high — citatet er bekræftet ordret i den primære danske topkilde (sundhed.dk Patienthåndbogen), corroboreret uafhængigt af Hjerteforeningen (>100 = takykardi, <50 = bradykardi), enheden matcher (slag/min, ingen konvertering), og intervallet 50-100 slag/min er klinisk veletableret og plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
sundhed.dk Patienthåndbogen angiver IKKE separate køns- eller aldersintervaller — voksen-normalområdet 50-100 slag/min gælder generelt. Hjerteforeningen oplyser vejledende gennemsnit: mænd ca. 60-80 slag/min, kvinder ca. 70-90 slag/min (kvinder typisk lidt højere). Veltrænede yngre voksne ligger ofte lavere (sundhed.dk bemærker dette eksplicit). Disse køns-gennemsnit er vejledende og ændrer ikke de kliniske eskaleringsgrænser (50/100), som anvendes uden køns-/aldersopdeling.

## Noter & forbehold til Judit
- **Fysiologisk/klinisk mål, ikke et lab-interval:** Hvilepuls er IKKE en blodprøve og har derfor ikke et klassisk statistisk lab-referenceinterval. Det foreslåede interval er det almene voksen-normalområde (sundhed.dk) afgrænset af de kliniske tærskler bradykardi (<50) og takykardi (>100).
- **Øvre grænse = eskaleringsgrænse (100 slag/min):** For en lavere-er-bedre markør er nedre grænse reelt åben (en lavere hvilepuls er generelt udtryk for bedre kardiovaskulær form) → refLow = null. refHigh = 100 slag/min, dvs. takykardi-tærsklen, hvor markøren bør eskalere. Begge danske kilder er enige om 100 som øvre grænse.
- **Optimal-zone vs. klinisk normalområde — VIGTIGT:** Aevias optimal-zone (48-62 slag/min) ligger LAVERE end befolkningens almene normalområde og afspejler et longevity-/atletperspektiv (lavere hvilepuls = bedre kardiovaskulær form, evidensbaseret, jf. Hjerteforeningens "Høj hvilepuls kan koste leveår"). Bemærk dog: optimal-zonens nedre ende (48) ligger UNDER den kliniske bradykardi-tærskel (<50). Hos utrænede klassificeres hvilepuls under 50 klinisk som bradykardi, mens samme værdi hos veltrænede typisk er normalt og ufarligt. Motoren/rapporten bør derfor ikke eskalere lave værdier i optimal-zonen som "for lav" uden hensyn til træningsstatus — overvej om bradykardi-flag skal betinges af symptomer (svimmelhed, besvimelse) snarere end blot tal.
- **Motorens udledte øvre ref. (77.5 slag/min) er for stram:** 77.5 ligger inden for det kliniske normalområde og ville fejlagtigt eskalere normale, raske voksne. Den klinisk relevante eskaleringsgrænse er takykardi-tærsklen 100 slag/min. Erstattes derfor af 100.
- **Enhed:** slag/min (slag per minut) — ingen konvertering foretaget (unitMatches=true).
- **Målebetingelser (fortolknings-forbehold):** Hvilepuls måles bedst om morgenen før man står op, eller efter at have ligget ned i ca. 10 minutter (Hjerteforeningen). Puls påvirkes desuden af frygt, smerte, koffein, feber, medicin m.m. — en enkelt forhøjet måling er ikke nødvendigvis takykardi. Dette er et fortolknings-forbehold, ikke en del af selve referenceintervallet.
- **Kilde-rettelse:** Den oprindeligt foreslåede Hjerteforeningen-URL kunne ikke verificeres (404). Den korrekte autoritative side er https://hjerteforeningen.dk/sygdomme/alle-sygdomme/takykardi-hurtig-hjerterytme/ (takykardi >100 i hvile) suppleret af https://hjerteforeningen.dk/sygdomme/alle-sygdomme/bradykardi-langsom-hjerterytme/ (bradykardi <50). Primærkilden (sundhed.dk) var fuldt verificerbar.
