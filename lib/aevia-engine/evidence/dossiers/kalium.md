# Kalium — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `kalium` · **Enhed:** mmol/L · **Kategori:** nyrer · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 3.5 | 4.4 |
| Aevia optimal-zone | 3.7 | 4.6 |
| Motorens udledte ref. (±25%, erstattes) | 2.775 | 5.75 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Kalium, Klinisk biokemi / blodprøver)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/kalium/
- **Verbatim citat:** "Kalium målt i plasma: 3,5 - 4,4 mmol/L. Kalium målt i serum: 3,6 - 4,6 mmol/L."
- **Bekræftet ved gen-fetch:** Ja. Gen-fetch af URL'en bekræftede begge intervaller ordret: P-Kalium 3,5–4,4 mmol/L og S-Kalium 3,6–4,6 mmol/L, samt den aldersafhængige note (øvre grænse ~6 mmol/L for børn under 1 år) og faregrænser (<2,5 eller >7,0 mmol/L livstruende; >6 mmol/L kræver akut behandling). Enheden er mmol/L — matcher, ingen konvertering nødvendig.
- **Confidence:** high — Kilden er øverst i kildehierarkiet (Lægehåndbogen på sundhed.dk), citatet er gen-bekræftet ordret, enheden matcher, og intervallet er klinisk plausibelt for en voksen dansk befolkning.

## Køns-/alders-specifikt
Ingen kønsopdeling i kilden — ingen kendt klinisk relevant kønsforskel for voksne. Aldersafhængighed gælder kun spædbørn: øvre grænse for børn under 1 år er omkring 6 mmol/L. Dette gælder IKKE voksne og påvirker ikke det foreslåede interval.

## Noter & forbehold til Judit
- **Matrice-valg (plasma vs. serum):** Lægehåndbogen angiver to intervaller afhængigt af matrice — PLASMA 3,5–4,4 mmol/L og SERUM 3,6–4,6 mmol/L. Danske hospitalslaboratorier rapporterer i dag overvejende P-Kalium (plasma) efter overgang fra serum til plasma (fx Nordsjællands Hospital 2017), derfor foreslås plasma-intervallet 3,5–4,4 mmol/L som primært. **Hvis Aevia rapporterer serum frem for plasma, bør 3,6–4,6 mmol/L bruges i stedet** — beslutning kræver, at Judit/laboratoriet bekræfter Aevias matrice.
- **Uenighed mellem kilder:** En udbredt klassisk lærebogs-/klinisk tærskelværdi er 3,5–5,0 mmol/L (hypokaliæmi <3,5; hyperkaliæmi >5,0), som også optræder på sundhed.dk's tilstandssider og hos Medicin.dk. Det er bredere end Lægehåndbogens analytiske referenceinterval og repræsenterer en klinisk handlegrænse snarere end et analytisk referenceinterval. Vi har valgt det analytiske referenceinterval (3,5–4,4 plasma) i tråd med Aevias laboratorie-orienterede tilgang.
- **Faregrænser (livstruende):** <2,5 eller >7,0 mmol/L. P-Kalium >6 mmol/L kræver akut behandling og hjertemonitorering. Disse bør håndteres som kritiske flags, ikke som almindelige referencegrænser.
- **Aevia optimal-zone (3,7–4,6):** Ligger fornuftigt inden for/omkring det danske plasma-/serum-referenceinterval. Bemærk at zonens øvre grænse (4,6) ligger over plasma-referencens øvre grænse (4,4) men matcher serum-referencen (4,6) — relevant hvis matrice afklares til serum.
- **Enhed:** mmol/L matcher — ingen konvertering nødvendig.
