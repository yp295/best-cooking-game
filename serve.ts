// DAPUR KILAT — server statis kecil untuk main lokal.
// Menyajikan game/ di http://localhost:8080 (Node 22, stdlib saja).

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';

const gameDir = join(fileURLToPath(new URL('.', import.meta.url)), 'game');
const PORT = 8080;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const file = join(gameDir, path === '/' ? 'index.html' : path);
  if (!file.startsWith(gameDir)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(PORT, () => {
  console.log(`Dapur Kilat di http://localhost:${PORT}`);
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  execFile(opener, [`http://localhost:${PORT}`], () => {});
});
