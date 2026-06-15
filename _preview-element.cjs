const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, 'kosttilskud-forslag');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.json':'application/json', '.md':'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/' || p === '') p = '/forslag-3-element.html';
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': types[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8123, () => console.log('preview on 8123'));
