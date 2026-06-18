# Blodtryk (systolisk) — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `blodtryksys` · **Enhed:** mmHg · **Kategori:** fysiologi · **Type:** fysiologisk/klinisk mål (ikke en blodprøve)
**Retning:** lavere-er-bedre (kun øvre grænse eskalerer)

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 140 |
| Aevia optimal-zone | 105 | 125 |
| Motorens udledte ref. (±25%, erstattes) | åben | 156.25 |

Da motorens retning er lavere-er-bedre, er kun den øvre grænse relevant for klassifikationen. refLow sættes til null (åben), og refHigh sættes til 140 mmHg — den autoritative danske tærskel for forhøjet blodtryk ved klinikmåling.

## Evidens
- **Kilde:** sundhed.dk Patienthåndbogen / Lægehåndbogen + Hjerteforeningen (danske kliniske retningslinjer, baseret på ESC/DSAM)
- **URL:** https://www.sundhed.dk/borger/patienthaandbogen/hjerte-og-blodkar/sygdomme/hoejt-blodtryk-hypertension/forhoejet-blodtryk-oversigt/
- **Verbatim citat:** "Blodtrykket er forhøjet, når det ved gentagne målinger hos lægen er 140/90 eller derover"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af URL'en bekræftede citatet ordret, i enheden mmHg. Samme side angiver desuden hjemmemåling: "Hvis man måler blodtrykket derhjemme, er det forhøjet, når det ved gentagne målinger ligger på 135/85 eller derover." Hjerteforeningen (gen-søgt) bekræfter uafhængigt: "Hvis du får målt dit blodtryk hos lægen, skal det være under 140/90" og "under 135/85" ved hjemmemåling. Den klassiske normale reference 120/80 mmHg er ligeledes bekræftet på sundhed.dk.
- **Confidence:** high — Den øvre tærskel (140 mmHg systolisk ved klinikmåling) er bekræftet ordret i to uafhængige autoritative danske kilder, i korrekt enhed (mmHg), og er klinisk konsensus (ESC/DSAM). Bemærk: confidence vedrører den øvre, eskalerende grænse; den nedre grænse er kun vejledende (se forbehold).

## Køns-/alders-specifikt
Tærsklerne for forhøjet blodtryk (140/90 klinik, 135/85 hjemme) gælder ifølge sundhed.dk for alle voksne uanset alder og køn. Ingen kendt klinisk relevant kønsforskel på selve diagnosetærsklen.

Alders-undtagelse: For personer på 80 år og derover defineres forhøjet ofte først ved højere systolisk hjemme-/dagtidsblodtryk (omkring ≥145 mmHg), og behandlingsmål individualiseres for at undgå hypotension/fald. Aevias generelle øvre grænse på 140 mmHg er derfor konservativ (strammere) for de ældste — hvilket er klinisk acceptabelt, men kan give flere "forhøjet"-flag hos 80+ end de danske retningslinjer strengt taget kræver. Judit bør vurdere, om en alders-justeret øvre grænse ønskes for 80+.

## Noter & forbehold til Judit
- **Dette er IKKE et laboratorie-referenceinterval**, men en klinisk/fysiologisk tærskel. Der findes derfor ikke et klassisk DSKB-/hospitalslab-interval; den øvre grænse er en diagnostisk tærskel for hypertension.
- **Enhed:** matcher (mmHg). Ingen enhedskonvertering nødvendig.
- **ØVRE GRÆNSE (den eskalerende ende):** Sat til clinicalHigh = 140 mmHg ud fra den autoritative klinikmåle-tærskel (sundhed.dk + Hjerteforeningen). **VIGTIGT — målekontekst:** Hvis Aevia måler HJEMME-/ambulant blodtryk (snarere end klinikmåling), er den korrekte danske tærskel lavere: **135 mmHg systolisk**. Lægehåndbogens gradering af hjemmeblodtryk: "High normal" 125-134, Grad 1 135-154, Grad 2 155-174, Grad 3 ≥175 mmHg systolisk. Judit bør beslutte, om Aevias måling skal behandles som klinik (refHigh = 140) eller hjemme/ambulant (refHigh = 135). For højrisiko-/diabetes-/nyrepatienter er målet endda <130 mmHg (Hjerteforeningen).
- **NEDRE GRÆNSE:** De danske hypertensionskilder definerer ikke en fast nedre normalgrænse — lavere systolisk er generelt bedre, og hypotension er symptom-/perfusions-defineret (typisk overvejet ved systolisk <90 mmHg med tegn på utilstrækkelig organperfusion; gen-søgning på sundhed.dk bekræfter <90 mmHg som konventionel hypotensions-/shock-tærskel). Forslaget clinicalLow = 90 mmHg er derfor **vejledende, ikke citeret verbatim** fra retningslinjerne. I motorens lavere-er-bedre-logik er den nedre grænse uden klassifikatorisk betydning og sættes derfor åben (refLow = null).
- **Optimal-zone vs. klinisk grænse:** Aevias optimal-zone 105-125 mmHg er konsistent med, men strammere end, den kliniske normalgrænse (under 140 klinik / under 135 hjemme). Klassisk dansk "normalt blodtryk" angives som 120/80 mmHg (hos unge ned mod 105/65).
- **Anbefaling:** Bekræft målekontekst (klinik vs. hjemme) før endelig godkendelse, da det afgør om refHigh skal være 140 eller 135.
