// Lille DEV-server (ingen afhængigheder) der efterligner Vercel lokalt:
//   - serverer statiske filer fra repo-roden (admin-rapport.html, /assets/…)
//   - kører POST /api/classify-report via den bundlede motor
//
// KUN til lokal demo. Brug Vercel + rigtig ADMIN_TOKEN i produktion.
//   node lib/aevia-engine/dev-server.mjs   (kør fra repo-roden)
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = process.cwd();
const PORT = 4321;
const DEV_TOKEN = "dev"; // kun lokalt
process.env.ADMIN_TOKEN = DEV_TOKEN;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

// Generisk /api/<navn> → api/<navn>.js (default export), som Vercel.
const apiCache = {};
async function loadApi(name) {
  if (!/^[a-z0-9-]+$/.test(name)) return null;
  if (!apiCache[name]) {
    try { apiCache[name] = (await import(join(ROOT, "api/" + name + ".js"))).default; }
    catch { return null; }
  }
  return apiCache[name];
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith("/api/")) {
    const handler = await loadApi(url.pathname.slice(5));
    if (!handler) { res.statusCode = 404; res.end("404"); return; }
    let raw = "";
    for await (const chunk of req) raw += chunk;
    req.body = raw;
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
    try { await handler(req, res); } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
    return;
  }

  // statiske filer
  let p = url.pathname === "/" ? "/admin-rapport.html" : url.pathname;
  const path = normalize(join(ROOT, decodeURIComponent(p)));
  if (!path.startsWith(ROOT)) { res.statusCode = 403; res.end("nej"); return; }
  try {
    const data = await readFile(path);
    res.setHeader("Content-Type", MIME[extname(path)] || "application/octet-stream");
    res.end(data);
  } catch { res.statusCode = 404; res.end("404"); }
});

server.listen(PORT, () => {
  console.log(`Aevia DEV-server: http://localhost:${PORT}/  (admin-token: "${DEV_TOKEN}")`);
});
