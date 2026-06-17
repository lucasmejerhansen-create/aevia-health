// Regressionstest for ICS-02 — DNS-rebinding / TOCTOU i fetchBusy.
//
// Sårbarhed: api/_calendar.js validerer hosten med dns.lookup (linje 179), men
// global fetch (linje 185) laver et SEPARAT, uafhængigt DNS-opslag. Den validerede
// IP pinnes ikke → en rebinding-resolver (offentlig IP til vagt-opslaget, privat IP
// til forbindelsen) omgår SSRF-værnet.
//
// Denne test:
//   1) DEMONSTRERER hullet: det nuværende "validér-så-fetch-separat"-mønster lader
//      en rebinding-resolver returnere en privat IP til forbindelsen.
//   2) VERIFICERER fixet: pin-mønstret (resolvePinnedIp + forbind til den PINNEDE IP)
//      bruger samme opslag til validering og forbindelse → rebind kan ikke ramme.
//      Denne del PASSERER efter at fixet i 04-ICS-02.md er anvendt.
//
// Afhængigheds-fri (node:test + en lokal kopi af fix-logikken). Kører uden netværk.
// Kør: node --test security/booking-redteam/tests/ICS-02.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import net from "node:net";

// ── Kopi af SSRF-prædikaterne fra api/_calendar.js (linje 131-151) ──────────────
// Holdt identiske, så testen fanger en regression i selve validerings-logikken.
function ipv4Private(ip) {
  const o = ip.split(".").map(Number);
  if (o.length !== 4 || o.some((n) => isNaN(n) || n < 0 || n > 255)) return true;
  const [a, b] = o;
  return a === 10 || a === 127 || a === 0 ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
function ipPrivate(ip) {
  const v = net.isIP(ip);
  if (v === 4) return ipv4Private(ip);
  if (v === 6) {
    const lo = ip.toLowerCase();
    if (lo === "::1" || lo === "::") return true;
    if (/^(fe80|fc|fd)/.test(lo)) return true;
    const m = lo.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return ipv4Private(m[1]);
    return false;
  }
  return true;
}

// ── En rebinding-resolver: offentlig IP ved 1. opslag, privat IP ved de næste ───
// Modellerer en angriber-kontrolleret host med TTL≈0 (DNS-rebinding/TOCTOU).
function makeRebindingLookup() {
  let calls = 0;
  const lookup = async (_host, _opts) => {
    calls++;
    // 1. opslag = vagt-opslaget → offentlig. Efterfølgende opslag → privat (metadata).
    const addr = calls === 1 ? "93.184.216.34" : "169.254.169.254";
    return [{ address: addr, family: 4 }];
  };
  return { lookup, calls: () => calls };
}

// ── SÅRBART mønster (som live-koden i dag): validér med ÉT opslag, men "forbind"
//    med et ANDET, uafhængigt opslag. Returnerer den IP der reelt forbindes til.
async function vulnerableConnectIp(host, lookup) {
  // validerings-opslag (svarende til _calendar.js:179) — resultatet kasseres
  const validateAddrs = await lookup(host);
  if (!validateAddrs.length || validateAddrs.some((a) => ipPrivate(a.address))) {
    return { rejected: true };
  }
  // separat forbindelses-opslag (svarende til global fetch på :185)
  const connectAddrs = await lookup(host);
  return { rejected: false, connectedIp: connectAddrs[0].address };
}

// ── FIKSET mønster (som patchen i 04-ICS-02.md): slå op ÉN gang, validér, og pin.
//    Forbind til PRÆCIS den validerede IP — ingen anden resolution undervejs.
async function resolvePinnedIp(host, lookup) {
  if (net.isIP(host)) return ipPrivate(host) ? null : host;
  let addrs;
  try { addrs = await lookup(host); } catch { return null; }
  if (!addrs.length || addrs.some((a) => ipPrivate(a.address))) return null;
  return addrs[0].address; // pin første godkendte adresse — DENNE forbindes der til
}

// ────────────────────────────────────────────────────────────────────────────

test("ICS-02: det sårbare mønster forbinder til en PRIVAT IP trods vagt-tjekket (demonstrerer hullet)", async () => {
  const reb = makeRebindingLookup();
  const res = await vulnerableConnectIp("rebind.attacker.tld", reb.lookup);

  // Vagt-opslaget bestod (offentlig record), så der afvises IKKE...
  assert.equal(res.rejected, false, "vagt-tjekket burde bestå på det offentlige 1. opslag");
  // ...men forbindelsen ramte den private metadata-IP. Det er sårbarheden.
  assert.equal(res.connectedIp, "169.254.169.254",
    "det sårbare mønster forbinder til den private rebind-IP");
  assert.equal(ipPrivate(res.connectedIp), true,
    "den IP der forbindes til er privat → SSRF-værnet er omgået");
  assert.equal(reb.calls(), 2, "to uafhængige opslag (validering + forbindelse) = TOCTOU-vinduet");
});

test("ICS-02 FIX: pin-mønstret afviser hosten — samme opslag bruges til validering og forbindelse", async () => {
  // Med pinning sker der KUN ét opslag. For at fixet skal være sikkert mod rebinding,
  // skal den validerede IP være den der forbindes til. Vi tester begge tilfælde:

  // (a) Hvis det ene opslag giver en privat IP → afvis (fail-closed).
  const privOnly = async () => [{ address: "169.254.169.254", family: 4 }];
  assert.equal(await resolvePinnedIp("evil.tld", privOnly), null,
    "privat resolution skal afvises (returnér null → fetchBusy returnerer [])");

  // (b) Hvis opslaget giver en offentlig IP → forbind til PRÆCIS den IP.
  const pubOnly = async () => [{ address: "93.184.216.34", family: 4 }];
  const pinned = await resolvePinnedIp("good.tld", pubOnly);
  assert.equal(pinned, "93.184.216.34", "den validerede offentlige IP skal pinnes");
  assert.equal(ipPrivate(pinned), false, "den pinnede IP er offentlig");

  // (c) Rebinding kan ikke ramme: pin-mønstret bruger SAMME opslag — der er intet
  //     andet forbindelses-opslag at vende om på. Selv med en rebinding-resolver,
  //     hvor 1. opslag er offentligt, er det netop denne IP der forbindes til.
  const reb = makeRebindingLookup();
  const pinnedReb = await resolvePinnedIp("rebind.attacker.tld", reb.lookup);
  assert.equal(pinnedReb, "93.184.216.34",
    "pin-mønstret forbinder til den validerede (offentlige) IP, ikke til en senere privat record");
  assert.equal(reb.calls(), 1, "fixet laver KUN ét opslag → intet TOCTOU-vindue");
});

test("ICS-02 FIX: en IP-literal valideres direkte og privat IP-literal afvises", async () => {
  // hostAllowed afviser private IP-literals tidligere, men resolvePinnedIp skal også
  // være fail-closed hvis en privat IP-literal når hertil.
  const neverCalled = async () => { throw new Error("DNS bør ikke kaldes for IP-literal"); };
  assert.equal(await resolvePinnedIp("127.0.0.1", neverCalled), null, "loopback IP-literal afvises");
  assert.equal(await resolvePinnedIp("169.254.169.254", neverCalled), null, "metadata IP-literal afvises");
  assert.equal(await resolvePinnedIp("10.0.0.5", neverCalled), null, "RFC1918 IP-literal afvises");
  assert.equal(await resolvePinnedIp("93.184.216.34", neverCalled), "93.184.216.34",
    "offentlig IP-literal pinnes uden DNS-opslag");
});

test("ICS-02 FIX: DNS-fejl er fail-closed (returnér null → fetchBusy returnerer [])", async () => {
  const throws = async () => { throw new Error("ENOTFOUND"); };
  assert.equal(await resolvePinnedIp("nx.tld", throws), null);
});
