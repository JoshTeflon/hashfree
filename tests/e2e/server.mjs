import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const fixtureRoot = path.resolve(__dirname, './fixtures');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

const respond = (res, statusCode, body, contentType) => {
  res.writeHead(statusCode, {
    'content-type': contentType,
    'cache-control': 'no-store',
  });
  res.end(body);
};

const safeRead = async (root, requestPath) => {
  const normalized = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const resolved = path.resolve(root, `.${path.sep}${normalized}`);

  if (!resolved.startsWith(root)) {
    throw new Error('Forbidden path');
  }

  return fs.readFile(resolved);
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const pathname = decodeURIComponent(url.pathname);

    if (pathname.startsWith('/dist/')) {
      const body = await safeRead(projectRoot, pathname);
      const ext = path.extname(pathname);
      respond(res, 200, body, mimeTypes[ext] ?? 'application/octet-stream');
      return;
    }

    if (pathname === '/index.html') {
      const body = await safeRead(fixtureRoot, '/index.html');
      respond(res, 200, body, 'text/html; charset=utf-8');
      return;
    }

    const body = await safeRead(fixtureRoot, '/index.html');
    respond(res, 200, body, 'text/html; charset=utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    respond(res, 404, `Not found: ${message}`, 'text/plain; charset=utf-8');
  }
});

server.listen(4173, '127.0.0.1', () => {
  console.log('E2E server running at http://127.0.0.1:4173');
});
