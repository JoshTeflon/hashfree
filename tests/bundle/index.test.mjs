/**
 * Bundle validity tests using Node's built-in test runner.
 * Run with: pnpm test:bundle
 *
 * These tests verify the built dist/ artifacts directly:
 *   - ESM build  (Vite dev server consumes native ESM — this is an equivalent check)
 *   - CJS build  (Node.js require())
 *   - sideEffects: false declared in package.json
 *
 * Bundle size (<2 kB gzipped) and tree-shaking (0 B for type-only imports)
 * are enforced separately via: pnpm test:size
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

test('ESM build: createSectionNav is exported as a function', async () => {
  const { createSectionNav } = await import(resolve(root, 'dist/index.mjs'));
  assert.strictEqual(typeof createSectionNav, 'function');
});

test('ESM build: no unexpected named exports', async () => {
  const mod = await import(resolve(root, 'dist/index.mjs'));
  const exports = Object.keys(mod).filter((k) => k !== 'default');
  assert.deepStrictEqual(exports.sort(), ['createSectionNav']);
});

test('CJS build: createSectionNav is exported via require()', () => {
  const require = createRequire(import.meta.url);
  const { createSectionNav } = require(resolve(root, 'dist/index.cjs'));
  assert.strictEqual(typeof createSectionNav, 'function');
});

test('CJS build: require() returns the same API shape as the ESM build', async () => {
  const require = createRequire(import.meta.url);
  const cjs = require(resolve(root, 'dist/index.cjs'));
  const esm = await import(resolve(root, 'dist/index.mjs'));

  const cjsExports = Object.keys(cjs).sort();
  const esmExports = Object.keys(esm).filter((k) => k !== 'default').sort();

  assert.deepStrictEqual(cjsExports, esmExports);
});

test('package.json declares sideEffects: false', async () => {
  const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.strictEqual(pkg.sideEffects, false,
    'sideEffects must be false so bundlers can tree-shake side-effect-free imports');
});
