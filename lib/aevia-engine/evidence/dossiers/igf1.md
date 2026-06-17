# IGF-1 — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `igf1` · **Enhed:** nmol/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 17.6 | 65.4 |
| Aevia optimal-zone | 18 | 30 |
| Motorens udledte ref. (±25%, erstattes) | 13.5 | 37.5 |

## Evidens
- **Kilde:** sundhed.dk Lægehåndbogen (Klinisk Biokemi, IGF-1)
- **URL:** https://www.sundhed.dk/sundhedsfaglig/laegehaandbogen/undersoegelser-og-proever/klinisk-biokemi/blodproever/igf-1/
- **Verbatim citat:** "26-85 år: 135-500 µg/L. Omregningsfaktoren fra µg/L til nmol/L er 7,649 (fx 500 µg/L = 500/7,649 = ca. 65 nmol/L)"
- **Bekræftet ved gen-fetch:** Ja. Jeg hentede kilden påny. Den angiver fuld alders- og kønsstratificeret tabel i µg/L. For voksne 26-85 år: 135-500 µg/L for begge køn. Omregningsfaktoren "fra µg/L til nmol/L er 7,649" står eksplicit, og kildens eget eksempel (500 µg/L = 500/7,649 ≈ 65 nmol/L) bekræfter, at man **dividerer** med 7,649. NPU-kode NPU19829 (P—Insulinlignende vækstfaktor I) bekræftet. Egen kontrolberegning: 135 µg/L ÷ 7,649 = 17,65 nmol/L og 500 µg/L ÷ 7,649 = 65,37 nmol/L → matcher det foreslåede interval 17,6-65,4 nmol/L præcist (IGF-1 MW ≈ 7649 Da underbygger faktoren).
- **Confidence:** medium — Kilde og enhedskonvertering er fuldt bekræftet og matematisk konsistente, men kilden er angivet i µg/L (ikke nmol/L), så enheden er **konverteret**, ikke aflæst direkte. Desuden understreger kilden selv, at referenceintervallet er analysemetode-/udstyrsafhængigt og kraftigt aldersafhængigt — et enkelt fast interval er en forenkling. Derfor ikke "high".

## Køns-/alders-specifikt
IGF-1 er stærkt alders- og delvist kønsafhængig. For voksne 26-85 år er intervallet **ens for begge køn**: 135-500 µg/L (17,6-65,4 nmol/L) — dette er det foreslåede interval, som er mest repræsentativt for Aevias generelle voksne klientel.

For unge voksne 19-25 år er niveauet højere og kønsforskelligt:
- Kvinder 19-25 år: 230-550 µg/L (30,1-71,9 nmol/L)
- Mænd 19-25 år: 200-435 µg/L (26,1-56,9 nmol/L)

IGF-1 falder med alderen, så et enkelt fast referenceinterval er en forenkling. Danske hospitalslaboratorier rapporterer typisk alders-/kønsstratificerede intervaller sammen med svaret.

## Noter & forbehold til Judit
- **Enhedskonvertering:** Kilden angiver µg/L; foreslået interval er konverteret til nmol/L ved division med 7,649 (IGF-1 MW ≈ 7649 Da), jf. kildens egen eksplicitte omregningsfaktor og eksempel. Konverteringen er kontrolregnet og matcher præcist (135→17,65; 500→65,37).
- **Metodeafhængighed:** Kilden understreger eksplicit, at "referenceintervallet er afhængigt af analyseudstyr/analysemetode". Det reelle referenceinterval bør i sidste ende afstemmes med det udførende danske laboratoriums egne intervaller.
- **Alder/køn:** Det foreslåede interval (17,6-65,4 nmol/L) gælder voksne 26-85 år, begge køn. For klienter 19-25 år er det egentlige interval højere og kønsforskelligt (se ovenfor) — overvej alderstratificering i motoren.
- **Aevia optimal-zone vs. klinisk reference:** Aevias optimal-zone (18-30 nmol/L) ligger i den nedre halvdel af det brede kliniske referenceinterval. Dette er en **bevidst longevity-positionering**, ikke et patologisk normalområde — bør valideres som et bevidst klinisk valg, ikke forveksles med referenceintervallet.
- **Motorens udledte reference:** Den motorudledte reference (13,5-37,5 nmol/L) er for snæver i toppen sammenlignet med det egentlige kliniske interval (øvre grænse 65,4 vs. 37,5) — erstattes af det foreslåede interval.
- **NPU-kode:** NPU19829 (P-Insulinlignende vækstfaktor I).
