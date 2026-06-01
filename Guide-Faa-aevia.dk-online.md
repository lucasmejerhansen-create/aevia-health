# Få aevia.dk online — trin-for-trin guide

*Status lige nu: domænet returnerer **SERVFAIL / "no reachable authority"**. Det er **ikke** en fejl i hjemmesiden eller i DNS-opsætningen — det skyldes, at `.dk`-domænet endnu ikke er aktiveret og ID-kontrolleret hos Punktum.dk. Et .dk-domæne resolver ikke i DNS, før det er gjort, uanset navneservere og DNSSEC.*

---

## Hvad der er galt (kort)

Et `.dk`-domæne bliver først "live" i DNS, når **ejeren har bekræftet sig med ID-kontrol hos Punktum.dk** (den officielle danske registrator) og aktiveret domænet. Indtil da er delegeringen til navneserverne ikke aktiv → derfor SERVFAIL. Dit skift til Simplys navneservere er sandsynligvis korrekt; det træder bare først i kraft, når aktiveringen er på plads.

---

## Del 1 — Aktivér domænet (det der mangler)

**Trin 1 — Find mailsene**
Søg i din indbakke (og spam/uønsket post) efter afsendere:
- **Simply.com** (din udbyder)
- **Punktum.dk** / **DK Hostmaster** (den officielle .dk-registrator)

Du burde have modtaget mails om aktivering og ID-kontrol i forbindelse med bestillingen.

**Trin 2 — Gennemfør ID-kontrol hos Punktum.dk**
Følg den officielle guide her:
👉 https://punktum.dk/faq/hvordan-gennemfoerer-jeg-idkontrol

- Det foregår typisk med **MitID**.
- Det er gratis og tager få minutter.
- Du skal bruge det **håndteringsnummer / den ordre**, der står i mailen fra Punktum.dk.

**Trin 3 — Aktivér selve domænet**
Følg linket/knappen i aktiverings-mailen fra Simply.com / Punktum.dk og bekræft, at du vil aktivere `aevia.dk`.

**Trin 4 — Vent ca. 1 time**
Når både aktivering og ID-kontrol er gennemført, går domænet live i DNS inden for ca. en time (Tom fra Simply bekræftede dette).

---

## Del 2 — Tjek at navneserverne er rigtige (hos Simply)

Mens du venter, så bekræft at domænet bruger Simplys navneservere:

1. Log ind på **Simply.com** → vælg `aevia.dk`.
2. Under **Navneservere** skal der typisk stå:
   - `ns1.simply.com`
   - `ns2.simply.com`
   *(de præcise navne står i din Simply-konto — brug dem, der vises der).*
3. **DNSSEC:** lad Simply styre det automatisk. Hvis du har slået DNSSEC til manuelt et sted, og nøglerne ikke matcher, kan det give fejl — slå det fra, indtil domænet er live, og aktivér det først bagefter via Simply.

---

## Del 3 — Verificér at det virker

Når domænet er aktiveret, test:

**I browseren:** gå til `https://aevia.dk` (hård genindlæsning: Cmd+Shift+R).

**I terminalen (valgfrit):**
```bash
# Skal returnere en IP/navneserver uden SERVFAIL:
dig aevia.dk +short
dig NS aevia.dk +short
# Online-tjek:
# https://www.whatsmydns.net/  → indtast aevia.dk
```
Hvis `dig` ikke længere svarer SERVFAIL, er delegeringen i orden.

---

## Del 4 — Når domænet er live: sæt sitet online

Domænet i sig selv viser ikke hjemmesiden, før filerne er deployet. To muligheder:

- **Simply webhotel:** upload indholdet af mappen `Aevia Health/` til webhotellets rod (`public_html` / `www`) via filhåndtering eller FTP.
- **Vercel / Netlify / Cloudflare Pages:** deploy mappen, og peg `aevia.dk` på den (tilføj domænet i deres dashboard og følg deres DNS-anvisning).

Efter deploy:
- SSL/HTTPS aktiveres automatisk hos de fleste udbydere (Let's Encrypt) — giv det et par minutter.
- **Favicon:** lav en hård genindlæsning eller åbn i privat vindue — favicons caches hårdt.
- Husk at Cal.com-booking allerede peger på `cal.com/aevia` og virker uafhængigt af domænet.

---

## Hurtig tjekliste

- [ ] Mail fra Simply + Punktum.dk fundet
- [ ] ID-kontrol gennemført hos Punktum.dk (MitID)
- [ ] Domæne aktiveret
- [ ] Navneservere = Simply, DNSSEC håndteret af Simply
- [ ] Ventet ~1 time
- [ ] `dig aevia.dk` svarer uden SERVFAIL
- [ ] Site deployet til webhotel/host
- [ ] HTTPS + favicon tjekket med hård genindlæsning

---

## Hvis det stadig fejler efter aktivering

Skriv tilbage til Tom (Simply-supporten) med:
> "aevia.dk er nu aktiveret og ID-kontrolleret hos Punktum.dk, men resolver stadig SERVFAIL. Kan I bekræfte, at .dk-delegeringen til jeres navneservere er aktiv, og at DNSSEC-nøglerne (DS-records) matcher hos Punktum.dk?"

Det er de to ting, der typisk driller efter aktivering: at delegeringen ikke er slået igennem endnu, eller at DNSSEC-nøgler (DS) ikke matcher mellem Simply og Punktum.dk.
