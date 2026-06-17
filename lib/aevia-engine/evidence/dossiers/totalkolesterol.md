# Totalkolesterol — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `totalkolesterol` · **Enhed:** mmol/L · **Kategori:** hjerte · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | åben | 5 |
| Aevia optimal-zone | 3.5 | 5 |
| Motorens udledte ref. (±25%, erstattes) | 2.625 | 6.25 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Kolesterol, total) — klinisk biokemi
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/kolesterol-total/
- **Verbatim citat:** "Raske voksne: Under 5,0 mmol/L; Patienter med kendt aterosklerotisk sygdom: Under 4,0 mmol/L; Patienter med diabetes: Under 4,0 mmol/L"
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af Lægehåndbogen bekræftede tærsklerne ordret: raske voksne <5,0 mmol/L, aterosklerotisk sygdom <4,0 mmol/L, diabetes <4,0 mmol/L. Kilden angiver desuden et populations-referenceinterval hos ældre på 3,9–7,8 mmol/L (ikke handlingsrelevant), og at "lave værdier (under 3 mmol/L) har som regel ingen klinisk betydning". Patienthåndbogen (https://www.sundhed.dk/borger/patienthaandbogen/undersoegelser/blod-og-urinproever/kolesterol-p/) bekræfter samme tærskel ordret: "Mindre end 5 mmol/L er et ønskeligt niveau", "5,0-6,4 mmol/L, let forhøjet kolesterol", "6,5-7,9 mmol/L, moderat forhøjet kolesterol", "Højere end 8,0 mmol/L er udtalt forhøjet kolesterol". Enhed er mmol/L i begge kilder — ingen konvertering nødvendig.
- **Confidence:** high — to uafhængige sundhed.dk-kilder (Læge- og Patienthåndbogen) angiver samme tærskel (<5,0 mmol/L) i korrekt enhed; citatet er verificeret ordret ved gen-fetch.

## Køns-/alders-specifikt
Ingen kendt klinisk relevant kønsforskel for den anvendte ønskegrænse (<5,0 mmol/L for raske voksne). Aldersbemærkning: hos ældre angiver kilden et bredere populations-referenceinterval (3,9–7,8 mmol/L), men dette er et statistisk populationsinterval, ikke det handlingsrelevante mål. Strammere mål gælder ved komorbiditet: <4,0 mmol/L ved kendt aterosklerotisk sygdom og ved diabetes.

## Noter & forbehold til Judit
- **Fysiologisk grænse, ikke klassisk to-endet lab-interval:** Totalkolesterol bruges i dansk klinik ikke som et symmetrisk referenceinterval, men som en handlings-/ønskegrænse. Lægehåndbogen angiver "Raske voksne: Under 5,0 mmol/L" som det ønskelige niveau. Motoren er sat til "tosidet", men i praksis er markøren reelt lavere-er-bedre op til den øvre grænse.
- **Nedre grænse (refLow) sat til null/åben:** Lavt totalkolesterol flagges ikke som patologisk i dansk praksis — kilden anfører at "lave værdier (under 3 mmol/L) har som regel ingen klinisk betydning". Der findes derfor ikke en meningsfuld nedre referencegrænse. Forbehold: meget lavt kolesterol, der opstår hurtigt, kan ses ved fx hyperthyreose eller cancer, men dette er en sekundær/differentialdiagnostisk observation, ikke en reference-undergrænse.
- **Øvre grænse (refHigh) sat til 5,0 mmol/L:** Den klinisk anvendte øvre ønskegrænse for raske voksne. Bemærk strammere mål (4,0 mmol/L) for patienter med diabetes eller kendt aterosklerotisk sygdom — overvej om motoren skal kunne differentiere efter risikoprofil.
- **Enhed:** mmol/L i kilden, matcher motoren — ingen konvertering.
- **Aevia optimal-zone (3,5–5):** I god overensstemmelse med den øvre danske ønskegrænse. Den udledte ±25 %-reference (2,625–6,25) bør erstattes af <5,0 mmol/L (ønskeligt) som klinisk grænse, og den nedre ende fjernes (åben).
