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

const { default: classifyHandler } = await import(join(ROOT, "api/classify-report.js"));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon" };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/classify-report") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    req.body = raw;
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); return res; };
    res.setHeader2 = res.setHeader.bind(res);
    try { await classifyHandler(req, res); } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })); }
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
