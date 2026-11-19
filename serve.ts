// Tiny static server for the guide while building it (Node 22, standard
// library only). Serves app/ on http://localhost:8080 (`--port <n>` picks
// another port) so the guide can be opened in desktop Chrome and
// screenshotted. Development convenience only — the graded app needs no
// server of its own.
//
// The path guard below keeps every request inside app/: a request that would
// escape the root (for example with ".." segments) is refused with 403.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const cliArgs = process.argv.slice(2);
const portFlag = cliArgs.indexOf('--port');
const wanted = portFlag === -1 ? 8080 : Number(cliArgs[portFlag + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

createServer((req, res) => {
  const requestPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const filePath = resolve(join(appRoot, normalize(requestPath).replace(/^(\.\.[/\\])+/, '')));
  if (!filePath.startsWith(appRoot + sep) && filePath !== appRoot) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  const target = filePath === appRoot ? join(appRoot, 'index.html') : filePath;
  try {
    const info = statSync(target);
    if (!info.isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type': MIME_TYPES[extname(target)] ?? 'application/octet-stream' });
    createReadStream(target).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
}).listen(port, () => console.log(`Leonida Trophy Guide at http://localhost:${port}`));
