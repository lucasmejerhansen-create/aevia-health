# Frit testosteron — referenceinterval-dossier
> ⚠️ FORSLAG til klinisk validering — IKKE valideret. Overlæge Judit Kolovics godkender endeligt. (Aevia-princip: AI foreslår, læge beslutter.)

**Markør-id:** `frittestosteron` · **Enhed:** pmol/L · **Kategori:** hormoner · **Type:** laboratorie-analyt
**Retning:** tosidet

## Foreslået dansk referenceinterval
| | Lav | Høj |
|---|---|---|
| **Foreslået reference** | 240 | 690 |
| Aevia optimal-zone | 250 | 600 |
| Motorens udledte ref. (±25%, erstattes) | 187.5 | 750 |
| Kvinde-optimal (motor) | 15 | 40 |

## Evidens
- **Kilde:** Region Sjælland Laboratoriemedicinsk Vejledning (LMV) — "Testosteron frit;P" (NPU03549)
- **URL:** http://lmv.regionsjaelland.dk/dokument.asp?DokID=290987
- **Verbatim citat:** "Mænd 20-45 år: 0,24-0,69 nmol/L; Mænd 45-65 år: 0,17-0,59 nmol/L. Frit testosteron beregnes ved modificeret Vermeulens formel, udfra koncentrationen af SHBG og total testosteron."
- **Bekræftet ved gen-fetch:** Ja. WebFetch af URL'en (17-06-2026) returnerede de samme værdier ordret. Hele tabellen blev bekræftet: Mænd 20-45 år 0,24-0,69 nmol/L; Mænd 45-65 år 0,17-0,59 nmol/L; Mænd 9-11 år 0,0007-0,0062 nmol/L; Kvinder 11-50 år 0,006-0,034 nmol/L; Kvinder 50+ år 0,005-0,019 nmol/L; Kvinder 9-11 år 0,0008-0,013 nmol/L. Kilden angiver eksplicit enheden **nmol/L** (ikke pmol/L) og bekræfter at frit testosteron BEREGNES (modificeret Vermeulens formel ud fra SHBG + total testosteron), ikke måles direkte.
- **Confidence:** medium — Værdien er bekræftet ordret ved gen-fetch fra et konkret dansk hospitalslab-dokument, og intervallet er klinisk plausibelt. Confidence holdes på medium (ikke high) fordi: (1) enheden i kilden er nmol/L og kræver konvertering ×1000 til motorens pmol/L (unitMatches=false); (2) frit testosteron er en BEREGNET størrelse, så referencen afhænger af beregningsmetode (Vermeulen) og af de underliggende total-testosteron/SHBG-assays — derfor varierer intervaller mellem laboratorier; (3) sundhed.dk/Lægehåndbogen og DSKB angiver IKKE ét fast nationalt referenceinterval, men henviser til lokal analysemetode — kun ét konkret dansk lab-dokument med eksplicitte tal blev fundet (Region Sjælland; AUH-PDF kunne ikke parses).

## Køns-/alders-specifikt
Referencen er stærkt køns- OG aldersspecifik (konverteret til pmol/L ved ×1000):

**MÆND (voksne):**
- 20-45 år: 0,24-0,69 nmol/L = **240-690 pmol/L** ← det foreslåede interval (matcher Aevias optimal-zone 250-600)
- 45-65 år: 0,17-0,59 nmol/L = **170-590 pmol/L** (aldersafhængigt fald)

**KVINDER:**
- 11-50 år: 0,006-0,034 nmol/L = **6-34 pmol/L**
- 50+ år: 0,005-0,019 nmol/L = **5-19 pmol/L**

Aevias kvinde-optimal (15-40 pmol/L) ligger inden for / lige over kvindereferencen (6-34 pmol/L) — øvre kvinde-optimal (40) ligger en smule over den kvindelige øvre referencegrænse (34).

## Noter & forbehold til Judit
- **Enhedskonvertering (vigtigt):** Kilden angiver værdier i **nmol/L**; motoren bruger **pmol/L**. Foreslået interval er konverteret ved ×1000. unitMatches=false. Verificér konverteringen.
- **Beregnet, ikke målt:** Frit testosteron måles ikke direkte, men BEREGNES via modificeret Vermeulens formel ud fra total testosteron + SHBG. Referencen afhænger derfor af beregningsmetoden og af de underliggende assays — intervaller varierer mellem laboratorier. Det lokale Aevia-laboratoriums analysefortegnelse bør konsulteres.
- **Køns- og aldersafhængighed:** Den foreslåede 240-690 pmol/L er MÆND 20-45 år. Hos mænd 45-65 år falder intervallet til 170-590 pmol/L. Den danske mandereference er betydeligt SMALLERE end motorens ±25%-udledning (187,5-750) og bekræfter, at den udledte reference bør erstattes. Overvej kønsspecifikke + aldersspecifikke referencer i motoren frem for ét fast interval.
- **Valg af interval:** 240-690 pmol/L (mænd 20-45 år) er valgt fordi det svarer til Aevias optimal-zone (250-600) og motorens udledte spænd (187,5-750). For ældre mænd kan det aldersopdelte 170-590 pmol/L være mere passende.
- **Kildekonflikt:** sundhed.dk/Lægehåndbogen og DSKB angiver IKKE et fast nationalt referenceinterval (henviser til lokal metode). Kun Region Sjælland-dokumentet gav eksplicitte tal (AUH-PDF kunne ikke parses). Lad Judit validere mod det lokale Aevia-laboratoriums analysefortegnelse.
- **Beslutning til Judit:** Foreslået JSON-interval = 240-690 pmol/L (tosidet, mænd 20-45 år). Bekræft enhedskonvertering, beregningsmetode og om motoren skal bruge køns-/aldersspecifikke referencer.
