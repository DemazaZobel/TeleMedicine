#!/usr/bin/env node
/**
 * Serve a static directory over HTTP (for coverage / Allure HTML reports).
 * Usage:
 *   node scripts/serve-static.mjs coverage
 *   node scripts/serve-static.mjs coverage/lcov-report
 *   node scripts/serve-static.mjs allure-report
 */
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, normalize } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dirArg = process.argv[2] || process.env.SERVE_DIR || 'coverage';
const STATIC_DIR = join(ROOT, dirArg);
const INDEX_HTML = join(STATIC_DIR, 'index.html');
const PORT = Number(process.env.SERVE_PORT || 5500);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

if (!existsSync(INDEX_HTML)) {
  console.error(`${dirArg}/index.html not found.`);
  process.exit(1);
}

function safePath(urlPath) {
  const relative = normalize(urlPath === '/' ? '/index.html' : urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const resolved = join(STATIC_DIR, relative);
  if (!resolved.startsWith(STATIC_DIR)) {
    return null;
  }
  return resolved;
}

const server = createServer((req, res) => {
  const filePath = safePath((req.url || '/').split('?')[0]);
  if (!filePath || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  res.end(readFileSync(filePath));
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}/index.html`;
  console.log(`Serving ${dirArg}: ${url}`);
  console.log('Press Ctrl+C to stop.');

  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
  }
});

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
