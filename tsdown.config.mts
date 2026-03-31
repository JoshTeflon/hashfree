import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    sourcemap: true,
  },
  sourcemap: true,
  clean: true,
  minify: true,
  target: 'es2017',
});