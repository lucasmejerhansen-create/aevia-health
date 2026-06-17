# Folat — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `folat` · **Enhed:** nmol/L · **Kategori:** vitaminer · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 9 | åben |
| Aevia optimal-zone | 15 | 35 |
| Motorens udledte ref. (±25%, erstattes) | 11.25 | 43.75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk biokemi, Folat)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/folat/
- **Verbatim citat:** "18 år - 200 år: > 9 nmol/L"
- **Bekræftet ved gen-fetch:** Ja. Siden blev hentet og bekræfter de aldersopdelte referenceintervaller for P-Folat: 0–1 år: 15–50 nmol/L; 1–18 år: 6–35 nmol/L; 18 år+: > 9 nmol/L. Enheden er nmol/L. Ingen kønsforskelle angivet. Siden bemærker selv, at referenceværdier kan variere mellem laboratorier afhængigt af metode og referencepopulation. Bekræftet uafhængigt af sundhed.dk Patienthåndbogen, som ligeledes angiver > 9,0 nmol/L for voksne (https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/folater/).
- **Confidence:** high — to uafhængige sundhed.dk-sider (Læge- og Patienthåndbogen) angiver samme nedre grænse (> 9 / > 9,0 nmol/L) for voksne, enheden matcher (nmol/L), ingen konvertering nødvendig.

## Køns-/alders-specifikt
Ingen kønsforskelle angivet i kilden. Reference er aldersafhængig: 0–1 år: 15–50 nmol/L; 1–18 år: 6–35 nmol/L; 18 år+: > 9 nmol/L. For voksne (Aevias målgruppe) gælder > 9 nmol/L.

## Noter & forbehold til Judit
- **Enhed:** Matcher (nmol/L) — ingen konvertering nødvendig.
- **Ensidet klinisk reference vs. tosidet motorretning:** P-Folat er klinisk en ENSIDET (nedre-grænse) reference — der defineres kun en nedre normalgrænse for voksne, da høje folatværdier ikke har klinisk betydning (overskud udskilles). Motoren har dog markøren sat til **tosidet**. Per opgavens regel ("respektér motorens retning") er begge ender medtaget fra den danske kilde: kilden definerer kun en nedre grænse (9), og toppen er åben (null). Resultatet bliver derfor refLow=9, refHigh=null — hvilket både respekterer motorretningen og afspejler den kliniske virkelighed (åben i toppen). **Judit bør beslutte, om markørens motorretning bør ændres fra tosidet til "højere-er-bedre" (ensidet nedre), så modellen matcher den kliniske reference.**
- **Erstatter motorens ±25%-udledning:** Den motor-udledte tosidede reference (11,25–43,75) er ikke en klinisk reference og bør erstattes med den danske grænse på > 9 nmol/L (refLow=9, åben top).
- **Lab-variation:** Den præcise nedre grænse kan variere fra laboratorium til laboratorium afhængigt af metode og referencepopulation (sundhed.dk angiver selv dette forbehold). Region Sjællands laboratorievejledning bruger en lavere praksis-grænse (> 6,0 nmol/L; ved < 6,0 nmol/L fra praksis indkaldes til ny prøve). Norske laboratorier bruger andre intervaller pga. forskelle i fødevareberigelse. Den danske sundhed.dk-grænse (> 9 nmol/L) er valgt som primær.
- **Optimal-zone vs. referenceinterval:** Aevias tosidede optimal-zone (15–35 nmol/L) afspejler en stræben efter højere folatstatus (bl.a. relevant ved MTHFR 677 C>T-polymorfi, hvor > 15 nmol/L kan anbefales, samt for gravide/kvinder i den fertile alder pga. neuralrørsdefekt-risiko) — ikke det officielle kliniske referenceinterval. Optimal-zonen og referenceintervallet bør holdes adskilt i kommunikationen til brugeren.
