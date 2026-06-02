#!/usr/bin/env node
/** @deprecated Use serve-static.mjs — kept for npm script compatibility */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const dir = process.env.COVERAGE_DIR || 'coverage';

const child = spawn(process.execPath, [join(ROOT, 'scripts/serve-static.mjs'), dir], {
  stdio: 'inherit',
  env: { ...process.env, SERVE_PORT: process.env.COVERAGE_PORT || '5500' },
});

child.on('exit', (code) => process.exit(code ?? 0));
